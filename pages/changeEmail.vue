<template>
    <v-container fluid style="max-width: 600px;">
        <custom-overlay :overlay="overlay" />
        <custom-dialog
        :dialog="showDialog"
        :message="dialogMessage"
        :cancel="false"
        @agree="showDialog = !showDialog"
        />
        <v-row justify="start" class="mb-4">
            <h2>メールアドレスを変更する</h2>
        </v-row>
        <v-form ref="formEmail">
            <v-row justify="center">
                <v-text-field
                v-model="email"
                label="変更先メールアドレス"
                :rules="[required, validateEmail]"
                />
            </v-row>
            <v-row justify="center">
                <v-text-field
                v-model="confirmEmail"
                label="確認用メールアドレス"
                :rules="[required, confirm]"
                />
            </v-row>
            <v-row justify="start">
                <v-btn
                    color="primary"
                    dark
                    class="mr-4"
                    @click="validation"
                    >
                    確認メールを送信
                </v-btn>
            </v-row>
        </v-form>
        <div>
            <v-row justify="start" class="mt-6">
                <h3>確認用コードを入力する</h3>
            </v-row>
            <v-form ref="formConfirm">
                <v-row justify="center">
                    <v-text-field
                    v-model="code"
                    label="確認用コード"
                    :rules="[required]"
                    />
                </v-row>
                <v-row justify="start">
                    <v-btn
                        color="primary"
                        dark
                        class="mr-4"
                        @click="verifyEmail"
                        >
                        確認
                    </v-btn>
                </v-row>
            </v-form>
        </div>
        <v-row justify="start" class="mt-6">
            <v-btn
                color="teal"
                dark
                nuxt
                to="/profile"
                >
                戻る
            </v-btn>
        </v-row>
    </v-container>
</template>

<script>
import Auth from '@aws-amplify/auth'
import API, { graphqlOperation } from '@aws-amplify/api'
import CustomOverlay from '~/components/overlay.vue'
import CustomDialog from '~/components/dialog.vue'

const patternEmail = new RegExp(/^(([^<>()[\]\\.,;:\s@]+(\.[^<>()[\]\\.,;:\s@]+)*)|(.+))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

export default {
    components: {
        CustomOverlay,
        CustomDialog
    },
    data () {
        return {
            currentUserInfo: null,
            username: "",
            email: "",
            confirmEmail: "",
            showDialog: false,
            overlay: false,
            dialogMessage: "",
            code: "",
            required: value => !!value || "必須事項です",
            validateEmail: value => patternEmail.test(value) || 'メールアドレスを入力してください',
            confirm: value => value == this.email || '確認用メールアドレス欄にも同様のメールアドレスを入力してください'
        }
    },
    async created () {
        this.currentUserInfo = this.$store.state.currentUserInfo
        if (!this.currentUserInfo) {
            this.currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
        }
        this.username = this.currentUserInfo.username
        this.email = this.currentUserInfo.attributes.email
    },
    methods: {
        failed (e, message) {
            console.log(e)
            alert(message)
            this.overlay = false
        },
        validation () {
            try {
                if(!this.$refs.formEmail.validate()) {
                throw "ExceptionOccured"
                }
                 this.updateEmail()
            } catch (e) {
                console.log(e)
            }
        },
        verifyValidation () {
            try {
                if(!this.$refs.formConfirm.validate()) {
                throw "ExceptionOccured"
                }
                 this.verifyEmail()
            } catch (e) {
                console.log(e)
            }
        },
        async updateEmail () {
            this.overlay = true
            const user = await Auth.currentAuthenticatedUser()
            try {
                await Auth.updateUserAttributes(
                    user,
                    { 
                        email: this.email, // 新しいメールアドレス
                    }
                ).then((res) => {
                    console.log('update email: ' + res)
                    this.dialogMessage = "確認用メールを送信しました。メールに記載されているコードを確認用フォームに入力してください"
                    this.overlay = false
                    this.showDialog = true
                })
            } catch (e) {
                this.failed(e, "確認メールの送信に失敗しました。再送信ボタンから確認メールを再送信してください")
            }
        },
        async verifyEmail () {
            try {
                await Auth.verifyCurrentUserAttributeSubmit(
                    'email',
                    this.code // 認証コード
                ).then((res)=> {
                    console.log('verify email: ' + res)
                    this.updateProfile()
                })
            } catch (e) {
                this.failed(e, "確認メールの送信に失敗しました。確認メールを確認してから再度確認メールを送信してください")
            }
        },
        async updateProfile () {
            const updateProfile = `
            mutation UpdateProfile {
                updateProfile(input: {
                    id: "${this.currentUserInfo.attributes.sub}",
                    name: "${this.username}",
                    email: "${this.email}",
                }) {
                id
                name
                email
                }
            }
            `
            try {
                await API.graphql(graphqlOperation(updateProfile))
                    .then((res)=> {
                        console.log("succeded")
                        this.currentUserInfo.attributes.email = this.email
                        this.$store.commit('login', this.currentUserInfo)
                        this.dialogMessage = "メールアドレスの確認が完了しました"
                        this.overlay = false
                        this.showDialog = true
                    })
            } catch (e) {
                this.failed(e + "プロフィールの更新に失敗しました")
            }
        },
    },
    middleware: 'auth'
}
</script>