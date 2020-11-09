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
            <div class="profile-banner-wrapper" :style="{ backgroundImage: 'url(' + banner.imgPreview + ')' }">
                <v-row v-if="icon.showPreviewImg" justify="start">
                    <v-img
                    :src="icon.imgPreview"
                    alt="アイコンのプレビュー"
                    @error="resetImgURL(icon)"
                    class="profileIcon ml-6"
                    :max-width="100"
                    />
                </v-row>
            </div>
            <v-row>
                <v-file-input
                show-size
                accept="image/*"
                label="アイコン"
                :rules="[maxFileSize]"
                @change="storeImgIcon"
                />
                <v-file-input
                show-size
                accept="image/*"
                label="バナー"
                :rules="[maxFileSize]"
                @change="storeImgBanner"
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
            <v-row justify="center">
                <v-text-field
                v-model="url"
                label="URL"
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
            currentCredentials: null,
            username: "",
            viewName: "",
            email: "",
            description: "",
            url: "",
            icon: {
                name: "icon",
                imgURL: null,
                imgFile: null,
                imgType: null,
                imgPreview: null,
                showPreviewImg: false,
            },
            banner: {
                name: "banner",
                imgURL: null,
                imgFile: null,
                imgType: null,
                imgPreview: null,
                showPreviewImg: false,
            },
            required: value => !!value || "必須事項です",
            maxFileSize: value => !value || value.size < 3*1024*1024 || 'ファイルサイズは3MB以下にしてください'
        }
    },
    async created () {
        this.currentUserInfo = this.$store.state.currentUserInfo
        if (!this.currentUserInfo) {
            this.currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
        }
        this.currentCredentials = await this.$Amplify.Auth.currentCredentials()
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
                        banner
                        url
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
                        this.icon.imgURL = ("iconUrl" in items) ? items.iconUrl : null
                        this.banner.imgURL = ("banner" in items) ? items.banner : null
                        this.url = ("url" in items) ? items.url : null
                        this.setImgFile(this.icon)
                        this.setImgFile(this.banner)
                        this.overlay = false
                    })
            } catch (e) {
                console.log(e)
                this.description = ""
            }
        },
        resetImgURL (obj) {
            obj.showPreviewImg = false
            obj.imgURL = null
            obj.imgFile = null
        },
        async setImgFile (obj) {
            if (obj.imgURL !== null && obj.imgURL !== 'null') {
                try {
                    await Storage.get(obj.imgURL, {level: 'protected'})
                        .then((res) => {
                            obj.imgPreview = res
                            obj.showPreviewImg = true
                        })
                        .catch((e) => {
                            console.log("Getting Image Failed: " + e)
                        })
                } catch (e) {
                    console.log("Getting Image Failed: " + e)
                }
            }
        },
        storeImgIcon (file) {
            this.icon.imgPreview = null
            this.icon.imgFile = null
            this.icon.showPreviewImg = false
            try{
                if (file == undefined || file == null || file.name.lastIndexOf('.') <= 0) {
                    throw "ExceptionOccured"
                }
                const image = file
                this.icon.imgFile = image
                this.icon.imgType = image.type
                const reader = new FileReader()
                reader.readAsDataURL(image)
                reader.onload = () => {
                    this.icon.imgPreview = reader.result
                    this.icon.showPreviewImg = true
                }
            } catch (e) {
                console.log("Store Image Failed: " + e)
            }
        },
        storeImgBanner (file) {
            this.banner.imgPreview = null
            this.banner.imgFile = null
            this.banner.showPreviewImg = false
            try{
                if (file == undefined || file == null || file.name.lastIndexOf('.') <= 0) {
                    throw "ExceptionOccured"
                }
                const image = file
                this.banner.imgFile = image
                this.banner.imgType = image.type
                const reader = new FileReader()
                reader.readAsDataURL(image)
                reader.onload = () => {
                    this.banner.imgPreview = reader.result
                    this.banner.showPreviewImg = true
                }
            } catch (e) {
                console.log("Store Image Failed: " + e)
            }
        },
        async startUpdateProfile () {
            this.overlay = true
            if (this.icon.imgFile != null) {
                if (this.icon.imgURL != null && this.icon.imgURL != undefined && this.icon.imgURL != "null") {
                    await this.S3Remove(this.icon)
                }
                await this.S3Upload(this.icon)
            }
            if (this.banner.imgFile != null) {
                if (this.banner.imgURL != null && this.banner.imgURL != undefined && this.banner.imgURL != "null") {
                    await this.S3Remove(this.banner)
                }
                await this.S3Upload(this.banner)
            }
            this.updateProfile()
        },
        async S3Remove (obj) {
            try{
                await Storage.remove(obj.imgURL, { level: 'protected' })
                .then(result => {
                    obj.imgURL = null
                })
                .catch(e => {
                    this.failed(e, "アイコンの削除に失敗しました")
                })
            } catch (e) {
                this.failed(e, "アイコンの削除に失敗しました")
            }
        },
        async S3Upload (obj) {
            const imgExtension = obj.imgType.replace('image/', '')
            const key = 'image-' + obj.name + '/' + this.currentUserInfo.attributes.sub + '.' + imgExtension
            try {
                await Storage.put(key, obj.imgFile, {
                    level: 'protected',
                    contentType: obj.imgType
                })
                .then (result => {
                    obj.imgURL = result.key
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
            const date = new Date()
            const nowUnix = Math.floor(date.getTime() / 1000)
            const updateProfile = `
            mutation UpdateProfile {
                updateProfile(input: {
                    id: "${this.currentUserInfo.attributes.sub}",
                    name: "${this.currentUserInfo.username}",
                    viewName: "${this.viewName}",
                    email: "${this.currentUserInfo.attributes.email}",
                    div: 1,
                    lastLogin: ${nowUnix},
                    description: "${this.description}",
                    iconUrl: "${this.icon.imgURL}",
                    banner: "${this.banner.imgURL}",
                    url: "${this.url}",
                    identityId: "${this.currentCredentials.identityId}"
                }) {
                id
                name
                viewName
                email
                div
                lastLogin
                description
                iconUrl
                banner
                url
                identityId
                }
            }
            `
            try {
                await API.graphql(graphqlOperation(updateProfile))
                    .then((res)=> {
                        console.log("succedeed")
                        this.showDialog = true
                        this.$store.commit("setImg", this.icon.imgPreview)
                    })
            } catch (e) {
                this.failed(e + "プロフィールの更新に失敗しました")
            }
            this.overlay = false
        },
    }
}
</script>

<style>
.profile-banner-wrapper {
  width: 100%;
  min-height: 200px;
  background-size: cover;
  display: flex;
  align-items: center;
}
</style>