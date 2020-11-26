<template>
    <div class="user-banner-container-small">
        <v-row class="user-info-first-small">
            <div>
                <v-img
                :src="icon.imgPreview"
                alt="アイコンのプレビュー"
                @error="resetImgURL(icon)"
                class="user-image-mid"
                :max-width="60"
                />
            </div>
            <div class="user-link-small">
                <div class="user-name-box-small">
                    <span class="user-viewName">{{ user.viewName }}</span>
                    <span class="user-name">@{{ user.name }}</span><br/>
                    <span id="user-description-small" v-html="autoLink" />
                </div>
            </div>
        </v-row>
    </div>
</template>

<script>
import TwitterText from 'twitter-text'
import API, { graphqlOperation } from '@aws-amplify/api'
import * as Common from '~/assets/js/common.js'

export default {
    name: 'UserCardSmall',
    data () {
        return {
            styleGridSpan: '',
            user: {
                id: "",
                viewName: '',
                name: '',
                description: '',
                iconUrl: '',
                identityId: "",
                status: ""
            },
            icon: {
                name: "icon",
                imgURL: null,
                imgFile: null,
                imgType: null,
                imgPreview: null,
                showPreviewImg: false,
            },
            disableBtn: false
        }
    },
    props: {
        userId: null,
    },
    computed: {
        autoLink () {
            return TwitterText.autoLink(String(this.user.description), {
                targetBlank: true
            })
        }
    },
    mounted () {
        this.getProfile()
    },
    methods: {
        failed (e, message) {
            console.log(e)
            alert(message)
            this.overlay = false
        },
        resetImgURL (obj) {
                obj.showPreviewImg = false
                obj.imgURL = null
                obj.imgFile = null
        },
        setImgUrlIcon () {
            this.icon.imgURL = this.user.iconUrl
            Common.setImgFileUser(this.icon, this.user.identityId)
        },
        async getProfile () {
            const getProfile = `
                query GetProfile {
                    getProfile(id: "${this.userId}") {
                        id
                        name
                        viewName
                        iconUrl
                        identityId
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
                        this.user.show = (items != null || items != undefined) ? true : false
                        this.user.viewName = ("viewName" in items) ? items.viewName : ""
                        this.user.name= ("name" in items) ? items.name : ""
                        this.user.iconUrl = ("iconUrl" in items) ? items.iconUrl : null
                        this.user.identityId = ("identityId" in items) ? items.identityId : null
                        this.user.description = ("description" in items) ? items.description : null
                        this.setImgUrlIcon()
                    })
            } catch (e) {
                console.log(e)
            }
        },
    }
}
</script>
<style>
.user-banner-container-small {
    width: 100%;
    max-width: 900px;
}
.user-info-first-small {
    display: flex;
    align-items: center;
    padding: 3px 12px;
}
.user-link-small {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    text-decoration: none;
    padding: 5px;
    color: white;
}
.user-viewName {
    font-size: 1.0em;
    width: 14em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: white;
}
.user-name {
    font-size: 0.9em;
    width: 14em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: white;
}
.user-name:hover,
.user-viewName:hover {
    color: gray;
}
.user-description-small {
    font-size: 0.75em;
    width: 100%;
    color: white;
}
.user-description-small a {
    text-decoration: underline;
    color: white;
}
.user-description-small a:hover {
    color: gray;
}
</style>