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
            id: 'mapbox/light-v9', //light-v9 outdoors-v11 street-v11, satellite-v9 pour avoir une vue satellite
            tileSize: 512,
            zoomOffset: -1,
            accessToken: tokenMapbox
        }).addTo(map)
        map.locate({setView: true, maxZoom: 6}) //set my location automaticaly on load
        var  myIcon = L.divIcon({className: 'myicon'})
        var greenIcon = L.icon({
            iconUrl: 'pagelines.svg',
            iconSize:     [15, 15], // size of the icon
            iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
        })
        function onLocationFound(e) { // function call back on event
            var radius = e.accuracy;

            L.marker(e.latlng, {icon: greenIcon}).addTo(map) // add a marker with my location
                .bindPopup("You are within " + radius + " meters from this point").openPopup();

            L.circle(e.latlng, radius).addTo(map);
        }

        map.on('locationfound', onLocationFound) // event locationfound    

        function onLocationError(e) { // if location failed
            alert(e.message);
        }

        map.on('locationerror', onLocationError)

        // GEOJSON

        function highlightFeature(e) {
            var layertest = e.target;

            layertest.setStyle({
                weight: 5,
                fillColor: "#3456",
                color: '#666',
                fillOpacity: 0.7
            });
        }
        function resetHighlight(e) {
            e.target.setStyle({
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }

        function onEachFeature(feature, layer) { 
            // pour faire apparaitre le popup du marker si popupContent est defini
            if (feature.properties && feature.properties.popupContent) {
                layer.bindPopup(feature.properties.popupContent);
            }
            layer.on({
                mouseover: highlightFeature, // animation sur un mousehover
                mouseout: resetHighlight, // animation sur un mousehover
            });        
        }        
        var geoJsonFeature = [{ // peut passer plusieurs data grace a array
            "type": "Feature",
            "properties": {
                "name": "Coors Field",
                "amenity": "Baseball Stadium",
                "popupContent": "This is where the Rockies play!"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
            }
        },
        ]; 
        var geojsonMarkerOptions = { // style marker if not icon
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        L.geoJSON(geoJsonFeature, { // on peut enchainer les options ici
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
                return L.polygon(latlng)
            }
        }).addTo(map);        

        // pour creer des formes comme des lignes ici 
        var myLines = [{
            "type": "LineString",
            "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
        }, {
            "type": "LineString",
            "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
        }]; 
        var myStyle = { // ajoute un style aux formes
            "color": "#ff7800",
            "weight": 5,
            "opacity": 0.65
        };     
        /* L.geoJSON(myLines, {
            style: myStyle
        }).addTo(map); */
        //------------------   

        // Personaliser le marker 
        /* var geojsonMarkerOptions = {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        L.geoJSON(geoJsonFeature, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        }).addTo(map);    */        
    }
}
</script>

<style>
#map { height: 480px; }

.myicon{
    background-color: red;
    border: 2px solid grey;
    padding: 2px;
}
</style>