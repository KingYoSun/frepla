<template>
    <v-form ref="formMessage" style="width: 100%;" class="mb-2" @submit.prevent>
        <v-row justify="center">
            <v-avatar
            color="indigo"
            size="60"
            class="ml-2"
            >
                <v-icon dark v-if="!profile.showPreviewImg">mdi-account-circle</v-icon>
                <v-img
                :src="profile.imgPreview"
                v-if="profile.showPreviewImg"
                alt="ユーザアイコン"
                @error="removeImg"
                class="profileIcon"
                :max-width="60"
                />
            </v-avatar>
            <v-textarea
            outlined
            rows="4"
            :value="messageInputBox"
            @input="$emit('update:messageInputBox', $event)"
            ref="messageBox"
            class="mx-2"
            :label="label"
            :rules="[required]"
            :disabled="messageInputBoxDisable"
            >
            </v-textarea>
        </v-row>
        <v-row justify="end">
            <v-btn
            color="primary"
            dark
            class="mr-4"
            :disabled="sendButtonDisable"
            @click="validation"
            >
            POST
            </v-btn>
        </v-row>
    </v-form>
</template>

<script>
export default {
    name: "FormPost",
    data () {
        return {
            required: value => !!value || "必須事項です",
        }
    },
    props: {
        label: {
            type: String,
            default: "投稿内容"
        },
        messageInputBox: {
            type: String,
            default: ""
        },
        messageInputBoxDisable: {
            type: Boolean,
            default: false
        },
        sendButtonDisable: {
            type: Boolean,
            default: false
        },
        profile: {
            type: Object,
            dafault () {
                return {
                    id: "",
                    name: "",
                    viewName: "",
                    imgURL: null,
                    showPreviewImg: false,
                    imgPreview: null
                }
            }
        }
    },
    methods: {
        removeImg () {
            this.$store.commit("removeImg")
        },
        validation () {
            try {
                if(!this.$refs.formMessage.validate()) {
                    throw "ExceptionOccured"
                }
                this.$emit("put")
            } catch (e) {
                console.log(e)
            }
        },
    }
}
</script>