<template>
  <div class="user-banner-wrapper-small" :style="{ backgroundImage: 'url(' + user.banner + ')' }">
    <div class="user-banner-container-small">
      <div class="user-info-first-small">
        <n-link :to="{ name: 'user-userScreenName', params: { userScreenName: user.viewName} }" class="user-link-image-small">
          <img :src="user.iconUrl" class="user-image-small">
        </n-link>
        <n-link :to="{ name: 'user-userScreenName', params: { userScreenName: user.viewName} }" class="user-link-small">
          <div class="user-name-box-small">
            <h1>{{ user.name }}</h1>
            <h2>@{{ user.viewName }}</h2>
          </div>
        </n-link>
        <a class="user-follow-btn-small" :href="'https://twitter.com/intent/follow?screen_name=' + user.viewName" target="_blank">フォロー</a>
      </div>
      <div class="user-count-small">
        <div class="user-follow-count-small">
          <h3>
            フォロー: {{ user.follow_count }}
          </h3>
        </div>
        <div class="user-follower-count-small">
          <h3>
            フォロワー: {{ user.follower_count }}
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

export default {
  name: 'userCardSmall',
  data () {
      return {
          follow_count: 0,
          follower_count: 0
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
          url: ''
        }
      }
    }
  },
  data () {
    return {
      styleGridSpan: ''
    }
  },
  computed: {
    autoLink () {
      return TwitterText.autoLink(String(this.user.description), {
        targetBlank: true
      })
    }
  }
}
</script>
<style>
.user-banner-wrapper-small {
  margin-top: 5px;
  background-size: cover;
  display: flex;
  align-items: center;
  box-shadow: 3px 3px 10px var(--border-dark), -3px -3px 10px var(--border-dark);
}
.user-banner-container-small {
  width: 100%;
  max-width: 900px;
  background-color: rgba(255, 255, 255, 0.6);
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
  color: white;
}
</style>