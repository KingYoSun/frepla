import API, { graphqlOperation } from '@aws-amplify/api' 

export default class WebRTC{
    constructor(peer, db, currentUserInfo) {
        this.fromUserId = peer.fromUserId
        this.toUserId = peer.toUserId
        this.localConnection = null
        this.dataChannel = null
        this.connected = false
        this.peerConnectionConfig = {
            iceServers: [{"urls": "stun:stun.l.google.com:19302"}],
            iceTransportPolicy: "all"    
        }
        this.db = db
        this.currentUserInfo = currentUserInfo
    }

    get getConnection() {
        return this.localConnection
    }

    get getDataChannel() {
        return this.dataChannel
    }

    get getStatus() {
        return this.connected
    }

    
    getNowISO8601 () {
        const date = new Date()
        const isoStr = date.toISOString()
        return isoStr
    }

    getTTL () {
        const date = new Date()
        const unixtimenow = Math.floor(date.getTime() / 1000)
        const timeToLive = unixtimenow + 60*10
        return timeToLive
    }

    async sendOffer (offer) {
        const jsonMessage = JSON.stringify(offer)
        const createMessage = `
            mutation CreateMessage {
                createMessage(input: { 
                    fromUserId: "${this.fromUserId}",
                    toUserId: "${this.toUserId}",
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
                    //console.log("Send Offer: " + this.toUserId + ' from: ' + this.fromUserId)
                })
        } catch (e) {
            console.log("Sending Offer Failed: " + e)
        }
    }
    
    initPeer () {
        this.localConnection = new RTCPeerConnection(this.peerConnectionConfig)
        this.localConnection.onicecandidate = (event) => {
            if (event.candidate != null) {
                //console.log('got ice candidate')
                this.sendOffer(event.candidate)
                //console.log('send ice canditate to remote')
            }
        }
        this.localConnection.oniceconnectionstatechange = () => {
            if (this.localConnection.iceConnectionState === "closed" ||
                this.localConnection.iceConnectionState === "failed" ||
                this.localConnection.iceConnectionState === "disconnected") {
                    //console.log('ice closed!')
                    this.disconnectPeers()
            }
        }
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
    }
    
    connectPeers () {
        this.initPeer()
    
        let _offer = null
    
        this.dataChannel = this.localConnection.createDataChannel("dataChannel")
        this.dataChannel.onmessage = (e) => this.handleReceiveMessage(e)
        this.dataChannel.onopen = () => this.handleDataChannelStatusChange()
        this.dataChannel.onclose = () => this.handleDataChannelStatusChange()
    
        this.localConnection.createOffer()
            .then((offer) => {
                _offer = offer
                this.localConnection.setLocalDescription(offer)
            })
            .then(() => {
                this.sendOffer(_offer)
            })
            .catch((e) => this.handleCreateDescriptionError(e))
    }
    
    receivePeer (messageObj) {
        this.toUserId = messageObj.fromUserId
        let _answer = null
    
        if (!this.localConnection) this.initPeer()
        this.localConnection.ondatachannel = (e) => this.dataChannelCallback(e)

        let sdptext = messageObj.message
        sdptext = sdptext.slice(0, -1)
            .replace(/[\u0000-\u0019]+/g,"\\n")
        let offer = JSON.parse(sdptext)
    
        if (offer.sdp) {
            this.localConnection.setRemoteDescription(offer)
                //.then(() => console.log('createAnswer'))
                .then(() => {
                    if (offer.type == 'offer') {
                        this.localConnection.createAnswer()
                            .then((answer) => {
                                _answer = answer
                                this.localConnection.setLocalDescription(answer)
                            })
                            .then(() => {
                                this.sendOffer(_answer)
                            })
                            .catch((e) => this.handleCreateDescriptionError(e))
                    }
                })
        } else if (offer.candidate) {
            this.localConnection.addIceCandidate(offer)
                //.then(() => console.log('added ice candidate'))
                .catch(() => this.handleAddCandidateError())
        }
        
    }
    
    handleCreateDescriptionError(error) {
        console.log("Unable to create an offer: " + error.toString())
    }
    
    handleLocalAddCandidateSuccess() {
        this.connected = true
    }
    
    handleRemoteAddCandidateSuccess() {
        this.connected = false
    }
    
    handleAddCandidateError() {
        //console.log("Oh noes! addICECandidate failed!")
    }
    
    sendMessage(message) {
        this.dataChannel.send(message)
        //console.log('send message: ' + message)
        // Clear the input box and re-focus it, so that we're
        // ready for the next message.
    }
    
    handleDataChannelStatusChange () {
        //console.log("statusChange")
        if (this.dataChannel != null && this.dataChannel != undefined) {
            let state = this.dataChannel.readyState;
            //console.log('state is: ' + state)
            if (state === "open") {
                //console.log('open connection!')
                this.connected = true
            } else {
                this.connected = false
            }
        }
    }
    
    dataChannelCallback(event) {
        this.dataChannel = event.channel
        this.dataChannel.onmessage = (e) => this.handleReceiveMessage(e)
        this.dataChannel.onopen = () => this.handleDataChannelStatusChange()
        this.dataChannel.onclose = () => this.handleDataChannelStatusChange()
    }
    
    handleReceiveMessage(event) {
        const data = JSON.parse(event.data)
        this.db.transaction("rw", this.db.posts, this.db.requests, async () => {
            if (data.type == "request") this.db.requests.add(data.data)
            if (data.type == "post") {
                const targetPost = await this.getTargetPost(data.data.id)
                if (targetPost == null || targetPost == undefined) {
                    this.db.posts.add(data.data)
                } else {
                    let replyFromId = []
                    const isReplyFromIdTargetPost = ("replyFromId" in targetPost && targetPost.replyFromId != null && targetPost.replyFromId != undefined)? true : false
                    const isReplyFromIdData = ("replyFromId" in data.data && data.data.fromUserId != null && data.data.fromUserId != undefined)? true : false
                    if (isReplyFromIdData) {
                        if (isReplyFromIdTargetPost) {
                            replyFromId = targetPost.replyFromId.concat(data.data.replyFromId)
                        } else {
                            replyFromId = data.data.replyFromId
                        }
                    } else if (isReplyFromIdTargetPost) {
                        replyFromId = targetPost.replyFromId
                    }
                    replyFromId = Array.from(new Set(replyFromId))
                    let like = targetPost.like.concat(data.data.like)
                    like = Array.from(new Set(like))
                    let rePost = targetPost.rePost.concat(data.data.rePost)
                    rePost = Array.from(new Set(rePost))
                    like = like.filter((elem) => elem != null && elem != undefined)
                    rePost = rePost.filter((elem) => elem != null && elem != undefined)
                    replyFromId = replyFromId.filter((elem) => elem != null && elem != undefined)
                    const updatePost = {
                        replyFromId: replyFromId,
                        like: like,
                        rePost: rePost,
                        updatedAt: data.data.updatedAt
                    }
                    this.db.posts.update(data.data.id, updatePost)
                    if (data.data.id === this.currentUserInfo.attributes.sub) {
                        this.db.myPosts.update(data.data.id, updatePost)
                    }
                }
            }
        }).then(() => {
            console.log( data.type + " downloaded from peer!")
        }).catch((e) => {
            console.log("Downloading message from peer is Failed: " + e)
        })
    }

    async getTargetPost(id) {
        return await this.db.posts.where("id")
                                    .equals(id)
                                    .first()
    }

    disconnectPeers() {
        // Close the RTCDataChannels if they're open.
        this.dataChannel.close();
        
        // Close the RTCPeerConnections
        this.localConnection.close();
    
        this.dataChannel = null;
        this.localConnection = null;
        
        // Update user interface elements
        this.connected = false
    }
}