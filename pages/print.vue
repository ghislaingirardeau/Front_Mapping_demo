<template>
    <v-container>
        <h1>Print page</h1>
        <v-btn @click="print">print</v-btn>
        <mapFormated/>
        <v-row>
            <legendModal :themeDarkColor="themeDarkColor"/>
        </v-row>
    </v-container>
</template>

<script>
import mapFormated from '@/components/mapFormated.vue';
import legendModal from "~/components/leaflet/legendModal.vue";

    export default {
        data() {
            return {
                themeDarkColor: true
            }
        },
        components: {
            mapFormated,
            legendModal
        },
        methods: {
            print() {
                window.print()
            }
        },
        mounted() {
            this.$vuetify.theme.isDark = false
        }
    }
</script>

<style lang="scss" scoped>



</style>