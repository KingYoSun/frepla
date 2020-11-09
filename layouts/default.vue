<template>
    <v-app dark>
        <v-navigation-drawer
            v-model="drawer"
            :clipped="clipped"
            fixied
            app
        >
            <v-list class="mt-1 ml-2" v-if="isLoggedIn">
                <div style="display: flex;flex-wrap: nowrap;align-items: center;">
                    <v-avatar
                        color="indigo"
                        size="40"
                    >
                        <v-icon dark v-if="!$store.state.showPreviewImg">mdi-account-circle</v-icon>
                        <v-img
                        :src="$store.state.imgPreview"
                        v-if="$store.state.showPreviewImg"
                        alt="商品画像のプレビュー"
                        @error="removeImg"
                        class="profileIcon"
                        :max-width="50"
                        />
                    </v-avatar>
                    <span class="mx-2">{{$store.state.currentUserInfo.username}}</span>
                </div>
                <amplify-sign-out class="mx-auto" v-if="isLoggedIn" />
            </v-list>
            <v-list class="pt-2" dense>
                <v-btn class="ml-4" text nuxt to="/signin" v-if="!isLoggedIn">サインイン</v-btn>
            </v-list>
            <v-list class="pt-2" dense>
                <v-divider></v-divider>
                <v-list-item
                    v-for="(item, i) in filteredItems"
                    :key="i"
                    :to="item.to"
                    router
                    exact
                >
                    <v-list-item-action>
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title v-text="item.title" />
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar :clipped-left="clipped" fixed app>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            <v-btn icon @click.stop="clipped = !clipped">
                <v-icon>mdi-application</v-icon>
            </v-btn>
            <v-btn icon @click.stop="fixed = !fixed">
                <v-icon>mdi-minus</v-icon>
            </v-btn>
            <nuxt-link
            style="text-decoration: none;color: white;"
            to="/">
            <h3>{{ title }}</h3>
            </nuxt-link>
        </v-app-bar>

        <v-main>
            <v-container class="my-6" :style="containerStyle">
                <nuxt />
            </v-container>
        </v-main>
        
        <v-footer
            class="main-footer"
            absolute
            :fixed="fixed"
            app
        >
            <div style="margin: 0 auto;">
                <span>&copy; 2020 KingYoSun</span>
            </div>
        </v-footer>
    </v-app>
</template>

<script>
import API, { graphqlOperation } from '@aws-amplify/api'
import Storage from '@aws-amplify/storage'
import { AmplifyEventBus } from 'aws-amplify-vue'
import * as Common from '~/assets/js/common.js'

export default {
    data () {
        return {
            exitProfile: false,
            backgroundColor: "gray darken-4",
            drawer: false,
            userMenu: null,
            fixed: false,
            clipped: false,
            imgURL: null,
            items: [
                {
                    icon: 'mdi-home',
                    title: 'ホーム',
                    to: '/',
                    status: ['loggedIn']
                },
                {
                    icon: 'mdi-account',
                    title: 'プロフィール',
                    to: '/profile',
                    status: ['loggedIn']
                },
                {
                    icon: 'mdi-account-multiple',
                    title: 'フォロー/フォロワー一覧',
                    to: '/friends',
                    status: ['loggedIn']
                },
                {
                    icon: 'mdi-account-multiple-plus',
                    title: 'ユーザー検索',
                    to: '/userSearch',
                    status: ['loggedIn']
                }
            ],
            title: 'FREPLA',
            isLoggedIn: false,
            defaultContainerStyle: {
                maxWidth: "1200px",
                minWidth: null,
                backgroundColor: "gray-darken-3",
                borderRadius: "10px",
                boxShadow: "2px 2px 8px #000000; -2px -2px 8px #000000;"
            },
            containerStyle: {}
        }
    },
    async beforeCreate() {
        AmplifyEventBus.$on('authState', (info) => {
            if (info === 'signedIn') {
                this.$router.push('/')
                this.getUserInfo()
            } else if (info === 'signedOut') {
                this.$router.push('/signin')
                this.logout()
            }
        })
    },
    async created () {
        this.containerStyle = JSON.parse(JSON.stringify(this.defaultContainerStyle))
        this.setListener()
        await this.getUserInfo()
    },
    methods: {
        setListener () {
            this.$nuxt.$on('defineContainerStyle', this.defineContainerStyle)
            this.$nuxt.$on('resetContainerStyle', this.resetContainerStyle)
        },
        resetContainerStyle () {
            this.containerStyle = JSON.parse(JSON.stringify(this.defaultContainerStyle))
        },
        defineContainerStyle (style) {
            if ("maxWidth" in style) {
                this.containerStyle.maxWidth = style.maxWidth
            }
            if ("minWidth" in style) {
                this.containerStyle.minWidth = style.minWidth
            }
            if ("backgroundColor" in style) {
                this.containerStyle.backgroundColor = style.backgroundColor
            }
            if ("borderRadius" in style) {
                this.containerStyle.borderRadius = style.borderRadius
            }
            if ("boxShadow" in style) {
                this.containerStyle.boxShadow = style.boxShadow
            }
        },
        async getUserInfo () {
            let currentUserInfo = this.$store.state.currentUserInfo
            if (!currentUserInfo) {
                currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
                this.$store.commit('login', currentUserInfo)
            }
            this.isLoggedIn = Boolean(currentUserInfo)
            if (this.isLoggedIn) {
                this.getProfile()
                this.updateLastLogin(currentUserInfo)
                const followList = await Common.getFollowList(this.$store.state.currentUserInfo.attributes.sub, 'follow')
                this.$store.commit("setFollowList", followList)
                const followerList = await Common.getFollowerList(this.$store.state.currentUserInfo.attributes.sub, 'follow')
                this.$store.commit("setFollowerList", followerList)
                this.$store.commit("setFriendList")
            }
        },
        logout () {
            this.$store.commit('logout')
            this.$store.commit('removeImg')
            this.isLoggedIn = false
        },
        async getProfile () {
            const currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
            const getProfile = `
                query GetProfile {
                    getProfile(id: "${currentUserInfo.attributes.sub}") {
                        id
                        iconUrl
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(getProfile))
                    .then((res) => {
                        const items = res.data.getProfile
                        if (items == null || items == undefined || items == []) {
                            throw "Profile not found"
                        }
                        this.exitProfile = true
                        this.imgURL = ("iconUrl" in items) ? items.iconUrl : null
                        this.setImgFile()
                    })
            } catch (e) {
                console.log("Profile not found: " + e)
                this.createProfile(currentUserInfo)
            }
        },
        removeImg () {
            this.$store.commit("removeImg")
            this.imgURL = null
        },
        setImgFile () {
            if (this.imgURL !== null && this.imgURL !== 'null') {
                try {
                    Storage.get(this.imgURL, {level: 'protected'})
                        .then((res) => {
                            this.$store.commit("setImg", res)
                        })
                        .catch((e) => {
                            console.log("Getting Image Failed: " + e)
                        })
                } catch (e) {
                    console.log("Getting Image Failed: " + e)
                }
            }
        },
        updateLastLogin (currentUserInfo) {
            const date = new Date()
            const nowUnix = Math.floor(date.getTime() / 1000)
            const updateProfile = `
                mutation UpdateProfile {
                    updateProfile(input: {
                        id: "${currentUserInfo.attributes.sub}",
                        lastLogin: ${nowUnix},
                    }) {
                        id
                        lastLogin
                    }
                }
            `
            try {
                    API.graphql(graphqlOperation(updateProfile))
                            .then((res)=> {
                                    console.log("Updated LastLogin")
                            })
            } catch (e) {
                    console.log("Updating LasLogin Failed: " + e)
            }
        },
        createProfile (currentUserInfo) {
            const date = new Date()
            const nowUnix = Math.floor(date.getTime() / 1000)
            const createProfile = `
                mutation CreateProfile {
                    createProfile(input: {
                        id: "${currentUserInfo.attributes.sub}",
                        name: "${currentUserInfo.username}",
                        email: "${currentUserInfo.attributes.email}",
                        div: 1,
                        lastLogin: ${nowUnix},
                        description: "",
                        followCount: 0,
                        followerCount: 0
                    }) {
                        id
                        name
                        email
                        div
                        lastLogin
                        description
                        followCount
                        followerCount
                    }
                }
            `
            try {
                API.graphql(graphqlOperation(createProfile))
                    .then((res)=> {
                        console.log("プロフィールを作成しました")
                    })
            } catch (e) {
                console.log("プロフィールの作成に失敗しました: " + e)
            }
        },
    },
    computed: {
        filteredItems () {
            const self = this
            return self.items.filter((item) => {
                if (self.isLoggedIn) {
                    return item.status.indexOf('loggedIn') !== -1
                } else {
                    return item.status.indexOf('loggedOut') !== -1
                }
            })
        }
    }
}
</script>

<style>
.main-footer {
    background-color: #616161;
    box-shadow: 5px 5px 20px black;
}
</style>