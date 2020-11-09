<template>
    <v-container fluid style="max-width: 800px;">
        <custom-overlay :overlay="overlay" />
        <custom-dialog
        :dialog="showDialog"
        :message="dialogMessage"
        :cancel="false"
        @agree="showDialog = !showDialog"
        />
        <v-form ref="search" @submit.prevent>
            <v-row justify="start" class="my-2">
                <h2>{{ categoryTxt }}</h2>
            </v-row>
            <v-row justify="end">
                <v-radio-group
                v-model="category"
                row
                @change="changeCategory"
                >
                    <v-radio
                    label="相互フォロー"
                    value="friends"
                    />
                    <v-radio
                    label="フォロー"
                    value="follow"
                    />
                    <v-radio
                    label="フォロワー"
                    value="follower"
                    />
                </v-radio-group>
            </v-row>
        </v-form>
        <div class="user-list">
            <div v-for="(user, $index) in users" :id="'userContainer-' + user.name" :key="$index" class="my-6">
                <user-card-small :ref="'userCardSmall-' + user.id" :user="user" />
            </div>
        </div>
        <infinite-loading ref="infiniteLoading" :identifier="infiniteId" @infinite="infiniteHandler" />
        <v-row justify="start" class="mt-6">
            <v-btn
                color="teal"
                dark
                nuxt
                to="/profile"
                >
                戻る
            </v-btn>
        </v-row>
    </v-container>
</template>

<script>
import API, { graphqlOperation } from '@aws-amplify/api'
import InfiniteLoading from 'vue-infinite-loading'
import CustomOverlay from '~/components/overlay.vue'
import CustomDialog from '~/components/dialog.vue'
import UserCardSmall from '~/components/userCardSmall.vue'
import * as Common from '~/assets/js/common.js'

export default {
    components: {
        CustomOverlay,
        CustomDialog,
        InfiniteLoading,
        UserCardSmall
    },
    data () {
        return {
            currentUserInfo: {},
            category: "friends",
            categoryTxt: "相互フォロー一覧",
            page: 1,
            overlay: false,
            showDialog: false,
            dialogMessage: "",
            queryKey: "",
            infiniteId: 0,
            users: [],
            showUsers: false,
            indexNum: 0,
            firstLoadFlag: false,
            required: value => !!value || "必須事項です",
        }
    },
    async created () {
        this.currentUserInfo = this.$store.state.currentUserInfo
        if (!this.currentUserInfo) {
            this.currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
            this.$store.commit('login', this.currentUserInfo)
        }
        await this.getFollowCount()
        const followList = await Common.getFollowList(this.currentUserInfo.attributes.sub, 'follow')
        this.$store.commit("setFollowList", followList)
        const followerList = await Common.getFollowerList(this.currentUserInfo.attributes.sub, 'follow')
        this.$store.commit("setFollowerList", followerList)
        this.$store.commit("setFriendList")
        this.changeCategory()
    },
    methods: {
        failed (e, message) {
            console.log(e)
            alert(message)
            this.overlay = false
        },
        async getFollowCount () {
            const getProfile = `
                query GetProfile {
                    getProfile(id: "${this.currentUserInfo.attributes.sub}") {
                        id
                        followCount
                        followerCount
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(getProfile))
                    .then((res) => {
                        const items = res.data.getProfile
                        const followCount = ("followCount" in items && items.followCount) ? items.followCount : 0
                        this.$store.commit('followCountLoading', followCount)
                        const followerCount = ("followerCount" in items && items.followerCount) ? items.followerCount : 0
                        this.$store.commit('followerCountLoading', followerCount)
                    })
            } catch (e) {
                console.log(e)
            }
        },
        changeCategory () {
            this.categoryTxt = (this.category === 'friends') ? "相互フォロー一覧" : this.categoryTxt
            this.categoryTxt = (this.category === 'follow') ? "フォロー一覧" : this.categoryTxt
            this.categoryTxt = (this.category === 'follower') ? "フォロワー一覧" : this.categoryTxt
            this.users = []
            this.indexNum = 0
            this.page = 0
            this.firstLoadFlag = true
            this.$refs.infiniteLoading.stateChanger.reset()
            this.infiniteId += 1
        },
        async infiniteHandler ($state) {
            if (!this.firstLoadFlag) {
                $state.complete()
                return false
            }
            let storeUsers = null
            storeUsers = (this.category === 'friends') ? this.$store.state.friendList : storeUsers
            storeUsers = (this.category === 'follow') ? this.$store.state.followList : storeUsers
            storeUsers = (this.category === 'follower') ? this.$store.state.followerList : storeUsers
            if (this.indexNum >= storeUsers.length || (this.page > 1 && this.users[-1].id === storeUsers[-1])) {
                this.indexNum--
                $state.complete()
            }
            let loadCount = 0
            let status = true
            const ids = []
            do {
                const getProfile = `
                    query GetProfile {
                        getProfile(id: "${storeUsers[this.indexNum]}") {
                            id
                            name
                            viewName
                            iconUrl
                            banner
                            url
                            identityId
                            description
                            followCount
                            followerCount
                            createdAt
                            updatedAt
                        }
                    }
                `
                try {
                    await API.graphql(graphqlOperation(getProfile))
                        .then(async (res) => {
                            const item = res.data.getProfile
                            item.status = await this.getStatus("to", item)
                            item.followedMe = await this.getStatus("from", item)
                            if (this.users.find(elem => elem.id === item.id) === undefined && item.id !== this.currentUserInfo.attributes.sub && item.followedMe !== "block") {
                                this.users.push(item)
                                ids.push(item.id)
                            }
                            loadCount++
                            this.indexNum++
                        })
                } catch (e) {
                    this.failed(e, "リストの読み込みに失敗しました")
                    status = false
                    $state.complete()
                }
            } while(status && loadCount < 20 && this.indexNum < storeUsers.length)
            $state.loaded()
            this.page += 1
            for (const id of ids) {
                if (id !== this.currentUserInfo.attributes.sub) {
                    this.$refs['userCardSmall-' + id][0].setImgUrlIcon()
                    this.$refs['userCardSmall-' + id][0].setImgUrlBanner()
                }
            }
        },
        async getStatus (direction, user) {
            let status = null
            const id = (direction === "to") ? this.currentUserInfo.attributes.sub : user.id
            const toUserId = (direction === "to") ? user.id : this.currentUserInfo.attributes.sub
            const getFriend = `
                query FriendByToUserId {
                    friendByToUserId(
                        id: "${id}",
                        toUserId: {
                          eq: "${toUserId}"
                        },
                        limit: 1,
                        nextToken: null,
                    ) {
                        items {
                            id
                            status
                            toUserId
                            createdAt
                            updatedAt
                        }
                        nextToken
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(getFriend))
                    .then((res) => {
                        const items = res.data.friendByToUserId.items
                        const item = (items.length > 0)? items[0] : []
                        status = ("status" in item)? item.status : null
                    })
            } catch (e) {
                console.log("Getting Friend Status is Failed: " + e)
            }
            return status
        }
    }
}
</script>