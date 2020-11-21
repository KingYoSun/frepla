<template>
    <v-container fluid style="max-width: 800px;">
        <v-row justify="center" align="center">
            <v-card
            width="100%"
            max-width="800"
            min-width="330"
            >
                <v-card-title class="headline">
                    ホーム
                </v-card-title>
                <v-card-text>
                    <v-form ref="formMessage" @submit.prevent>
                        <v-row justify="center">
                            <v-avatar
                            color="indigo"
                            size="60"
                            class="ml-2"
                            >
                                <v-icon dark v-if="!myProfile.showPreviewImg">mdi-account-circle</v-icon>
                                <v-img
                                :src="myProfile.imgPreview"
                                v-if="myProfile.showPreviewImg"
                                alt="ユーザアイコン"
                                @error="removeImg"
                                class="profileIcon"
                                :max-width="60"
                                />
                            </v-avatar>
                            <v-textarea
                            outlined
                            rows="4"
                            v-model="messageInputBox"
                            ref="messageBox"
                            class="mx-2"
                            label="いまなにしてる？"
                            :rules="[required]"
                            :disabled="messageInputBoxDisable"
                            >
                            </v-textarea>
                        </v-row>
                        <v-row justify="end">
                            <v-btn
                            color="primary"
                            dark
                            class="mr-4"
                            :disabled="sendButtonDisable"
                            @click="validation"
                            >
                            POST
                            </v-btn>
                        </v-row>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-row>
        <div v-if="selectedTimeline === 'posts'" class="mt-4">
            <div v-for="post in posts" :key="post.id">
                <div v-if="post.replyToId != null && post.replyToId != undefined && post.replyToId != ''" style="position: relative;">
                    <post
                    :ref="'post-' + post.replyToPost.id"
                    :post="post.replyToPost"
                    :showButtons="true"
                    @reply="setReply"
                    @delete="deletePost"
                    @rePost="rePost"
                    @removeRePost="removeRePost"
                    @addLike="addLike"
                    @removeLike="removeLike"
                    />
                    <v-icon color="grey darken-2" style="position: absolute; bottom: 0px; left: 10px;">mdi-dots-vertical</v-icon>
                </div>
                <post
                :ref="'post-' + post.id"
                :post="post"
                :showButtons="true"
                @reply="setReply"
                @delete="deletePost"
                @rePost="rePost"
                @removeRePost="removeRePost"
                @addLike="addLike"
                @removeLike="removeLike"
                />
                <div v-if="post.replyFromId != null && post.replyFromId != undefined && post.replyFromId.length > 0" style="position: relative;">
                    <v-icon color="grey darken-2" style="position: absolute; top: -30px; left: 10px;">mdi-dots-vertical</v-icon>
                    <post
                    :ref="'post-' + post.replyFromPost.id"
                    :post="post.replyFromPost"
                    :showButtons="true"
                    @reply="setReply"
                    @delete="deletePost"
                    @rePost="rePost"
                    @removeRePost="removeRePost"
                    @addLike="addLike"
                    @removeLike="removeLike"
                    />
                </div>
                <v-divider />
            </div>
        </div>
        <v-dialog
        v-model="dialogReply"
        max-width="600"
        >
            <v-card>
                <v-card-title class="justify-start">返信する</v-card-title>
                <v-list-item>
                    <post
                    ref="replyPost"
                    :post="replyToPost"
                    :showButtons="false"
                    />
                </v-list-item>
                <v-divider />
                <v-list-item>
                    <h4>@{{ replyToPost.name }} さんに返信</h4>
                </v-list-item>
                <v-list-item>
                    <v-textarea
                    outlined
                    rows="4"
                    v-model="messageInputBox"
                    ref="messageBox"
                    class="mx-2"
                    label="おへんじ"
                    :rules="[required]"
                    :disabled="messageInputBoxDisable"
                    >
                    </v-textarea>
                </v-list-item>
                <v-list-item-action class="mt-0">
                    <v-btn
                    color="primary"
                    dark
                    :disabled="sendButtonDisable"
                    @click="validation"
                    >
                    POST
                    </v-btn>
                </v-list-item-action>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import TwitterText from 'twitter-text'
import API, { graphqlOperation } from '@aws-amplify/api'
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'
import * as Common from '~/assets/js/common.js'
import { MyDatabase } from '~/assets/ts/myDatabase.ts'
import Post from '~/components/post.vue'

export default {
    components: {
        Logo,
        VuetifyLogo,
        Post
    },
    data () {
        return {
            currentUserInfo: {},
            myProfile: {
                id: "",
                name: "",
                viewName: "",
                imgURL: null,
                showPreviewImg: false,
                imgPreview: null
            },
            messages: [],
            friendList: [],
            required: value => !!value || "必須事項です",
            messageInputBox: "",
            messageInputBoxDisable: false,
            sendButtonDisable: false,
            db: null,
            myPosts: [],
            posts: [],
            config: {},
            selectedTimeline: 'posts',
            replyToId: "",
            dialogReply: false,
            replyToPost: {},
            offset: 0,
        }
    },
    async mounted () {
        if(this.$store.state.db == null) this.$store.commit("newDB")
        this.db = this.$store.state.db
        this.db.open()
        const self = this
        this.db.posts.hook("updating",function(mods, primKey, obj, trans) {
            trans.on("complete", function() {
                self.setPost(self.offset)
            })
        })
        this.db.posts.hook("creating",function(primKey, obj, trans) {
            console.log(self)
            trans.on("complete", function() {
                self.setPost(self.offset)
            })
        })
        
        this.getCurrentUserInfo()
         .then(async () => this.getProfile())
         .then(async () => {
             this.setPost(this.offset)
             this.setMyPost(this.offset)
             if (this.$store.state.friendList === undefined) {
                const followList = await Common.getFollowList(this.$store.state.currentUserInfo.attributes.sub, 'follow')
                this.$store.commit("setFollowList", followList)
                const followerList = await Common.getFollowerList(this.$store.state.currentUserInfo.attributes.sub, 'follow')
                this.$store.commit("setFollowerList", followerList)
                this.$store.commit("setFriendList")
            }
            this.friendList = this.$store.state.friendList
         })
    },
    computed: {
        toUsers () {
            return TwitterText.extractMentions(this.messageInputBox)
        }
    },
    methods: {
        async getCurrentUserInfo () {
            this.currentUserInfo = this.$store.state.currentUserInfo
            if (!this.currentUserInfo) {
                this.currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
                this.$store.commit('login', this.currentUserInfo)
            }
        },
        removeImg () {
            this.$store.commit("removeImg")
        },
        validation () {
            try {
                if(!this.$refs.formMessage.validate()) {
                    throw "ExceptionOccured"
                }
                this.putMyPosts()
            } catch (e) {
                console.log(e)
            }
        },
        async getPost (id) {
            return await this.db.posts.where("id")
                                        .equals(id)
                                        .first()
        },
        setPost (offset) {
            this.db.posts.orderBy("updatedAt")
                        .desc()
                        .offset(offset)
                        .limit(20)
                        .toArray(async (posts) => {
                            posts = await Promise.all(posts.map(async (post) => {
                                if (post.replyToId != null && post.replyToId != undefined && post.replyToId != '') {
                                    post.replyToPost = await this.getPost(post.replyToId)
                                }
                                if (post.replyFromId != null && post.replyFromId != undefined && post.replyFromId.length > 0) {
                                    post.replyFromPost = await this.getPost(post.replyFromId.slice(-1)[0])
                                }
                                return post
                            }))
                            this.posts = posts
                        })
        },
        setMyPost (offset) {
            this.db.myPosts.orderBy("updatedAt")
                            .desc()
                            .offset(offset)
                            .limit(20)
                            .toArray(async (posts) => {
                                posts = await Promise.all(posts.map(async (post) => {
                                    if (post.replyToId != null && post.replyToId != undefined && post.replyToId != '') {
                                        post.replyToPost = await this.getPost(post.replyToId)
                                    }
                                    if (post.replyFromId != null && post.replyFromId != undefined && post.replyFromId.length > 0) {
                                        post.replyFromPost = await this.getPost(post.replyFromId.slice(-1)[0])
                                    }
                                    return post
                                }))
                                this.myPosts = posts
                            })
        },
        async putMyPosts () {
            this.db.transaction("rw", this.db.posts, this.db.myPosts, () => {
                const id =this.myProfile.name + '-' + String(Common.getNow())
                const post = {
                    id: id,
                    name: this.myProfile.name,
                    viewName: this.myProfile.viewName,
                    userId: this.currentUserInfo.attributes.sub,
                    text: this.messageInputBox.replace(/\n/g,'\\n'),
                    files: [],
                    createdAt: Common.getNow(),
                    updatedAt: Common.getNow(),
                    toUsers: this.toUsers,
                    replyToId: this.replyToId,
                    like: [],
                    rePost: []
                }
                this.db.posts.add(post)
                this.db.myPosts.add(post)
                if (this.replyToId !== "") {
                    if ('replyFromId' in this.replyToPost && this.replyToPost.replyFromId.length > 0) {
                        this.replyToPost.replyFromId.push(id)
                    }
                    const replyFromId = (Array.isArray(this.replyToPost.replyFromId) && this.replyToPost.replyFromId.length > 0)?  this.replyToPost.replyFromId : [id]
                    this.db.posts.update(this.replyToId, {
                        replyFromId: replyFromId,
                        updatedAt: Common.getNow()
                    })
                }
            }).then(() => {
                console.log('Posted!')
                this.messageInputBox = ""
                this.dialogReply = false
                this.replyToId = ""
                this.setPost(this.offset)
                this.setMyPost(this.offset)
            }).catch((e) => {
                console.log('Posting failed: ' + e)
            })
        },
        setReply (targetPost) {
            this.messageInputBox = "@" + targetPost.name + this.messageInputBox
            this.replyToId = targetPost.id
            this.replyToPost = targetPost
            this.dialogReply = true
        },
        deletePost (targetPost) {
            this.db.transaction("rw", this.db.posts, this.db.myPosts, async () => {
                if (targetPost.replyToId != undefined && targetPost.replyToId != null && targetPost.replyToId != "") {
                    const delPost = await this.getPost(targetPost.replyToId)
                    const replyFromId = delPost.replyFromId.filter((id) => {
                        return id != targetPost.id
                    })
                    this.db.posts.update(targetPost.replyToId, {
                        replyFromId: replyFromId,
                        updatedAt: Common.getNow()
                    })
                }
                if (targetPost.replyFromId != undefined && targetPost.replyFromId != null && targetPost.replyFromId.length > 0) {
                    targetPost.replyFromId.map((post) => {
                        this.db.posts.update(post.id, {
                            replyToId: null,
                            updatedAt: Common.getNow()
                        })
                    })
                }
                this.db.posts.delete(targetPost.id)
                if (targetPost.userId == this.currentUserInfo.attributes.sub) {
                    this.db.myPosts.delete(targetPost.id)
                }
            }).then(() => {
                console.log('Post Deleted!')
                this.setPost(this.offset)
                this.setMyPost(this.offset)
            }).catch((e) => {
                console.log('Deleting Post is Failed: ' + e)
            })
        },
        rePost (targetPost) {
            this.db.transaction("rw", this.db.posts, this.db.myPosts, () => {
                if (!targetPost.rePost.includes(this.currentUserInfo.attributes.sub)) {
                    targetPost.rePost.push(this.currentUserInfo.attributes.sub)
                    this.db.posts.update(targetPost.id, {
                        rePost: targetPost.rePost,
                        updatedAt: Common.getNow()
                    })
                    if (targetPost.userId == this.currentUserInfo.attributes.sub) {
                        this.db.myPosts.update(targetPost.id, {
                            rePost: targetPost.rePost,
                            updatedAt: Common.getNow()
                        })
                    } else {
                        this.db.myPosts.put(targetPost)
                    }
                }
            }).then(() => {
                console.log('rePost!')
                this.setPost(this.offset)
                this.setMyPost(this.offset)
            }).catch((e) => {
                console.log('rePost is Failed: ' + e)
            })
        },
        removeRePost (targetPost) {
            this.db.transaction("rw", this.db.posts, this.db.myPosts, () => {
                if (targetPost.rePost.includes(this.currentUserInfo.attributes.sub)) {
                    const rePostFiltered = targetPost.rePost.filter((id) => {
                        return id != this.currentUserInfo.attributes.sub
                    })
                    this.db.posts.update(targetPost.id, {
                        rePost: rePostFiltered,
                        updatedAt: Common.getNow()
                    })
                    if (targetPost.userId == this.currentUserInfo.attributes.sub) {
                        this.db.myPosts.update(targetPost.id, {
                            rePost: rePostFiltered,
                            updatedAt: Common.getNow()
                        })
                    } else {
                        this.db.myPosts.delete(targetPost.id)
                    }
                }
            }).then(() => {
                console.log('remove rePost!')
                this.setPost(this.offset)
                this.setMyPost(this.offset)
            }).catch((e) => {
                console.log('Removing rePost is Failed: ' + e)
            })
        },
        addLike (targetPost) {
            this.db.transaction("rw", this.db.posts, this.db.myPosts, () => {
                if (!targetPost.like.includes(this.currentUserInfo.attributes.sub)) {
                    targetPost.like.push(this.currentUserInfo.attributes.sub)
                    this.db.posts.update(targetPost.id, {
                        like: targetPost.like,
                        updatedAt: Common.getNow()
                    })
                    if (targetPost.userId == this.currentUserInfo.attributes.sub) {
                        this.db.myPosts.update(targetPost.id, {
                            like: targetPost.like,
                            updatedAt: Common.getNow()
                        })
                    }
                }
            }).then(() => {
                console.log('like!')
                this.setPost(this.offset)
                this.setMyPost(this.offset)
            }).catch((e) => {
                console.log('Adding like is Failed: ' + e)
            })
        },
        removeLike (targetPost) {
            this.db.transaction("rw", this.db.posts, this.db.myPosts, () => {
                if (targetPost.like.includes(this.currentUserInfo.attributes.sub)) {
                    const likeFiltered = targetPost.like.filter((id) => {
                        return id != this.currentUserInfo.attributes.sub
                    })
                    this.db.posts.update(targetPost.id, {
                        like: likeFiltered,
                        updatedAt: Common.getNow()
                    })
                    if (targetPost.userId == this.currentUserInfo.attributes.sub) {
                        this.db.myPosts.update(targetPost.id, {
                            like: likeFiltered,
                            updatedAt: Common.getNow()
                        })
                    }
                }
            }).then(() => {
                console.log('remove like!')
                this.setPost(this.offset)
                this.setMyPost(this.offset)
            }).catch((e) => {
                console.log('Removing like is Failed: ' + e)
            })
        },
        async getProfile () {
            await this.getCurrentUserInfo()
            const getProfile = `
                query GetProfile {
                    getProfile(id: "${this.currentUserInfo.attributes.sub}") {
                        id
                        name
                        viewName
                        iconUrl
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(getProfile))
                    .then(async (res) => {
                        const items = res.data.getProfile
                        if (items == null || items == undefined || items == []) {
                            throw "Profile not found"
                        }
                        this.myProfile.id = items.id
                        this.myProfile.name = items.name
                        this.myProfile.viewName = items.viewName
                        this.myProfile.imgURL = items.iconUrl
                        this.myProfile.imgPreview = this.$store.state.imgPreview
                        if (this.myProfile.imgPreview === null || this.myProfile.imgPreview === undefined) {
                            Common.setImgFile(this.myProfile)
                        } else {
                            this.myProfile.showPreviewImg = true
                        }
                    })
            } catch (e) {
                console.log("Profile not found: " + e)
                this.createProfile(this.currentUserInfo)
            }
        },
    },
    middleware: 'auth'
}
</script>
