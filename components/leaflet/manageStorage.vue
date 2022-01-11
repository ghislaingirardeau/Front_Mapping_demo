<template>
    <v-col cols="4" offset="3">

      <v-dialog
        transition="dialog-top-transition"
        max-width="600"
      >
        <template v-slot:activator="{ on, attrs }">
            <v-btn 
                :icon="buttonIcon"
                class="mr-2" 
                color="primary" 
                outlined 
                v-bind="attrs"
                v-on="on"
                @click="saveGeoJson"
            >
                <v-icon v-if="buttonIcon">mdi-content-save</v-icon>
                <span v-else>Save</span>        
            </v-btn>
        </template>
        <template >
            <v-card>
                <v-card-text class="pt-4">
                    <span>{{message}}</span>
                </v-card-text>
            </v-card>
        </template>
      </v-dialog>

      <v-dialog
        transition="dialog-top-transition"
        max-width="600"
      >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                :icon="buttonIcon"
                color="error"
                outlined 
                v-bind="attrs"
                v-on="on"
                @click="removeGeoJson"
            >
                <v-icon v-if="buttonIcon">mdi-eraser</v-icon>
                <span v-else>Erase storage</span>        
            </v-btn>
        </template>
        <template >
            <v-card>
                <v-card-text class="pt-4">
                    <span>{{message}}</span>
                </v-card-text>
            </v-card>
        </template>
      </v-dialog>

    </v-col>
</template>

<script>
export default {
    data() {
        return{
            message: ''
        }
    },
    props: {
        geoJsonFeature: Array,
        buttonIcon: Boolean
    },
    methods: {
        removeGeoJson() {
            localStorage.removeItem('APIGeoMap')
            this.message = "data remove from local storage"
        },
        saveGeoJson() {
            localStorage.setItem('APIGeoMap', JSON.stringify(this.geoJsonFeature))
            this.message = "data save in local storage"
        },
    },
}
</script>