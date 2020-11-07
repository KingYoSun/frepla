export const state = () => {
    currentUserInfo: null
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
    }
}