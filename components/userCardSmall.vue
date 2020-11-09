<template>
    <div class="user-banner-wrapper-small" :style="{ backgroundImage: 'url(' + banner.imgPreview + ')' }">
        <div class="user-banner-container-small">
            <v-row class="user-info-first-small">
                <div class="user-link-image-small">
                    <v-img
                    :src="icon.imgPreview"
                    alt="アイコンのプレビュー"
                    @error="resetImgURL(icon)"
                    class="user-image-small"
                    :max-width="100"
                    />
                </div>
                <div class="user-link-small">
                    <div class="user-name-box-small">
                        <h1>{{ user.viewName }}</h1>
                        <h2>@{{ user.name }}</h2>
                        <h2
                        v-if="user.followedMe === 'follow' && user.status !== 'follow'"
                        class="mt-2"
                        >
                            <span
                            style="background-color: rgba(0, 0, 0, 0.6);border-radius: 6px;"
                            class="px-1 py-1"
                            >
                                フォローされています
                            </span>
                        </h2>
                        <h2
                        v-if="user.followedMe === 'follow' && user.status === 'follow'"
                        class="mt-2"
                        >
                            <span
                            style="background-color: rgba(0, 0, 0, 0.6);border-radius: 6px;"
                            class="px-1 py-1"
                            >
                                相互フォロー
                            </span>
                        </h2>
                    </div>
                </div>
            </v-row>
            <v-row class="user-count-small">
                <div class="user-follow-count-small">
                    <h3>
                        フォロー: {{ user.followCount }}
                    </h3>
                </div>
                <div class="user-follower-count-small">
                    <h3>
                        フォロワー: {{ user.followerCount }}
                    </h3>
                </div>
            </v-row>
            <v-row class="my-2">
                <div class="ml-4">
                    <v-btn
                    v-if="user.status !== 'follow'"
                    color="primary"
                    class="mx-2"
                    :disabled="user.status === 'block' || disableBtn"
                    @click="updateFriend('follow')"
                    >
                    フォローする
                    </v-btn>
                    <v-btn
                    v-if="user.status === 'follow'"
                    color="teal"
                    class="mx-2"
                    :disabled="user.status === 'block' || disableBtn"
                    @click="deleteFriend('follow', 'to')"
                    >
                    フォロー解除
                    </v-btn>
                </div>
                <div>
                    <v-btn
                    v-if="user.status !== 'block'"
                    color="red"
                    class="mx-2"
                    :disabled="disableBtn"
                    @click="updateFriend('block')"
                    >
                    ブロックする
                    </v-btn>
                    <v-btn
                    v-if="user.status === 'block'"
                    color="amber"
                    class="mx-2"
                    :disabled="disableBtn"
                    @click="deleteFriend('block', 'to')"
                    >
                    ブロック解除
                    </v-btn>
                </div>
            </v-row>
            <div class="user-description-small">
                <!-- eslint-disable-next-line -->
                <p id="user-description-small" v-html="autoLink" />
            </div>
        </div>
    </div>
</template>

<script>
import TwitterText from 'twitter-text'
import API, { graphqlOperation } from '@aws-amplify/api'
import Storage from '@aws-amplify/storage'

export default {
    name: 'UserCardSmall',
    data () {
        return {
            styleGridSpan: '',
            icon: {
                name: "icon",
                imgURL: null,
                imgFile: null,
                imgType: null,
                imgPreview: null,
                showPreviewImg: false,
            },
            banner: {
                name: "banner",
                imgURL: null,
                imgFile: null,
                imgType: null,
                imgPreview: null,
                showPreviewImg: false,
            },
            disableBtn: false
        }
    },
    props: {
        user: {
            type: Object,
            default () {
                return {
                    id: "",
                    viewName: '',
                    name: '',
                    banner: '',
                    description: '',
                    iconUrl: '',
                    url: '',
                    identityId: "",
                    followCount: 0,
                    followerCount: 0,
                    followedMe: "",
                    status: ""
                }
            }
        },
    },
    computed: {
        autoLink () {
            return TwitterText.autoLink(String(this.user.description), {
                targetBlank: true
            })
        }
    },
    methods: {
        failed (e, message) {
            console.log(e)
            alert(message)
            this.overlay = false
        },
        resetImgURL (obj) {
                obj.showPreviewImg = false
                obj.imgURL = null
                obj.imgFile = null
        },
        setImgUrlIcon () {
            this.icon.imgURL = this.user.iconUrl
            this.setImgFile(this.icon)
        },
        setImgUrlBanner () {
            this.banner.imgURL = this.user.banner
            this.setImgFile(this.banner)
        },
        async setImgFile (obj) {
            if (obj.imgURL !== null && obj.imgURL !== 'null' && this.user.identityId !== null) {
                try {
                        await Storage.get(obj.imgURL, {
                            level: 'protected',
                            identityId: this.user.identityId
                        }).then((res) => {
                                        obj.imgPreview = res
                                        obj.showPreviewImg = true
                                })
                                .catch((e) => {
                                        console.log("Getting Image Failed: " + e)
                                })
                } catch (e) {
                        console.log("Getting Image Failed: " + e)
                }
            }
        },
        async editFollowCount (diffDirection, user) {
            const id = (user === "me") ? this.$store.state.currentUserInfo.attributes.sub : this.user.id
            const followCount = (user === "me") ? this.$store.state.followCount : this.user.followCount
            const diff = (followCount <= 0 && diffDirection < 0) ? 0 : diffDirection
            const updateProfile = `
                mutation UpdateProfile {
                    updateProfile(input: {
                        id: "${id}",
                        followCount: ${followCount + diff},
                    }) {
                        id
                        followCount
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(updateProfile))
                    .then((res) => {
                        if (user === "me") {
                            if (diff > 0) {
                                this.$store.commit('followCountIncrement')
                            } else if (diff < 0) {
                                this.$store.commit('followCountDecrement')
                            }
                        } else {
                            this.user.followCount += diff
                        }
                        console.log("Changed Follow Count")
                    })
            } catch (e) {
                console.log("Changing Follow Count is Failed: " + e)
            }
        },
        async editFollowerCount (diffDirection, user) {
            const id = (user === "me") ? this.$store.state.currentUserInfo.attributes.sub : this.user.id
            const followerCount = (user === "me") ? this.$store.state.followerCount : this.user.followerCount
            const diff = (followerCount <= 0 && diffDirection < 0) ? 0 : diffDirection
            const updateProfile = `
                mutation UpdateProfile {
                    updateProfile(input: {
                        id: "${id}",
                        followerCount: ${followerCount + diff},
                    }) {
                        id
                        followerCount
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(updateProfile))
                    .then((res) => {
                        if (user === "me") {
                            if (diff > 0) {
                                this.$store.commit('followerCountIncrement')
                            } else if (diff < 0) {
                                this.$store.commit('followerCountDecrement')
                            }
                        } else {
                            this.user.followerCount += diff
                        }
                        console.log("Changed Follower Count")
                        this.disableBtn = false
                    })
            } catch (e) {
                console.log("Changing Follower Count is Failed: " + e)
                this.disableBtn = false
            }
        },
        async updateFriend (status) {
            this.disableBtn = true
            if (this.user.status) {
                await this.deleteFriend(this.user.status, "to")
            }
            this.disableBtn = true
            let createFriend = `
                mutation CreateFriend {
                    createFriend(input: {
                        id: "${this.$store.state.currentUserInfo.attributes.sub}",
                        status: "${status}",
                        toUserId: "${this.user.id}"
                    }) {
                        id
                        status
                        toUserId
                        createdAt
                        updatedAt
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(createFriend))
                    .then(async (res) => {
                        if (status === "follow") {
                            this.editFollowCount(1, "me")
                            this.editFollowerCount(1, "user")
                            this.$store.commit("addFollowList", this.user.id)
                        }
                        if (status === 'block') {
                            this.$store.commit("removeFollowList", this.user.id)
                            if (this.user.followedMe === 'follow'){
                                await this.deleteFriend('follow', 'from')
                                this.user.followedMe = null
                            }
                        }
                        this.$store.commit("setFriendList")
                        this.user.status = status
                        console.log("Updating Friend Relation Succeeded")
                    })
            } catch (e) {
                this.failed(e, "フレンド情報の更新に失敗しました")
            }
        },
        async deleteFriend (status, direction) {
            const id = (direction === "to") ? this.$store.state.currentUserInfo.attributes.sub : this.user.id
            const toUserId = (direction === "to") ? this.user.id : this.$store.state.currentUserInfo.attributes.sub
            this.disableBtn = true
            const delFriend = `
                mutation DeleteFriend{
                    deleteFriend(input: {
                        id: "${id}",
                        status: "${status}"
                    }, condition: {
                        toUserId: {
                            eq: "${toUserId}"
                        }
                    }) {
                        id
                        status
                        toUserId
                        createdAt
                        updatedAt
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(delFriend))
                    .then((res) => {
                        console.log("Deleting Friend Relation Succeeded")
                        if (status === "follow" && direction === "to") {
                            this.editFollowCount(-1, "me")
                            this.editFollowerCount(-1, "user")
                            this.$store.commit("removeFollowList", this.user.id)
                        } else if (status === 'follow' && direction === "from") {
                            this.editFollowCount(-1, "user")
                            this.editFollowerCount(-1, "me")
                            this.$store.commit("removeFollowerList", this.user.id)
                        } else {
                            this.disableBtn = false
                        }
                        this.$store.commit("setFriendList")
                        this.user.status = null
                    })
            } catch (e) {
                this.failed(e, "フレンド情報の更新に失敗しました")
            }
        }
    }
}
</script>
<style>
.user-banner-wrapper-small {
    margin-top: 5px;
    background-size: cover;
    display: flex;
    align-items: center;
    border-radius: 10px;
    box-shadow: 3px 3px 10px #000, -3px -3px 10px #000;
}
.user-banner-container-small {
    width: 100%;
    max-width: 900px;
    background-color: rgba(0, 0, 0, 0.6);
}
.user-info-first-small {
    display: flex;
    align-items: center;
    padding: 3px 12px;
}
.user-image-small {
    max-width: 60px;
    width: 20vw;
    height: auto;
    border-radius: 50%;
    border: 3px var(--text-color-main) solid;
}
.user-link-small {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    text-decoration: none;
    padding: 5px;
}
.user-link-small h1 {
    font-size: 1.0em;
    width: 14em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-color-main);
}
.user-link-small h1:hover {
    color: var(--text-color-main-hover);
}
.user-link-small h2 {
    font-size: 0.85em;
    width: 14em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-color-sub);
}
.user-link-small h2:hover {
    color: var(--text-color-sub-hover);
}
.user-count-small {
    display: flex;
    flex-wrap: nowrap;
    padding: 3px 20px;
}
.user-count-small div {
    font-size: 1.0em;
    text-align: center;
    margin: 0px 5px;
}
.user-follow-btn-small {
    white-space: nowrap;
    font-size: 1.0em;
    text-decoration: none;
    padding: 5px;
    color: white;
    background-color: var(--twitter-blue);
    border-radius: 15px;
    border: 2px var(--twitter-blue) solid;
}
.user-follow-btn-small:hover {
    background-color: rgba(255, 255, 255, 0.6);
    color: var(--twitter-blue);
}
.user-description-small {
    font-size: 0.8em;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    color: var(--text-color-p);
    padding: 3px 20px;
}
.user-description-small a {
    text-decoration: none;
    color: var(--text-color-main-hover);
}
.user-description-small a:hover {
    color: gray;
}
</style>