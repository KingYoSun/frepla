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
            <h2>パスワードを変更する</h2>
        </v-row>
        <v-form ref="formPass">
            <v-row justify="center">
                <v-text-field
                v-model="nowPass"
                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show1 ? 'text' : 'password'"
                counter
                label="現在のパスワード"
                :rules="[required]"
                @click:append="show1 = !show1"
                />
            </v-row>
            <v-row justify="center">
                <v-text-field
                v-model="newPass"
                :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show2 ? 'text' : 'password'"
                label="新しいパスワード"
                counter
                :rules="[required, need8more]"
                @click:append="show2 = !show2"
                />
            </v-row>
            <v-row justify="center">
                <v-text-field
                v-model="newPassConf"
                :append-icon="show3 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show3 ? 'text' : 'password'"
                label="新しいパスワード(確認用)"
                counter
                :rules="[required, confirm]"
                @click:append="show3 = !show3"
                />
            </v-row>
            <v-row justify="start">
                <v-btn
                color="primary"
                dark
                class="mr-4"
                @click="validation"
                >
                変更
                </v-btn>
            </v-row>
        </v-form>
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
            confirmPass: "",
            showDialog: false,
            overlay: false,
            dialogMessage: "",
            nowPass: "",
            newPass: "",
            newPassConf: "",
            show1: false,
            show2: false,
            show3: false,
            required: value => !!value || "必須事項です",
            need8more: value => value.length > 7 || "8文字以上の英数字を入力してください",
            confirm: value => value == this.newPass || '同じパスワードを入力してください'
        }
    },
    methods: {
        failed (e, message) {
            console.log(e)
            alert(message)
            this.overlay = false
        },
        validation () {
            try {
                if(!this.$refs.formPass.validate()) {
                throw "ExceptionOccured"
                }
                 this.changePass()
            } catch (e) {
                console.log(e)
            }
        },
        async changePass () {
            this.overlay = true
            const user = await Auth.currentAuthenticatedUser()
            try {
                await Auth.changePassword(
                    user,
                    this.nowPass,
                    this.newPass
                ).then((res) => {
                    console.log('update email: ' + res)
                    this.dialogMessage = "パスワードを変更しました"
                    this.overlay = false
                    this.showDialog = true
                })
            } catch (e) {
                this.failed(e, "パスワードの変更に失敗しました")
            }
        },
    },
    middleware: 'auth'
}
</script>