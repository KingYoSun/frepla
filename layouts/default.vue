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
                        alt="ユーザアイコン"
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
            <div id="openConnectList">
                <v-btn
                color="purple"
                fab
                dark
                @click="openConnectList"
                >
                    <v-icon dark>
                    mdi-connection
                    </v-icon>
                </v-btn>
            </div>
            <v-dialog
            v-model="dialogConnectList"
            eager
            max-width="800"
            >
                <v-card>
                    <v-card-title class="justify-center">接続情報</v-card-title>
                    <v-list-item v-for="(peer, index) in $store.state.connected" :key="index">
                        <user-card-row
                        :peer="peer"
                        @connect="connectFriend"
                        @disconnect="disconnectFriend"
                        :ref="'connection-' + peer.toUserId"
                        />
                    </v-list-item>
                    <v-list-item v-for="(peer, index) in $store.state.unconnected" :key="index">
                        <user-card-row
                        :peer="peer"
                        @connect="connectFriend"
                        @disconnect="disconnectFriend"
                        :ref="'connection-' + peer.toUserId"
                        />
                    </v-list-item>
                </v-card>
            </v-dialog>
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
import { AmplifyEventBus } from 'aws-amplify-vue'
import * as Common from '~/assets/js/common.js'
import WebRTC from '~/assets/js/webrtc.js'
import UserCardRow from '~/components/userCardRow.vue'
import { MyDatabase } from '~/assets/ts/myDatabase'

export default {
    components: {
        UserCardRow
    },
    data () {
        return {
            currentUserInfo: {},
            exitProfile: false,
            backgroundColor: "gray darken-4",
            drawer: false,
            userMenu: null,
            fixed: false,
            clipped: false,
            img: {
                imgURL: null,
                imgPreview: null,
                showPreviewImg: false
            },
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
            containerStyle: {},
            subscription: null,
            connections: [],
            dialogConnectList: false,
            db: {}
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
        if(this.$store.state.db == null) this.$store.commit("newDB")
        this.db = this.$store.state.db
        this.getUserInfo()
            .then(() => {
                this.subscribe()
            })
    },
    mounted () {
        this.initDB()
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
    },
    watch: {
        connections: {
            handler: async function(newObj, oldObj) {
                let untilDate = Common.getNow() - 60 * 60 *24
                await this.db.posts.orderBy("updatedAt")
                                    .desc()
                                    .offset(0)
                                    .limit(1)
                                    .toArray(posts => {
                                        if (posts.length > 0) {
                                            untilDate = posts[0].updatedAt
                                        }
                                    })
                
                newObj.map((obj) => {
                    if (obj.connection.getStatus) {
                        const requestFlag = this.$store.state.unconnected.some(peer => peer.id === obj.id)
                        this.$store.commit("resetConnectionById", obj.id)
                        this.$store.commit("pushConnected", obj)
                        if (requestFlag) {
                            const message = {
                                type: "request",
                                data: {
                                    id: 'req-' + Common.getNow(),
                                    fromUserId: this.currentUserInfo.attributes.sub,
                                    untilDate: untilDate
                                }
                            }
                            obj.connection.sendMessage(JSON.stringify(message))
                        }
                    } else {
                        this.$store.commit("resetConnectionById", obj.id)
                        this.$store.commit("pushUnconnected", obj)
                    }
                })
            },
            deep: true
        }
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
            this.currentUserInfo = this.$store.state.currentUserInfo
            if (!this.currentUserInfo) {
                this.currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
                this.$store.commit('login', this.currentUserInfo)
            }
            this.isLoggedIn = Boolean(this.currentUserInfo)
            if (this.isLoggedIn) {
                this.getProfile()
                this.updateLastLogin(this.currentUserInfo)
                this.setFriendList()
                    .then(() => this.initPeers())
                    .then(() => this.offerFriend())
            }
        },
        async setFriendList () {
            const followList = await Common.getFollowList(this.currentUserInfo.attributes.sub, 'follow')
            this.$store.commit("setFollowList", followList)
            const followerList = await Common.getFollowerList(this.currentUserInfo.attributes.sub, 'follow')
            this.$store.commit("setFollowerList", followerList)
            this.$store.commit("setFriendList")
        },
        logout () {
            this.$store.commit('logout')
            this.$store.commit('removeImg')
            this.isLoggedIn = false
        },
        async getProfile () {
            if (!this.currentUserInfo) {
                this.currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
            }
            const getProfile = `
                query GetProfile {
                    getProfile(id: "${this.currentUserInfo.attributes.sub}") {
                        id
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
                        this.exitProfile = true
                        this.img.imgURL = ("iconUrl" in items) ? items.iconUrl : null
                        Common.setImgFile(this.img)
                            .then((res) => this.$store.commit("setImg", res.imgPreview))
                    })
            } catch (e) {
                console.log("Profile not found: " + e)
                this.createProfile(this.currentUserInfo)
            }
        },
        removeImg () {
            this.$store.commit("removeImg")
            this.img.imgURL = null
        },
        updateLastLogin (currentUserInfo) {
            const nowUnix = Common.getNow()
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
            const nowUnix = Common.getNow()
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
        subscribe () {
            const onCreatMessage = `
                subscription OnCreateMessage {
                    onCreateMessage(toUserId: "${this.$store.state.currentUserInfo.attributes.sub}") {
                        fromUserId
                        toUserId
                        message
                        ttl
                        createdAt
                        updatedAt
                    }
                }
            `
            this.subscription = API.graphql(graphqlOperation(onCreatMessage))
                .subscribe({
                    next: (event) => {
                        if (event) {
                            const messageObj = event.value.data.onCreateMessage
                            this.receiveOffer(messageObj)
                        }
                    }
                })
        },
        async initPeers () {
            if (!this.currentUserInfo) {
                this.currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
            }
            if(this.$store.state.db == null) this.$store.commit("newDB")
            this.db = this.$store.state.db
            const friendIds = this.$store.state.friendList
            friendIds.forEach(async (friendId) => {
                const peer = {
                    fromUserId: this.currentUserInfo.attributes.sub,
                    toUserId: friendId
                }
                const connection = {
                    toUserId: friendId,
                    connection: new WebRTC(peer, this.$store.state.db, this.currentUserInfo)
                }
                this.connections.push(connection)
                this.$store.commit("pushUnconnected", connection)
            })
        },
        offerFriend () {
            this.connections.map((peer) => {
                if (this.$store.state.connected != undefined
                    && this.$store.state.connected.length > 0
                    && this.$store.state.connected.some((obj) => obj.toUserId !== peer.toUserId)) {
                    return false
                }
                peer.connection.connectPeers()
            })
        },
        receiveOffer (messageObj) {
            const fromUserId = messageObj.fromUserId
            const connection = this.connections.find(obj => obj.toUserId === fromUserId)
            connection.connection.receivePeer(messageObj)
        },
        connectFriend (id) {
            const peer = this.connections.find((connection) => connection.toUserId === id)
            peer.connection.connectPeers()
        },
        disconnectFriend (id) {
            const peer = this.connections.find((connection) => connection.toUserId === id)
            peer.connection.disconnectPeers()
        },
        openConnectList () {
            this.dialogConnectList = !this.dialogConnectList
            /*
            this.$store.state.connected.map((peer) => {
                console.log("peer!")
                console.log(this.$refs)
                console.log(this.$refs['connection-' + peer.toUserId])
                this.$refs['connection-' + peer.toUserId][0].getProfile()
            })
            this.$store.state.unconnected.map((peer) => {
                console.log("peer!")
                console.log(this.$refs)
                console.log(this.$refs['connection-' + peer.toUserId])
                this.$refs['connection-' + peer.toUserId][0].getProfile()
            })
            */
        },
        initDB () {
            this.db.open()
            const self = this
            this.db.myPosts.hook("creating", function(primKey, obj, trans) {
                trans.on("complete", function() {
                    const jsonObj = {
                        type: "post",
                        data: obj
                    }
                    if (self.$store.state.connected.length > 0) {
                        self.$store.state.connected.map((peer) => {
                            peer.connection.sendMessage(JSON.stringify(jsonObj))
                        })
                    }
                })
            })
            this.db.requests.hook("creating", (primKey, obj, trans) => {
                const targetPeer = self.connections.find((peer) => {
                    return peer.toUserId == obj.fromUserId
                })
                trans.on("complete", function () {
                    self.db.myPosts.orderBy("updatedAt")
                                    .desc()
                                    .limit(100)
                                    .toArray((myPosts) => {
                                        if (myPosts.length > 0) {
                                            myPosts.map(post => {
                                                if (post.updatedAt > obj.untilDate) {
                                                    const jsonObj = {
                                                        type:"post",
                                                        data: post
                                                    }
                                                    targetPeer.connection.sendMessage(JSON.stringify(jsonObj))
                                                }
                                            })
                                        }
                                    })
                    self.db.posts.orderBy("updatedAt")
                                    .desc()
                                    .limit(100)
                                    .toArray((posts) => {
                                        if (posts.length > 0) {
                                            posts.map(post => {
                                                if (post.updatedAt > obj.untilDate) {
                                                    const jsonObj = {
                                                        type:"post",
                                                        data: post
                                                    }
                                                    targetPeer.connection.sendMessage(JSON.stringify(jsonObj))
                                                }
                                            })
                                        }
                                    })
                    self.db.requests.delete(primKey)
                })
            })
        },
        closeDB () {
            this.db.close()
        }
    }
}
</script>

<style>
.main-footer {
    background-color: #616161;
    box-shadow: 5px 5px 20px black;
}
#openConnectList {
    position: fixed;
    z-index: 90;
    right: 30px;
    bottom: 40px;
}
</style>