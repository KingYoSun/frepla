<template>
    <v-list-item-content v-if="user.show">
        <v-row justify="center" align="center">
            <div v-if="icon.showPreviewImg" class="mx-1">
                <v-img
                :src="icon.imgPreview"
                alt="アイコンのプレビュー"
                @error="resetImgURL(icon)"
                class="user-image-small"
                :max-width="45"
                />
            </div>
            <h4 class="ml-1">{{ user.viewName }}</h4>
            <h4 class="mr-1">@{{ user.name }}</h4>
            <v-btn
            color="teal"
            class="mx-1"
            dark
            :disabled="connectButtonDisable"
            @click="connect"
            >
            CONNECT
            </v-btn>
            <v-btn
            color="red"
            class="mx-1"
            dark
            :disabled="disconnectButtonDisable"
            @click="disconnect"
            >
            DISCONNECT
            </v-btn>
        </v-row>
    </v-list-item-content>
</template>

<script>
import API, { graphqlOperation } from '@aws-amplify/api'
import * as Common from '~/assets/js/common.js'
import { getProfile } from '~/src/graphql/queries'

export default {
    name: "UserCardConnectRow",
    data () {
        return {
            user: {
                show: false,
                name: "",
                viewName: "",
                iconUrl: null,
                identityId: null
            },
            icon: {
                name: "icon",
                imgURL: null,
                imgFile: null,
                imgType: null,
                imgPreview: null,
                showPreviewImg: false,
            },
            connectButtonDisable: false,
            disconnectButtonDisable: false
        }
    },
    props: {
        peer: {
            type: Object,
            default () {
                return {
                    connection: null,
                    toUserId: ""
                }
            }
        }
    },
    mounted () {
        this.getProfile()
        this.switchButton(this.peer)
    },
    watch: {
        peer: {
            handler: function (newPeer, oldPeer) {
                //console.log('watch!')
                this.switchButton(newPeer)
            },
            deep: true
        }
    },
    methods: {
        switchButton (peer) {
            if (peer.connection.connected) {
                this.connectButtonDisable = true
                this.disconnectButtonDisable = false
            } else {
                this.connectButtonDisable = false
                this.disconnectButtonDisable = true
            }
        },
        connect () {
            this.connectButtonDisable = false
            this.disconnectButtonDisable = false
            this.$emit('connect', this.peer.toUserId)
        },
        disconnect () {
            this.connectButtonDisable = false
            this.disconnectButtonDisable = false
            this.$emit('disconnect', this.peer.toUserId)
        },
        failed (e, message) {
            console.log(e)
            alert(message)
        },
        resetImgURL (obj) {
            obj.showPreviewImg = false
            obj.imgURL = null
            obj.imgFile = null
        },
        setImgUrlIcon () {
            this.icon.imgURL = this.user.iconUrl
            Common.setImgFileUser(this.icon, this.user.identityId)
        },
        async getProfile () {
            const getProfile = `
                query GetProfile {
                    getProfile(id: "${this.peer.toUserId}") {
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
                        this.user.show = (items != null || items != undefined) ? true : false
                        this.user.viewName = ("viewName" in items) ? items.viewName : ""
                        this.user.name= ("name" in items) ? items.name : ""
                        this.user.iconUrl = ("iconUrl" in items) ? items.iconUrl : null
                        this.user.identityId = ("identityId" in items) ? items.identityId : null
                        this.setImgUrlIcon()
                    })
            } catch (e) {
                console.log(e)
            }
        }
    }
}
</script>