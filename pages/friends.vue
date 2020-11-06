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
                color="cyan"
                @click="searchUsers"
                >
                <v-icon dark>
                    mdi-account-search
                </v-icon>
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
import API, { graphqlOperation } from '@aws-amplify/api'
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
            dialogMessage: "",
            queryName: "",
            required: value => !!value || "必須事項です",
        }
    },
    methods: {
        searchUsers () {
            console.log(this.queryName)
        }
    }
}
</script>