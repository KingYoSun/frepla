export const state = () => {
    currentUserInfo: null
    followCount: 0
    followerCount: 0
    followList: []
    followerList: []
    friendList: []
    imgPreview: null
    showPreviewImg: false
}

export const mutations = {
    login(state, user) {
        state.currentUserInfo = user
    },
    logout(state) {
        state.currentUserInfo = null
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
        state.followList.filter(n => n !== toUserId)
    },
    setFollowerList(state, array) {
        state.followerList = array
    },
    addFollowerList(state, toUserId) {
        state.followerList.push(toUserId)
    },
    removeFollowerList(state, toUserId) {
        state.followerList.filter(n => n !== toUserId)
    },
    setFriendList(state) {
        state.friendList = state.followList.filter(follow => {
            return state.followerList.indexOf(follow) !== -1
        })
    }
}