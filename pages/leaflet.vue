<template>
    <div>
        <div>
            <h1>Leaflet quick start</h1>
            <p>get the coordinates on click, even offline</p>
            <leafletStart/>
        </div>
        <!-- <div>
            <h1>Leaflet tutorial</h1>
            <p>show my location and draw the accuracy</p>
            <p>add icon marker</p>
            <p>geoJSON</p>
            <p>create event on mouse hover</p>
            <leafletMobile/>
        </div> -->

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