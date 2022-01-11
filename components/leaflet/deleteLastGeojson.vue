<template>
    <v-col cols="1" offset="1">
        <v-btn 
            :icon="buttonIcon"
            color="primary" 
            outlined 
            @click="deleteItem"
        >
            <v-icon v-if="buttonIcon">mdi-backspace</v-icon>
            <span v-else>Delete last Item</span>        
        </v-btn>      
    </v-col>
</template>

<script>
export default {
    props: [
        'geoJsonFeature',
        'showGeoJson',
        'layerGroup',
        'layerGeoJson',
        'buttonIcon'
    ],
    methods: {
        async deleteItem() {
            await this.layerGroup.removeLayer(this.layerGeoJson);
            await this.geoJsonFeature.pop()
            await this.showGeoJson()
        }
    }
}
</script>