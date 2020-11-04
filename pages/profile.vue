<template>
    <v-container fluid style="max-width: 600px;">
        <custom-overlay :overlay="overlay" />
        <custom-dialog
        :dialog="showDialog"
        :message="dialogMessage"
        :cancel="false"
        @agree="showDialog = !showDialog"
        />
        <v-form ref="formProfile" @submit.prevent>
            <v-row justify="center">
                <v-text-field
                v-model="username"
                label="ユーザー名"
                :rule="[required]"
                disabled
                />
            </v-row>
            <v-row justify="center">
                <v-text-field
                v-model="email"
                label="メールアドレス"
                :rule="[required]"
                disabled
                />
            </v-row>
            <v-row justify="center">
                <v-textarea
                v-model="description"
                label="紹介文"
                />
            </v-row>
            <v-row justify="start">
                <v-btn
                    color="primary"
                    dark
                    class="mr-4"
                    @click="validation"
                    >
                    SEND
                </v-btn>
            </v-row>
        </v-form>
    </v-container>
</template>

<script>
import API, { graphqlOperation } from '@aws-amplify/api'
import CustomOverlay from '~/components/overlay.vue'
import CustomDialog from '~/components/dialog.vue'

export default {
    components: {
        CustomOverlay,
        CustomDialog
    },
    data () {
        return {
            overlay: false,
            showDialog: false,
            dialogMessage: "プロフィールを更新しました",
            currentUserInfo: null,
            username: "",
            email: "",
            description: "",
            required: value => !!value || "必須事項です",
        }
    },
    async created () {
        this.currentUserInfo = this.$store.state.currentUserInfo
        if (!this.currentUserInfo) {
            this.currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
        }
        this.username = this.currentUserInfo.username
        this.email = this.currentUserInfo.attributes.email
        this.getProfile()
    },
    methods: {
        failed (e, message) {
            console.log(e)
            alert(message)
            this.overlay = false
        },
        validation () {
            try {
                if(!this.$refs.formProfile.validate()) {
                throw "ExceptionOccured"
                }
                 this.updateProfile()
            } catch (e) {
                console.log(e)
            }
        },
        async getProfile () {
            this.overlay = true
            const getProfile = `
                query GetProfile {
                    getProfile(id: "${this.currentUserInfo.attributes.sub}") {
                        id
                        name
                        email
                        description
                        createdAt
                        updatedAt
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(getProfile))
                    .then((res) => {
                        const items = res.data.getProfile
                        this.description = ("description" in items) ? items.description : ""
                    })
            } catch (e) {
                console.log(e)
                this.description = ""
            }
            this.overlay = false
        },
        async updateProfile () {
            this.overlay = true
            const updateProfile = `
            mutation UpdateProfile {
                updateProfile(input: {
                    id: "${this.currentUserInfo.attributes.sub}",
                    name: "${this.currentUserInfo.username}",
                    email: "${this.currentUserInfo.attributes.email}",
                    description: "${this.description}"
                }) {
                id
                name
                email
                description
                }
            }
            `
            try {
                API.graphql(graphqlOperation(updateProfile))
                    .then((res)=> {
                        console.log("succeded")
                        this.showDialog = true
                    })
            } catch (e) {
                this.failed(e + "プロフィールの更新に失敗しました")
            }
            this.overlay = false
        },
    }
}
</script>