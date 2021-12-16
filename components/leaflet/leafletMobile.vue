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
        var map = L.map('map').fitWorld()
        L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${tokenMapbox}`, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/outdoors-v11', //street-v11, satellite-v9 pour avoir une vue satellite
            tileSize: 512,
            zoomOffset: -1,
            accessToken: tokenMapbox
        }).addTo(map)
        map.locate({setView: true, maxZoom: 16}) //set my location automaticaly on load

        var greenIcon = L.icon({
            iconUrl: 'leaf-green.png',
            shadowUrl: 'leaf-shadow.png',

            iconSize:     [38, 95], // size of the icon
            shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        })
        function onLocationFound(e) { // function call back on event
            var radius = e.accuracy;
            console.log(e)

            L.marker(e.latlng, {icon: greenIcon}).addTo(map) // add a marker with my location
                .bindPopup("You are within " + radius + " meters from this point").openPopup();

            L.circle(e.latlng, radius).addTo(map);
        }

        map.on('locationfound', onLocationFound) // event locationfound    

        function onLocationError(e) { // if location failed
            alert(e.message);
        }

        map.on('locationerror', onLocationError)
        
    }
}
</script>

<style>
#map { height: 480px; }
</style>