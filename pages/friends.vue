<template>
    <v-container fluid style="max-width: 800px;">
        <custom-overlay :overlay="overlay" />
        <custom-dialog
        :dialog="showDialog"
        :message="dialogMessage"
        :cancel="false"
        @agree="showDialog = !showDialog"
        />
        <v-form ref="search" @submit.prevent>
            <v-row justify="start" class="my-2">
                <h2>ユーザー検索</h2>
            </v-row>
            <v-row justify="center">
                <v-text-field
                v-model="queryKey"
                label="ユーザー名"
                :rules="[required]"
                @keyup.enter="startSearchUsers"
                />
                <v-btn
                dark
                fab
                small
                class="mx-2"
                color="indigo"
                @click="startSearchUsers"
                >
                <v-icon dark>
                    mdi-account-search
                </v-icon>
                </v-btn>
            </v-row>
        </v-form>
        <div class="user-list">
            <div v-for="(user, $index) in users" :id="'userContainer-' + user.name" :key="$index" class="my-6">
                <user-card-small :ref="'userCardSmall-' + user.id" :user="user" />
            </div>
        </div>
        <infinite-loading ref="infiniteLoading" :identifier="infiniteId" @infinite="infiniteHandler" />
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
import API, { graphqlOperation } from '@aws-amplify/api'
import InfiniteLoading from 'vue-infinite-loading'
import CustomOverlay from '~/components/overlay.vue'
import CustomDialog from '~/components/dialog.vue'
import UserCardSmall from '~/components/userCardSmall.vue'

export default {
    components: {
        CustomOverlay,
        CustomDialog,
        InfiniteLoading,
        UserCardSmall
    },
    data () {
        return {
            page: 1,
            overlay: false,
            showDialog: false,
            dialogMessage: "",
            queryKey: "",
            nextToken: null,
            infiniteId: 0,
            users: [],
            showUsers: false,
            required: value => !!value || "必須事項です",
        }
    },
    methods: {
        failed (e, message) {
            console.log(e)
            alert(message)
            this.overlay = false
        },
        startSearchUsers () {
            this.users = []
            this.nextToken = null
            this.page = 0
            this.$refs.infiniteLoading.stateChanger.reset()
            this.infiniteId += 1
        },
        infiniteHandler ($state) {
            let nextToken = null
            if (this.nextToken) {
                nextToken = `"${this.nextToken}"`
            } else if (this.page > 1) {
                $state.complete()
            }
            const searchUsers = `
                query ProfileSortedByLastTime {
                    profileSortedByLastTime(
                    div: 1
                    sortDirection: DESC
                    filter: { 
                        or: [
                            {name: {contains: "${this.queryKey}"}},
                            {viewName: {contains: "${this.queryKey}"}},
                            {description: {contains: "${this.queryKey}"}}
                        ]
                    }
                    limit: 20
                    nextToken: ${nextToken}
                    ) {
                    items {
                        id
                        name
                        viewName
                        email
                        iconUrl
                        banner
                        url
                        div
                        lastLogin
                        description
                        identityId
                    }
                    nextToken
                    }
                }
            `
            try {
                API.graphql(graphqlOperation(searchUsers))
                    .then((res) => {
                        this.page += 1
                        const items = res.data.profileSortedByLastTime.items
                        for (const item of items) {
                            if (this.users.find(elem => elem.id === item.id) === undefined) {
                                this.users.push(item)
                            }
                        }
                        this.nextToken = res.data.profileSortedByLastTime.nextToken
                        $state.loaded()
                        for (const item of items) {
                            this.$refs['userCardSmall-' + item.id][0].setImgUrlIcon()
                            this.$refs['userCardSmall-' + item.id][0].setImgUrlBanner()
                        }
                    })
            } catch (e) {
                $state.complete()
            }
        }
    }
}
</script>