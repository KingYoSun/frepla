import { MyDatabase } from '~/assets/ts/myDatabase'

export const state = () => {
    currentUserInfo: null
    followCount: 0
    followerCount: 0
    followList: []
    followerList: []
    friendList: []
    imgPreview: null
    showPreviewImg: false
    db: null
    connection: []
    connected: []
    unconnected: []
}

export const mutations = {
    login(state, user) {
        state.currentUserInfo = user
    },
    logout(state) {
        state.currentUserInfo = null
        state.followList = []
        state.followCount = 0
        state.followerCount = 0
        state.followerList = []
        state.friendList = []
    },
    setImg(state, img) {
        state.imgPreview = img
        state.showPreviewImg = true
    },
    removeImg(state) {
        state.showPreviewImg = false
        state.imgPreview = null
    },
    followCountLoading(state, num) {
        state.followCount = num
    },
    followCountIncrement(state) {
        state.followCount++
    },
    followCountDecrement(state) {
        state.followCount--
    },
    followerCountLoading(state, num) {
        state.followerCount = num
    },
    followerCountIncrement(state) {
        state.followerCount++
    },
    followerCountDecrement(state) {
        state.followerCount--
    },
    setFollowList(state, array) {
        state.followList = array
    },
    addFollowList(state, toUserId) {
        state.followList.push(toUserId)
    },
    removeFollowList(state, toUserId) {
        state.followList = state.followList.filter(n => n !== toUserId)
    },
    setFollowerList(state, array) {
        state.followerList = array
    },
    addFollowerList(state, toUserId) {
        state.followerList.push(toUserId)
    },
    removeFollowerList(state, toUserId) {
        state.followerList = state.followerList.filter(n => n !== toUserId)
    },
    setFriendList(state) {
        state.friendList = state.followList.filter(follow => {
            return state.followerList.indexOf(follow) !== -1
        })
    },
    newDB(state) {
        state.db = new MyDatabase()
    },
    setConnections(state, array) {
        state.connections = array
    },
    pushConnected(state, peer) {
        if (state.connected == undefined) {
            state.connected = []
        }
        state.connected.push(peer)
    },
    pushUnconnected(state, peer) {
        if (state.unconnected == undefined) {
            state.unconnected = []
        }
        state.unconnected.push(peer)
    },
    resetConnectionById(state, id) {
        if (state.connected == undefined) {
            state.connected = []
        }
        if (state.unconnected == undefined) {
            state.unconnected = []
        }
        state.connected = state.connected.filter((peer) => {
            return peer.id !== id
        })
        state.unconnected = state.unconnected.filter((peer) => {
            return peer.id !== id
        })
    }
}