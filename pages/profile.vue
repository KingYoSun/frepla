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
            <v-row v-if="showPreviewImg" justify="center">
                <v-img
                :src="imgPreview"
                alt="商品画像のプレビュー"
                @error="resetImgURL"
                class="profileIcon"
                :max-width="250"
                />
            </v-row>
            <v-row>
                <v-file-input
                show-size
                accept="image/*"
                label="アイコン"
                :rules="[maxFileSize]"
                @change="storeImg"
                />
            </v-row>
            <v-row justify="center">
                <v-text-field
                v-model="username"
                label="ユーザーID"
                :rules="[required]"
                disabled
                />
            </v-row>
            <v-row justify="center">
                <v-text-field
                v-model="viewName"
                label="ユーザー名"
                :rules="[required]"
                />
            </v-row>
            <v-row justify="center">
                <v-text-field
                v-model="email"
                label="メールアドレス"
                :rules="[required]"
                disabled
                />
                <v-btn
                color="teal"
                nuxt
                to="/changeEmail"
                >
                変更する
                </v-btn>
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
                プロフィールを更新
                </v-btn>
                <v-btn
                color="teal"
                nuxt
                to="/changePass"
                >
                パスワードを変更する
                </v-btn>
            </v-row>
        </v-form>
    </v-container>
</template>

<script>
import API, { graphqlOperation } from '@aws-amplify/api'
import Storage from '@aws-amplify/storage'
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
            viewName: "",
            email: "",
            description: "",
            imgURL: null,
            imgFile: null,
            imgType: null,
            imgPreview: null,
            showPreviewImg: false,
            required: value => !!value || "必須事項です",
            maxFileSize: value => !value || value.size < 3*1024*1024 || 'ファイルサイズは3MB以下にしてください'
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
                 this.startUpdateProfile()
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
                        viewName
                        email
                        description
                        iconUrl
                        createdAt
                        updatedAt
                    }
                }
            `
            try {
                await API.graphql(graphqlOperation(getProfile))
                    .then((res) => {
                        const items = res.data.getProfile
                        this.viewName = ("viewName" in items) ? items.viewName : ""
                        this.description = ("description" in items) ? items.description : ""
                        this.imgURL = ("iconUrl" in items) ? items.iconUrl : null
                        this.setImgFile()
                    })
            } catch (e) {
                console.log(e)
                this.description = ""
            }
        },
        resetImgURL () {
            this.showPreviewImg = false
            this.imgURL = null
            this.imgFile = null
        },
        setImgFile () {
            if (this.imgURL !== null && this.imgURL !== 'null') {
                try {
                    Storage.get(this.imgURL, {level: 'protected'})
                        .then((res) => {
                            this.imgPreview = res
                            this.showPreviewImg = true
                        })
                        .catch((e) => {
                            console.log("Getting Image Failed: " + e)
                        })
                } catch (e) {
                    console.log("Getting Image Failed: " + e)
                }
            }
            this.overlay = false
        },
        storeImg (file) {
            this.imgPreview = null
            this.imgFile = null
            this.showPreviewImg = false
            try{
                if (file == undefined || file == null || file.name.lastIndexOf('.') <= 0) {
                    throw "ExceptionOccured"
                }
                const image = file
                this.imgFile = image
                this.imgType = image.type
                const reader = new FileReader()
                reader.readAsDataURL(image)
                reader.onload = () => {
                    this.imgPreview = reader.result
                    this.showPreviewImg = true
                }
            } catch (e) {
                console.log("Store Image Failed: " + e)
            }
        },
        startUpdateProfile () {
            this.overlay = true
            if (this.imgFile != null) {
                if (this.imgURL != null && this.imgURL != undefined && this.imgURL != "null") {
                    this.S3Remove()
                }
                this.S3Upload()
            } else {
                this.updateProfile()
            }
        },
        S3Remove () {
            try{
                Storage.remove(this.imgURL, { level: 'protected' })
                .then(result => {
                    this.imgURL = null
                })
                .catch(e => {
                    this.failed(e, "アイコンの削除に失敗しました")
                })
            } catch (e) {
                this.failed(e, "アイコンの削除に失敗しました")
            }
        },
        S3Upload () {
            const imgExtension = this.imgType.replace('image/', '')
            const key = 'image-icon/' + this.currentUserInfo.attributes.sub + '.' + imgExtension
            try {
                Storage.put(key, this.imgFile, {
                    level: 'protected',
                    contentType: this.imgType
                })
                .then (result => {
                    this.imgURL = result.key
                    this.updateProfile()
                })
                .catch(e => {
                    this.failed(e, "アイコンのアップロードに失敗しました")
                })
            } catch (e) {
                this.failed(e, "アイコンのアップロードに失敗しました")
            }
        },
        async updateProfile () {
            this.overlay = true
            const updateProfile = `
            mutation UpdateProfile {
                updateProfile(input: {
                    id: "${this.currentUserInfo.attributes.sub}",
                    name: "${this.currentUserInfo.username}",
                    viewName: "${this.viewName}",
                    email: "${this.currentUserInfo.attributes.email}",
                    description: "${this.description}",
                    iconUrl: "${this.imgURL}"
                }) {
                id
                name
                viewName
                email
                description
                iconUrl
                }
            }
            `
            try {
                await API.graphql(graphqlOperation(updateProfile))
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