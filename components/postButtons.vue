<template>
    <v-row justify="start">
        <v-btn
        color="blue"
        icon
        class="ml-2"
        @click="setReply"
        >
            <v-icon>mdi-message-reply</v-icon>
        </v-btn>
        <v-btn
        color="grey lighten-3"
        text
        class="mr-2"
        style="padding: 0px;"
        min-width="20"
        >
            {{ (this.post.replyFromId != null && this.post.replyFromId != undefined) ? post.replyFromId.length : 0 }}
        </v-btn>
        <v-btn
        color="green"
        icon
        class="mx-4"
        >
            <v-icon>mdi-cached</v-icon>
        </v-btn>
        <v-btn
        color="pink"
        icon
        class="mx-4"
        >
            <v-icon>mdi-heart</v-icon>
        </v-btn>
        <!--
        <v-btn
        color="brown"
        icon
        class="mx-4"
        >
            <v-icon>mdi-book</v-icon>
        </v-btn>
        -->
        <v-btn
        color="gray"
        icon
        class="mx-4"
        @click="deletePost"
        >
            <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
    </v-row>
</template>

<script>
export default {
    name: "PostButtons",
    props: {
        post: {
            type: Object,
            default () {
                return {
                    id: "",
                    name: "",
                    viewName: "",
                    userId: "",
                    text: "",
                    files: [],
                    createdAt: 0,
                    updatedAt: 0,
                    replyToId: "",
                    replyFromId: [],
                    like: [],
                    rePost: []
                }
            }
        }
    },
    methods: {
        setReply () {
            this.$emit("reply", this.post)
        },
        deletePost () {
            this.$emit("delete", this.post)
        },
    }
}
</script>