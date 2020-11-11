<template>
    <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6">
            <div class="text-center">
                <logo />
                <vuetify-logo />
            </div>
            <v-card>
                <v-card-title class="headline">
                    Welcome to the FrePla Project
                </v-card-title>
                <v-card-text>
                    <v-row justify="center">
                        <v-select
                        v-model="selectFriendId"
                        :items="friendList"
                        label="フレンドの選択"
                        />
                    </v-row>
                    <v-row justify="center">
                        <v-btn
                        color="teal"
                        dark
                        class="mx-4"
                        :disabled="!connectButton"
                        @click="connectPeers"
                        >
                        CONNECT
                        </v-btn>
                        <v-btn
                        color="red"
                        dark
                        class="mx-4"
                        :disabled="!disconnectButton"
                        @click="disconnectPeers"
                        >
                        DISCONNECT
                        </v-btn>
                    </v-row>
                    <div v-for="message in messages" :key="message.createdAt">
                        <v-row justify="center" style="color: #fff;">
                            <h3>{{ message }}</h3>
                        </v-row>
                    </div>
                    <div>
                        <v-form ref="formMessage" @submit.prevent>
                            <v-row>
                                <v-text-field
                                v-model="messageInputBox"
                                ref="messageBox"
                                class="mx-4"
                                label="message"
                                :rules="[required]"
                                :disabled="messageInputBoxDisable"
                                @keyup.enter="validation"
                                >
                                </v-text-field>
                                <v-btn
                                color="primary"
                                dark
                                class="mr-4"
                                :disabled="sendButtonDisable"
                                @click="validation"
                                >
                                SEND
                                </v-btn>
                            </v-row>
                        </v-form>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import API, { graphqlOperation } from '@aws-amplify/api'
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'
import * as Common from '~/assets/js/common.js'

export default {
    components: {
        Logo,
        VuetifyLogo,
    },
    data () {
        return {
            currentUserInfo: {},
            messages: [],
            subscription: null,
            selectFriendId: "",
            friendList: [],
            required: value => !!value || "必須事項です",
            localConnection: null,
            dataChannel: null,
            connectButton: true,
            disconnectButton: false,
            messageInputBox: "",
            messageInputBoxDisable: true,
            sendButtonDisable: true,
            peerConnectionConfig: {
                iceServers: [{"urls": "stun:stun.l.google.com:19302"}],
                iceTransportPolicy: "all"    
            },
            localNegotiating: false,
            answer: null,
            offer: null,
            remoteId: null
        }
    },
    async mounted () {
        this.currentUserInfo = this.$store.state.currentUserInfo
        if (!this.currentUserInfo) {
            this.currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
            this.$store.commit('login', this.currentUserInfo)
        }
        if (this.$store.state.friendList === undefined) {
            const followList = await Common.getFollowList(this.$store.state.currentUserInfo.attributes.sub, 'follow')
            this.$store.commit("setFollowList", followList)
            const followerList = await Common.getFollowerList(this.$store.state.currentUserInfo.attributes.sub, 'follow')
            this.$store.commit("setFollowerList", followerList)
            this.$store.commit("setFriendList")
        }
        this.friendList = this.$store.state.friendList
        this.subscribe()
    },
    methods: {
        getNowISO8601 () {
            const date = new Date()
            const isoStr = date.toISOString()
            return isoStr
        },
        getTTL () {
            const date = new Date()
            const unixtimenow = Math.floor(date.getTime() / 1000)
            const timeToLive = unixtimenow + 60*10
            return timeToLive
        },
        validation () {
            try {
                if(!this.$refs.formMessage.validate()) {
                    throw "ExceptionOccured"
                }
                this.sendMessage()
            } catch (e) {
                console.log(e)
            }
        },
        async sendOffer (offer) {
            const jsonMessage = JSON.stringify(offer)
            const createMessage = `
                mutation CreateMessage {
                    createMessage(input: { 
                        fromUserId: "${this.currentUserInfo.attributes.sub}",
                        toUserId: "${this.remoteId}",
                        message: "${jsonMessage.replace(/"/g, '\\"')}}",
                        ttl: ${this.getTTL()},
                        createdAt: "${this.getNowISO8601()}",
                        updatedAt: "${this.getNowISO8601()}"
                    }) {
                        fromUserId
                        toUserId
                        message
                        ttl
                        createdAt
                        updatedAt
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(createMessage))
                    .then( (res) => {
                        console.log("Send Offer")
                    })
            } catch (e) {
                console.log("Sending Offer Failed: " + e)
            }
        },
        subscribe () {
            const onCreatMessage = `
                subscription OnCreateMessage {
                    onCreateMessage(toUserId: "${this.currentUserInfo.attributes.sub}") {
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
                            console.log("receive")
                            this.receivePeer(messageObj)
                        }
                    }
                })
        },
        initPeer () {
            this.localConnection = new RTCPeerConnection(this.peerConnectionConfig)
            this.localConnection.onicecandidate = this.getIceCandidate
            /*
            this.localConnection.onnegotiationneeded = async (e) => {
                try {
                    if (this.localNegotiating || this.localConnection.signalingState != "stable") return;
                    this.localNegotiating = true;
                    this.localConnection.createOffer()
                        .then(async (offer) => {
                            await this.localConnection.setLocalDescription(offer)
                            await this.sendOffer(offer, this.selectFriendId)
                        })
                } finally {
                    this.localNegotiating = false
                }
            }
            */
        },
        getIceCandidate (event) {
            if (event.candidate != null) {
                console.log('got ice candidate')
                this.sendOffer(event.candidate)
                console.log('send ice canditate to remote')
            }
        },
        connectPeers () {
            this.remoteId = this.selectFriendId
            
            this.initPeer()

            this.dataChannel = this.localConnection.createDataChannel("dataChannel")
            this.dataChannel.onmessage = this.handleReceiveMessage
            this.dataChannel.onopen = this.handleDataChannelStatusChange
            this.dataChannel.onclose = this.handleDataChannelStatusChange

            this.localConnection.createOffer()
                .then((offer) => {
                    this.offer = offer
                    this.localConnection.setLocalDescription(offer)
                })
                .then(() => {
                    this.sendOffer(this.offer, this.selectFriendId)
                })
                .catch(this.handleCreateDescriptionError)
        },
        receivePeer (messageObj) {
            this.remoteId = messageObj.fromUserId

            if (!this.localConnection) this.initPeer()
            this.localConnection.ondatachannel = this.dataChannelCallback

            let sdptext = messageObj.message
            sdptext = sdptext.slice(0, -1)
                .replace(/[\u0000-\u0019]+/g,"\\n")
            let offer = JSON.parse(sdptext)

            if (offer.sdp) {
                this.localConnection.setRemoteDescription(offer)
                    .then(() => console.log('createAnswer'))
                    .then(() => {
                        if (offer.type == 'offer') {
                            this.localConnection.createAnswer()
                                .then((answer) => {
                                    this.answer = answer
                                    this.localConnection.setLocalDescription(answer)
                                })
                                .then(() => {
                                    this.sendOffer(this.answer)
                                })
                                .catch(this.handleCreateDescriptionError)
                        }
                    })
            } else if (offer.candidate) {
                this.localConnection.addIceCandidate(offer)
                    .then(() => console.log('added ice candidate'))
                    .catch(this.handleAddCandidateError)
            }
            
        },
        handleCreateDescriptionError(error) {
            console.log("Unable to create an offer: " + error.toString())
        },
        handleLocalAddCandidateSuccess() {
            this.connectButton = false
        },
        handleRemoteAddCandidateSuccess() {
            this.disconnectButton = true
        },
        handleAddCandidateError() {
            console.log("Oh noes! addICECandidate failed!")
        },
        sendMessage() {
            this.dataChannel.send(this.messageInputBox)
            console.log('send message: ' + this.messageInputBox)
            // Clear the input box and re-focus it, so that we're
            // ready for the next message.
            this.messageInputBox = ""
            this.$refs.messageBox.focus()
        },
        handleDataChannelStatusChange(event) {
            console.log("statusChange")
            if (this.dataChannel) {
                let state = this.dataChannel.readyState;
                if (state === "open") {
                    this.messageInputBoxDisable = false;
                    this.$refs.messageBox.focus()
                    this.sendButtonDisable = false;
                    this.disconnectButton = true;
                    this.connectButton = false;
                } else {
                    this.messageInputBoxDisable = true;
                    this.sendButtonDisable = true;
                    this.connectButton = true;
                    this.disconnectButton = false;
                }
            }
        },
        dataChannelCallback(event) {
            this.dataChannel = event.channel;
            this.dataChannel.onmessage = this.handleReceiveMessage;
            this.dataChannel.onopen = this.handleDataChannelStatusChange;
            this.dataChannel.onclose = this.handleDataChannelStatusChange;
        },
        handleReceiveMessage(event) {
            this.messages.push(event.data)
        },
        disconnectPeers() {
            // Close the RTCDataChannels if they're open.
            this.dataChannel.close();
            
            // Close the RTCPeerConnections
            this.localConnection.close();

            this.dataChannel = null;
            this.localConnection = null;
            
            // Update user interface elements
            this.connectButton = true;
            this.disconnectButton = false;
            this.sendButtonDisable = true;
            
            this.messageInputBox = "";
            this.messageInputBoxDisable = true;
        }
    },
    middleware: 'auth'
}
</script>
