<template>
  <div v-if="banner && icon" class="user-banner-wrapper-small" :style="{ backgroundImage: 'url(' + banner.imgPreview + ')' }">
    <div class="user-banner-container-small">
      <div class="user-info-first-small">
        <div class="user-link-image-small">
          <v-img
          :src="icon.imgPreview"
          alt="アイコンのプレビュー"
          @error="resetImgURL(icon)"
          class="user-image-small"
          :max-width="100"
          />
        </div>
        <div class="user-link-small">
          <div class="user-name-box-small">
            <h1>{{ user.viewName }}</h1>
            <h2>@{{ user.name }}</h2>
          </div>
        </div>
        <a class="user-follow-btn-small" :href="'https://twitter.com/intent/follow?screen_name=' + user.viewName" target="_blank">フォロー</a>
      </div>
      <div class="user-count-small">
        <div class="user-follow-count-small">
          <h3>
            フォロー: {{ follow_count }}
          </h3>
        </div>
        <div class="user-follower-count-small">
          <h3>
            フォロワー: {{ follower_count }}
          </h3>
        </div>
      </div>
      <div class="user-description-small">
        <!-- eslint-disable-next-line -->
        <p id="user-description-small" v-html="autoLink" />
      </div>
    </div>
  </div>
</template>

<script>
import TwitterText from 'twitter-text'
import API, { graphqlOperation } from '@aws-amplify/api'
import Storage from '@aws-amplify/storage'

export default {
  name: 'UserCardSmall',
  data () {
    return {
      follow_count: 0,
      follower_count: 0,
      styleGridSpan: '',
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
    }
  },
  props: {
    user: {
      type: Object,
      default () {
        return {
          viewName: '',
          name: '',
          banner: '',
          description: '',
          iconUrl: '',
          url: '',
          identityId: ""
        }
      }
    }
  },
  computed: {
    autoLink () {
      return TwitterText.autoLink(String(this.user.description), {
        targetBlank: true
      })
    }
  },
  methods: {
    resetImgURL (obj) {
        obj.showPreviewImg = false
        obj.imgURL = null
        obj.imgFile = null
    },
    setImgUrlIcon () {
      this.icon.imgURL = this.user.iconUrl
      this.setImgFile(this.icon)
    },
    setImgUrlBanner () {
      this.banner.imgURL = this.user.banner
      this.setImgFile(this.banner)
    },
    async setImgFile (obj) {
        if (obj.imgURL !== null && obj.imgURL !== 'null' && this.user.identityId !== null) {
            try {
                await Storage.get(obj.imgURL, {
                  level: 'protected',
                  identityId: this.user.identityId
                }).then((res) => {
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
  }
}
</script>
<style>
.user-banner-wrapper-small {
  margin-top: 5px;
  background-size: cover;
  display: flex;
  align-items: center;
  border-radius: 10px;
  box-shadow: 3px 3px 10px #000, -3px -3px 10px #000;
}
.user-banner-container-small {
  width: 100%;
  max-width: 900px;
  background-color: rgba(0, 0, 0, 0.6);
}
.user-info-first-small {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  padding: 3px 12px;
}
.user-image-small {
  max-width: 60px;
  width: 20vw;
  height: auto;
  border-radius: 50px;
  border: 3px var(--text-color-main) solid;
}
.user-link-small {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  text-decoration: none;
  padding: 5px;
}
.user-link-small h1 {
  font-size: 1.0em;
  width: 14em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color-main);
}
.user-link-small h1:hover {
  color: var(--text-color-main-hover);
}
.user-link-small h2 {
  font-size: 0.85em;
  width: 14em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color-sub);
}
.user-link-small h2:hover {
  color: var(--text-color-sub-hover);
}
.user-count-small {
  display: flex;
  flex-wrap: nowrap;
  padding: 3px 20px;
}
.user-count-small div {
  font-size: 1.0em;
  text-align: center;
  margin: 0px 5px;
}
.user-follow-btn-small {
  white-space: nowrap;
  font-size: 1.0em;
  text-decoration: none;
  padding: 5px;
  color: white;
  background-color: var(--twitter-blue);
  border-radius: 15px;
  border: 2px var(--twitter-blue) solid;
}
.user-follow-btn-small:hover {
  background-color: rgba(255, 255, 255, 0.6);
  color: var(--twitter-blue);
}
.user-description-small {
  font-size: 0.8em;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  color: var(--text-color-p);
  padding: 3px 20px;
}
.user-description-small a {
  text-decoration: none;
  color: var(--text-color-main-hover);
}
.user-description-small a:hover {
  color: gray;
}
</style>