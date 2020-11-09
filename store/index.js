export const state = () => {
    currentUserInfo: null
    followCount: 0
    followerCount: 0
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
    }
}