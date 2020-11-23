<template>
    <div class="my-2">
        <v-row>
            <div v-if="Array.isArray(post.rePost) && post.rePost.includes($store.state.currentUserInfo.attributes.sub)">
                <v-icon color="grey darken-2">mdi-cached</v-icon><span class="font-weight-bold" style="color: #5a5a5a;">リポストしました</span>
            </div>
            <div v-if="Array.isArray(post.like) && post.like.includes($store.state.currentUserInfo.attributes.sub)" class="ml-2">
                <v-icon color="grey darken-2">mdi-heart</v-icon><span class="font-weight-bold" style="color: #5a5a5a;">いいねしました</span>
            </div>
        </v-row>
        <v-row justify="start" align="start">
            <div v-if="user.showPreviewImg" class="mx-1">
                <v-img
                :src="user.imgPreview"
                alt="アイコンのプレビュー"
                @error="resetImgURL(post)"
                class="user-image-mid"
                :max-width="60"
                />
            </div>
            <div class="ml-4">
                <v-row justify="start">
                    <h4>{{ post.viewName }}</h4>
                    <span style="color: gray;">@{{ post.name }}</span>
                </v-row>
                <v-row justify="start" class="mt-1">
                    <span class="description" v-html="showTxt" />
                </v-row>
                <v-row v-if="showButtons" justify="start">
                    <post-buttons
                    :post="post"
                    @delete="deletePost"
                    @reply="setReply"
                    @rePost="rePost"
                    @removeRePost="removeRePost"
                    @addLike="addLike"
                    @removeLike="removeLike"
                    />
                </v-row>
            </div>
        </v-row>
    </div>
</template>

<script>
import TwitterText from 'twitter-text'
import API, { graphqlOperation } from '@aws-amplify/api'
import * as Common from '~/assets/js/common.js'
import { MyDatabase } from '~/assets/ts/myDatabase.ts'
import PostButtons from '~/components/postButtons.vue'

export default {
    name: "Post",
    components: {
        PostButtons
    },
    data () {
        return {
            origin: window.location.origin + '/',
            db: null,
            user: {
                show: false,
                name: "",
                viewName: "",
                identityId: null,
                imgURL: null,
                imgPreview: null,
                showPreviewImg: false,
            },
        }
    },
    props: {
        post: {
            type: Object,
            default () {
                return {
                    id: "",
                    name: "",
                    viewName: "",
                    userId: "",
                    text: "",
                    files: [],
                    createdAt: 0,
                    updatedAt: 0,
                    replyToId: "",
                    replyToPost: {},
                    replyFromId: [],
                    like: [],
                    rePost: []
                }
            }
        },
        showButtons: true,
    },
    computed: {
        showTxt () {
            return this.autoLink(this.post.text)
        }
    },
    async mounted () {
        this.getProfile(this.post, this.user)
    },
    methods: {
        autoLink (text) {
            return TwitterText.autoLink(String(text.replace(/\\n/g, '\n')), {
                usernameUrlBase: this.origin,
                hashtagUrlBase: this.origin,
                targetBlank: true
            })
        },
        setReply (post) {
            this.$emit("reply", post)
        },
        deletePost (post) {
            this.$emit("delete", post)
        },
        rePost (post) {
            this.$emit("rePost", post)
        },
        removeRePost (post) {
            this.$emit("removeRePost", post)
        },
        addLike (post) {
            this.$emit("addLike", post)
        },
        removeLike (post) {
            this.$emit("removeLike", post)
        },
        async getProfile (post, user) {
            const getProfile = `
                query GetProfile {
                    getProfile(id: "${post.userId}") {
                        id
                        name
                        viewName
                        iconUrl
                        identityId
                        createdAt
                        updatedAt
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(getProfile))
                    .then((res) => {
                        const items = res.data.getProfile
                        if (items != null && items != undefined && items != "" && items != {}) {
                            user.viewName = ("viewName" in items) ? items.viewName : ""
                            user.name= ("name" in items) ? items.name : ""
                            user.imgURL = ("iconUrl" in items) ? items.iconUrl : null
                            user.identityId = ("identityId" in items) ? items.identityId : null
                            Common.setImgFileUser(user, user.identityId)
                        }
                    })
            } catch (e) {
                console.log(e)
            }
        }
    }
}
</script>