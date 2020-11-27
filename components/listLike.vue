<template>
    <v-card>
        <v-card-title class="justify-start">いいねした人を表示</v-card-title>
        <v-divider />
        <v-divider />
        <div v-for="(userId, index) in userIds.slice(0, 20)" :key="index">
            <v-list-item>
                <user-card-row
                :userId="userId"
                class="my-1"
                />
            </v-list-item>
        </div>
    </v-card>
</template>

<script>
import UserCardRow from '~/components/userCardRow.vue'

export default {
    name: "ListLike",
    components: {
        UserCardRow
    },
    props: {
        userIds: {
            type: Array,
            default: []
        }
    }
}
</script>