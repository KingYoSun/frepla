<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div class="text-center">
        <logo />
        <vuetify-logo />
      </div>
      <v-card>
        <v-card-title class="headline">
          Welcome to the FrePla Project
        </v-card-title>
        <v-card-text>
          <p>
            FrePlaはwebRTCを利用したP2PテキストSNSです
          </p>
          <div v-for="message in messages" :key="message.createdAt">
            <v-row justify="center" style="color: #fff;">
              <h3>{{ message.message }}</h3>
            </v-row>
          </div>
          <div>
            <v-form ref="formMessage" @submit.prevent>
              <v-row>
                <v-text-field
                v-model="sendMessage"
                class="mx-4"
                label="message"
                :rules="[required]"
                @keyup.enter="validation"
                >
                </v-text-field>
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
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import API, { graphqlOperation } from '@aws-amplify/api'
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'

export default {
  components: {
    Logo,
    VuetifyLogo,
  },
  data () {
    return {
      sendMessage: "",
      messages: [],
      subscription: null,
      required: value => !!value || "必須事項です",
    }
  },
  created () {
    this.subscribe()
  },
  methods: {
    getNowISO8601 () {
      const date = new Date()
      const isoStr = date.toISOString()
      return isoStr
    },
    getTTL () {
      const date = new Date()
      const unixtimenow = Math.floor(date.getTime() / 1000)
      const timeToLive = unixtimenow + 3600
      return timeToLive
    },
    validation () {
      try {
        if(!this.$refs.formMessage.validate()) {
          throw "ExceptionOccured"
        }
        this.mutateMessage()
      } catch (e) {
        console.log(e)
      }
    },
    async mutateMessage () {
      const createMessage = `
        mutation CreateMessage {
          createMessage(input: { 
            fromUserId: "${this.$store.state.currentUserInfo.attributes.sub}",
            toUserId: "1",
            message: "${this.sendMessage}",
            ttl: ${this.getTTL()},
            createdAt: "${this.getNowISO8601()}",
            updatedAt: "${this.getNowISO8601()}"
          }) {
            fromUserId
            toUserId
            message
            ttl
            createdAt
            updatedAt
          }
        }
      `
      try {
        await API.graphql(graphqlOperation(createMessage))
          .then( (res) => {
            this.sendMessage = ""
            console.log("mutationMessage Mutated")
          })
      } catch (e) {
        console.log("mutationMessage Failed: " + e)
      }
    },
    subscribe () {
      const onCreatMessage = `
        subscription OnCreateMessage {
          onCreateMessage {
            fromUserId
            toUserId
            message
            ttl
            createdAt
            updatedAt
          }
        }
      `
      this.subscription = API.graphql(graphqlOperation(onCreatMessage))
        .subscribe({
          next: (event) => {
            if (event) {
              console.log(event)
              const messageObj = event.value.data.onCreateMessage
              this.messages.push(messageObj)
            }
          }
        })
    }
  }
}
</script>
