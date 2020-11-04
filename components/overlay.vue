<template>
    <v-overlay :value="overlay">
        <v-row justify="center" align-content="center">
            <v-progress-circular
            indeterminate
            color="red"
            >
            </v-progress-circular>
        </v-row>
    </v-overlay>
</template>

<script>
export default {
    name: "CustomOverlay",
    props: {
        overlay: {
            type: Boolean,
            default: false
        }
    }
}
</script>