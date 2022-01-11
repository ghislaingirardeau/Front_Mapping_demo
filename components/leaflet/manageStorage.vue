<template>
    <v-col cols="4" offset="3">
        <v-btn 
            :icon="buttonIcon"
            class="mr-2" 
            color="primary" 
            outlined 
            @click="saveGeoJson"
        >
            <v-icon v-if="buttonIcon">mdi-content-save</v-icon>
            <span v-else>Save</span>        
        </v-btn>

        <v-btn
            :icon="buttonIcon"
            color="error"
            outlined 
            @click="removeGeoJson"
        >
            <v-icon v-if="buttonIcon">mdi-eraser</v-icon>
            <span v-else>Erase storage</span>        
        </v-btn>
        <p>{{message}}</p>
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