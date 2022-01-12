<template>
    <v-col cols="1" offset="1">
      <v-dialog
        transition="dialog-top-transition"
        max-width="600"
      >
        <template v-slot:activator="{ on, attrs }">
            <v-btn 
                :icon="buttonIcon"
                color="primary" 
                outlined 
                v-bind="attrs"
                v-on="on"
                @click="deleteItem"
            >
                <v-icon v-if="buttonIcon">mdi-backspace</v-icon>
                <span v-else>Delete last Item</span>        
            </v-btn>    
        </template>
        <template >
            <v-card>
                <v-card-text class="pt-4">
                    <span>The last item has been removed</span>
                </v-card-text>
            </v-card>
        </template>
      </v-dialog>
    </v-col>
</template>

<script>
export default {
    props: [
        'geoJsonFeature',
        'showGeoJson',
        'layerGroupHouse',
        'layerGeoJson',
        'buttonIcon'
    ],
    methods: {
        async deleteItem() {
            await this.layerGroupHouse.removeLayer(this.layerGeoJson);
            await this.geoJsonFeature.pop()
            await this.showGeoJson()
        }
    }
}
</script>