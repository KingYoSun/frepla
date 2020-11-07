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
                v-model="queryName"
                label="ユーザー名"
                :rules="[required]"
                @keyup.enter="searchUsers"
                />
                <v-btn
                dark
                fab
                small
                class="mx-2"
                color="indigo"
                @click="searchUsers"
                >
                <v-icon dark>
                    mdi-account-search
                </v-icon>
                </v-btn>
            </v-row>
        </v-form>
        <infinite-loading ref="infiniteLodaing" :identifier="infiniteId" @infinite="infiniteHandler" />
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

export default {
    components: {
        CustomOverlay,
        CustomDialog,
        InfiniteLoading
    },
    data () {
        return {
            page: 1,
            overlay: false,
            showDialog: false,
            dialogMessage: "",
            queryName: "",
            nextToken: null,
            infiniteId: 0,
            users: null,
            showUsers: false,
            required: value => !!value || "必須事項です",
        }
    },
    mounted () {
        this.infiniteId += 1
    },
    methods: {
        infiniteHandler ($state) {
            if (this.nextToken) {
                this.nextToken = `"${this.nextToken}"`
            } else if (this.page > 1) {
                $state.complete()
            }
            const searchUsers = `
            `
        }
    }
}
</script>