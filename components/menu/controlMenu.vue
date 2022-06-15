<template>
    <v-icon
        size="30px"
        :disabled="disableAction"
        color="rgb(33, 150, 243)"
        @click="doThis(id, $event)"
        class="pa-2"
        :class="border"
        >{{icon}}</v-icon
      >
</template>

<script>
    export default {
        props: {
            icon: String,
            border: String,
            doThis: Function,
            disableAction: Boolean,
            id: Number
        },
        
    }
</script>

<style lang="scss" scoped>

</style>