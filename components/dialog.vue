<template>
    <v-dialog
    v-model="dialog"
    max-width="600"
    >
        <v-card>
            <v-card-title class="justify-center">{{ message }}</v-card-title>
            <v-card-actions class="justify-center">
                <v-btn
                v-if="cancel"
                color="gray"
                @click="dialog = false"
                >
                キャンセル
                </v-btn>
                <v-btn
                color="primary"
                @click="agree"
                >
                OK
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: "CustomDialog",
    props: {
        dialog: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: ""
        },
        cancel: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        agree () {
            this.$emit("agree")
        }
    }
}
</script>