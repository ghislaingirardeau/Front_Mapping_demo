<template>
    <div>
        <!-- <div>
            <h1>Leaflet quick start</h1>
            <leafletStart/>
        </div> -->
        <div>
            <h1>Leaflet mobile</h1>
            <leafletMobile/>
        </div>

    </div>
</template>

<script>
import leafletStart from '@/components/leaflet/leafletStart.vue'
import leafletMobile from '@/components/leaflet/leafletMobile.vue'

export default {
    data() {
        return {
        }
    },
    components: {
        leafletStart,
        leafletMobile
    }
}
</script>

<style>
#map { height: 480px; }
</style>