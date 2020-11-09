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
                <h2>ユーザー検索</h2>
            </v-row>
            <v-row justify="center">
                <v-text-field
                v-model="queryKey"
                label="ユーザー名"
                :rules="[required]"
                @keyup.enter="validation"
                />
                <v-btn
                dark
                fab
                small
                class="mx-2"
                color="indigo"
                @click="validation"
                >
                <v-icon dark>
                    mdi-account-search
                </v-icon>
                </v-btn>
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
            page: 1,
            overlay: false,
            showDialog: false,
            dialogMessage: "",
            queryKey: "",
            nextToken: null,
            infiniteId: 0,
            users: [],
            showUsers: false,
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
    },
    methods: {
        failed (e, message) {
            console.log(e)
            alert(message)
            this.overlay = false
        },
        validation () {
            try {
                if(!this.$refs.search.validate()) {
                throw "ExceptionOccured"
                }
                 this.startSearchUsers()
            } catch (e) {
                console.log(e)
            }
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
        startSearchUsers () {
            this.users = []
            this.nextToken = null
            this.page = 0
            this.$refs.infiniteLoading.stateChanger.reset()
            this.firstLoadFlag = true
            this.infiniteId += 1
        },
        infiniteHandler ($state) {
            if (!this.firstLoadFlag) {
                $state.complete()
                return false
            }
            let nextToken = null
            if (this.nextToken) {
                nextToken = `"${this.nextToken}"`
            } else if (this.page > 1) {
                $state.complete()
            }
            const searchUsers = `
                query ProfileSortedByLastTime {
                    profileSortedByLastTime(
                    div: 1,
                    sortDirection: DESC,
                    filter: { 
                        or: [
                            {name: {contains: "${this.queryKey}"}},
                            {viewName: {contains: "${this.queryKey}"}},
                            {description: {contains: "${this.queryKey}"}}
                        ]
                    },
                    limit: 20,
                    nextToken: ${nextToken}
                    ) {
                    items {
                        id
                        name
                        viewName
                        iconUrl
                        banner
                        url
                        description
                        identityId
                        followCount
                        followerCount
                    },
                    nextToken
                    }
                }
            `
            try {
                API.graphql(graphqlOperation(searchUsers))
                    .then(async (res) => {
                        this.page += 1
                        const items = res.data.profileSortedByLastTime.items
                        for (const item of items) {
                            item.status = await this.getStatus("to", item)
                            item.followedMe = await this.getStatus("from", item)
                            if (this.users.find(elem => elem.id === item.id) === undefined && item.id !== this.currentUserInfo.attributes.sub && item.followedMe !== "block") {
                                this.users.push(item)
                            }
                        }
                        this.nextToken = res.data.profileSortedByLastTime.nextToken
                        $state.loaded()
                        for (const item of items) {
                            if (item.id !== this.currentUserInfo.attributes.sub) {
                                this.$refs['userCardSmall-' + item.id][0].setImgUrlIcon()
                                this.$refs['userCardSmall-' + item.id][0].setImgUrlBanner()
                            }
                        }
                    })
            } catch (e) {
                $state.complete()
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
    },
    middleware: 'auth'
}
</script>