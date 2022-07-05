<template>
    <div>
        <v-text-field
          v-model="titleDocPrint"
          :counter="20"
          color="secondary"
          label="Add a title here"
        ></v-text-field>
        <v-slider
            v-model="view"
            color="secondary"
            max="12"
            min="3"
            step="1"
            label="Zoom out : "
            hide-details
        ></v-slider>
        <v-btn class="mt-2" color="primary" @click="print">Print</v-btn>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                titleDocPrint: 'My map',
                view: 6
            }
        },
        methods: {
            print() {
                this.$emit('send-modal', {
                    message : false,
                    titleDocPrint: this.titleDocPrint,
                    view: this.view
                })
                
            }
        },
    }
</script>

<style lang="scss" scoped>

</style>