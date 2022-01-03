<template>
    <div>
        <v-btn 
            class="my-5" 
            color="primary" 
            outlined 
            @click="saveGeoJson"
        >
            Save geoJson
        </v-btn>

        <v-btn
        color="error"
        outlined 
        class="mr-4"
        @click="removeGeoJson"
        >
        Clean localStorage
        </v-btn>
        <p>{{message}}</p>
    </div>
</template>

<script>
export default {
    data() {
        return{
            message: ''
        }
    },
    props: {
        geoJsonFeature: Array
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