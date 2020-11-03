export const state = () => {
    currentUserInfo: null
}

export const mutations = {
    login(state, user) {
        state.currentUserInfo = user
    },
    logout(state) {
        state.currentUserInfo = null
    }
}