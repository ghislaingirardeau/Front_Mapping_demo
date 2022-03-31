<template>
    <div>
        <v-text-field
          v-model="titleDocPrint"
          :counter="20"
          label="Add a title here"
        ></v-text-field>
        <v-btn color="primary" @click="print">Print</v-btn>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                titleDocPrint: undefined
            }
        },
        methods: {
            async print() {
                await this.$emit('send-modal', {
                    message : false,
                    titleDocPrint: this.titleDocPrint
                })
                setTimeout(() => {
                    window.print()
                }, 500);
            }
        },
    }
</script>

<style lang="scss" scoped>

</style>