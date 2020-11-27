<template>
    <v-card v-if="firstPost != null">
        <v-card-title class="justify-start">スレッドを表示</v-card-title>
        <v-divider />
        <v-divider />
        <v-list-item>
            <post
            :ref="'post-' + firstPost.id"
            :post="firstPost"
            :showButtons="true"
            @reply="setReply"
            @delete="deletePost"
            @rePost="rePost"
            @removeRePost="removeRePost"
            @addLike="addLike"
            @removeLike="removeLike"
            @listLike="listLike"
            @listRePost="listRePost"
            />
        </v-list-item>
        <v-divider />
        <div v-for="(childThread, index) in childThreadList" :key="index">
            <div v-for="post in childThread" :key="post.id">
                <v-list-item>
                    <post
                    :ref="'post-' +post.id"
                    :post="post"
                    :showButtons="true"
                    @reply="setReply"
                    @delete="deletePost"
                    @rePost="rePost"
                    @removeRePost="removeRePost"
                    @addLike="addLike"
                    @removeLike="removeLike"
                    @listLike="listLike"
                    @listRePost="listRePost"
                    />
                </v-list-item>
            </div>
            <v-divider />
        </div>
    </v-card>
</template>

<script>
import Post from '~/components/post.vue'

export default {
    name: "Thread",
    components: {
        Post
    },
    data () {
        return {
            db: null,
            firstPost: null,
            childThreadList: [],
        }
    },
    props: {
        flag: false,
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
                    replyToPost: {},
                    replyFromId: [],
                    threadId: "",
                    indent: 0,
                    like: [],
                    rePost: []
                }
            }
        }
    },
    watch: {
        flag: {
            handler: function(updated, old) {
                if(updated) {
                    this.collectPosts()
                }
            }
        }
    },
    mounted () {
        if(this.$store.state.db == null) this.$store.commit("newDB")
        this.db = this.$store.state.db
        this.collectPosts()
    },
    methods: {
        collectPosts () {
            this.db.posts.where("threadId")
                        .equals(this.post.threadId)
                        .reverse()
                        .sortBy("createdAt")
                        .then((posts) => {
                            if (posts != null && posts != undefined && posts.length > 0) {
                                this.firstPost = posts.pop()
                            }
                            let childThreads = {}
                            posts.map((post) => {
                                if (post.replyToId === this.firstPost.id) {
                                    childThreads[post.id] = [post]
                                }
                            })
                            const childThreadParents = Object.keys(childThreads)
                            posts.map((post) => {
                                const parent = childThreadParents.find(elem => elem === post.replyToId)
                                if (parent != undefined) childThreads[parent].push(post)
                            })
                            this.childThreadList = childThreadParents.map((parent) => {
                                let resultParent = JSON.parse(JSON.stringify(childThreads[parent]))
                                childThreads[parent].map((post) => {
                                    if (post.replyToId !== childThreads[parent][0].id) {
                                        const parentIndex = resultParent.find(elem => elem.id === post.replyToId)
                                        if (parentIndex != undefined) {
                                            resultParent = resultParent.filter((elem) => elem.id !== post.id)
                                            resultParent.splice(parentIndex + 1, 0, post)
                                        }
                                    }
                                })
                                return resultParent
                            })
                        })
        },
        setReply (post) {
            this.$emit("reply", post)
        },
        deletePost (post) {
            this.$emit("delete", post)
        },
        rePost (post) {
            this.$emit("rePost", post)
        },
        removeRePost (post) {
            this.$emit("removeRePost", post)
        },
        addLike (post) {
            this.$emit("addLike", post)
        },
        removeLike (post) {
            this.$emit("removeLike", post)
        },
        listLike (post) {
            this.$emit("listLike", post)
        },
        listRePost (post) {
            this.$emit("listRePost", post)
        },
    }
}
</script>