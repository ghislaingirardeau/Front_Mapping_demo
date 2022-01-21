<template>
    <div>
        <h1>My data collected</h1>
        <tableGeoJson 
            v-if="geoJsonFeature"
            :geoJsonFeature="geoJsonFeature"            
        /> 
        <p v-else>No data save yet</p>

    </div>
</template>

<script>
import tableGeoJson from '@/components/leaflet/tableGeoJson.vue'

export default {
    data(){
        return {
            geoJsonFeature: undefined
        }
    },
    components: {
        tableGeoJson,
    },
    mounted () {
        try {
            /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
            let geoFromLocal = JSON.parse(localStorage.getItem('APIGeoMap'))
            this.geoJsonFeature = [...geoFromLocal[0],...geoFromLocal[1]]
        } catch (error) {
            
        }

    },
}
</script>