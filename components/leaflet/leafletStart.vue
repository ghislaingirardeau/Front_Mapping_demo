<template>
    <div id="map">
    </div>
</template>

<script>
export default {
    data() {
        return {
        }
    },
    mounted() {
        const tokenMapbox='pk.eyJ1IjoiZ2d3ZWJkZXYiLCJhIjoiY2t4OGVhemd5MXpyMzJvbzE4ZXpxajJzZCJ9.P2KXn7NQDyQ11BkYVkPEcQ'
        // build the container
        var map = L.map('map').setView([13.7412488, 106.9778479], 13)
        // add a layer, here from mapbox
        L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${tokenMapbox}`, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/outdoors-v11', //street-v11, satellite-v9 pour avoir une vue satellite
            tileSize: 512,
            zoomOffset: -1,
            accessToken: tokenMapbox
        }).addTo(map)
        // MARKER
        var marker = L.marker([13.7412488, 106.9778479], {opacity: 0.5}).addTo(map)
        var circle = L.circle([13.7402488, 106.9798479], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 50
        }).addTo(map);
        // create a marker on click
        let putMarker = L.marker()
        function addMarker(e) {
            putMarker
                .setLatLng(e.latlng)
                .addTo(map)
                .bindPopup(e.latlng.toString())
        }
        map.on('click', addMarker)

        //POPUP
        marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup() // to open automaticly on load
        circle.bindPopup("I am a circle.")
        
        // create a popup on click
        var popup = L.popup( //create a popup
            { // pass options here
                minWidth: 450
            }
        )
        /* function onMapClick(e) {
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(map);
        }
        map.on('click', onMapClick) */


    }
}
</script>

<style>
#map { height: 480px; }
</style>