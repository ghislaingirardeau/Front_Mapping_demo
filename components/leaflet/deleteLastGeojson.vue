<template>
    <div>
        <v-btn 
            class="my-5" 
            color="primary" 
            outlined 
            @click="deleteItem"
        >
            Delete last data
        </v-btn>      
    </div>
</template>

<script>
export default {
    props: [
        'geoJsonFeature',
        'showGeoJson',
        'layerGroup',
        'layerGeoJson'
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