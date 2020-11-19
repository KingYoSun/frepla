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
            {{ (post.replyFromId != null && post.replyFromId != undefined) ? post.replyFromId.length : 0 }}
        </v-btn>
        <v-btn
        :color="(rePostInclude)? 'green' : 'green lighten-3'"
        icon
        class="mx-4"
        @click="rePost"
        >
            <v-icon>mdi-cached</v-icon>
        </v-btn>
        <v-btn
        color="grey lighten-3"
        text
        class="mr-2"
        style="padding: 0px;"
        min-width="20"
        >
            {{ (post.rePost != null && post.rePost != undefined) ? post.rePost.length : 0 }}
        </v-btn>
        <v-btn
        color="pink"
        icon
        class="mx-4"
        @click="addLike"
        >
            <v-icon>{{ (likeInclude)? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
        </v-btn>
        <v-btn
        color="grey lighten-3"
        text
        class="mr-2"
        style="padding: 0px;"
        min-width="20"
        >
            {{ (post.like != null && post.like != undefined) ? post.like.length : 0 }}
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
    computed: {
        rePostInclude () {
            return this.post.rePost.includes(this.$store.state.currentUserInfo.attributes.sub)? true : false
        },
        likeInclude () {
            return this.post.like.includes(this.$store.state.currentUserInfo.attributes.sub)? true : false
        }
    },
    methods: {
        setReply () {
            this.$emit("reply", this.post)
        },
        deletePost () {
            this.$emit("delete", this.post)
        },
        rePost () {
            if (this.rePostInclude) {
                this.$emit("removeRePost", this.post)
            } else {
                this.$emit("rePost", this.post)
            }
        },
        addLike () {
            if (this.likeInclude) {
                this.$emit("removeLike", this.post)
            } else {
                this.$emit("addLike", this.post)
            }
        }
    }
}
</script>