<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :clipped="clipped"
      fixied
      app
    >
      <v-list class="pa-1" v-if="isLoggedIn">
        <div style="display: flex;flex-wrap: nowrap;align-items: center;">
          <v-avatar
            color="indigo"
            size="40"
          >
            <v-icon dark>mdi-account-circle</v-icon>
          </v-avatar>
          <span class="mx-2">{{$store.state.currentUserInfo.attributes.email}}</span>
        </div>
        <amplify-sign-out class="mx-auto" v-if="isLoggedIn" />
      </v-list>
      <v-list class="pt-2" dense>
        <v-btn class="ml-4" text nuxt to="/signin" v-if="!isLoggedIn">サインイン</v-btn>
      </v-list>
      <v-list class="pt-2" dense>
        <v-divider></v-divider>
        <v-list-item
          v-for="(item, i) in filteredItems"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn icon @click.stop="fixed = !fixed">
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
    </v-app-bar>

    <v-main>
      <v-container class="my-6" :style="containerStyle">
        <nuxt />
      </v-container>
    </v-main>
    
    <v-footer
      class="main-footer"
      absolute
      :fixed="fixed"
      app
    >
      <div style="margin: 0 auto;">
        <span>&copy; 2020 KingYoSun</span>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import { AmplifyEventBus } from 'aws-amplify-vue'
export default {
  data () {
    return {
      backgroundColor: "gray darken-4",
      drawer: false,
      userMenu: null,
      fixed: false,
      clipped: false,
      items: [
        {
          icon: 'mdi-home',
          title: 'ホーム',
          to: '/',
          status: ['loggedIn']
        },
        {
          icon: 'mdi-account',
          title: 'プロフィール',
          to: '/profile',
          status: ['loggedIn']
        }
      ],
      title: 'FrePla',
      isLoggedIn: false,
      defaultContainerStyle: {
        maxWidth: "1200px",
        minWidth: null,
        backgroundColor: "gray-darken-3",
        borderRadius: "10px",
        boxShadow: "2px 2px 8px #000000; -2px -2px 8px #000000;"
      },
      containerStyle: {}
    }
  },
  async beforeCreate() {
    AmplifyEventBus.$on('authState', (info) => {
      if (info === 'signedIn') {
        this.$router.push('/')
        this.getUserInfo()
      } else if (info === 'signedOut') {
        this.$router.push('/signin')
        this.getUserInfo()
      }
    })
  },
  created () {
    this.containerStyle = JSON.parse(JSON.stringify(this.defaultContainerStyle))
    this.setListener()
    this.getUserInfo()
  },
  methods: {
    setListener () {
      this.$nuxt.$on('defineContainerStyle', this.defineContainerStyle)
      this.$nuxt.$on('resetContainerStyle', this.resetContainerStyle)
    },
    resetContainerStyle () {
      this.containerStyle = JSON.parse(JSON.stringify(this.defaultContainerStyle))
    },
    defineContainerStyle (style) {
      if ("maxWidth" in style) {
        this.containerStyle.maxWidth = style.maxWidth
      }
      if ("minWidth" in style) {
        this.containerStyle.minWidth = style.minWidth
      }
      if ("backgroundColor" in style) {
        this.containerStyle.backgroundColor = style.backgroundColor
      }
      if ("borderRadius" in style) {
        this.containerStyle.borderRadius = style.borderRadius
      }
      if ("boxShadow" in style) {
        this.containerStyle.boxShadow = style.boxShadow
      }
    },
    async getUserInfo () {
      const currentUserInfo = await this.$Amplify.Auth.currentUserInfo()
      this.$store.commit('login', currentUserInfo)
      this.isLoggedIn = Boolean(currentUserInfo)
    },
    logout () {
      this.$store.commit('logout')
      this.isLoggedIn = false
    }
  },
  computed: {
    filteredItems () {
      const self = this
      return self.items.filter((item) => {
        if (self.isLoggedIn) {
          return item.status.indexOf('loggedIn') !== -1
        } else {
          return item.status.indexOf('loggedOut') !== -1
        }
      })
    }
  }
}
</script>

<style>
.main-footer {
  background-color: #616161;
  box-shadow: 5px 5px 20px black;
}
</style>