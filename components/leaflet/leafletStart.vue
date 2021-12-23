<template>
    <div>
        <h2>save coordinate on click</h2>
        <v-expand-transition>
            <dataGeoJson 
                v-if="showInputGeoDetail" 
                @send-data="getData" 
                :geojsonFeature="geojsonFeature" 
            />
        </v-expand-transition>

        <p v-if="message">{{message}}</p>

        <v-btn 
            class="my-5" 
            color="primary" 
            outlined 
            @click="showGeoJson"
            :disabled="disable"
        >
        Show geoJson
        </v-btn>
        <v-btn 
            class="my-5" 
            color="primary" 
            outlined 
            @click="saveGeoJson"
        >
            Save geoJson
        </v-btn>
        <v-expand-transition>
            <div id="map" v-show="expand">
            </div>
        </v-expand-transition>

        <tableGeoJson 
            :geojsonFeature="geojsonFeature"
        />

    </div>
</template>

<script>
import dataGeoJson from '@/components/leaflet/dataGeoJson.vue' 
import tableGeoJson from '@/components/leaflet/tableGeoJson.vue'

export default {
    data: () => ({
        natureIcon: {
            iconUrl: 'pagelines.svg',
            iconSize:     [15, 15], // size of the icon
            iconAnchor:   [8, 8], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
        },
        monumentIcon: {
            iconUrl: 'monument-solid.svg',
            iconSize:     [15, 15], // size of the icon
            iconAnchor:   [8, 8], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
        },
        map: '',
        message: undefined,
        showInputGeoDetail: false,
        disable: false,
        expand: true,
        geojsonFeature: [
            {
                "type": "Feature",
                "properties": {
                    "name": "Coors Field",
                    "amenity": "Baseball Stadium",
                    "popupContent": "This is where the Rockies play!",
                    "category": "monument"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [106.9907, 13.758064]
                }
            },

            {
                "type": "Feature",
                "properties": {
                    "name": "random",
                    "amenity": "random point",
                    "popupContent": "voici un point au hasard",
                    "category": "nature"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [106.9907, 13.768064]
                }
            },
        ]
    }),
    components: {
        dataGeoJson,
        tableGeoJson
    },
    methods: {
        getData(payload) { 
            this.showInputGeoDetail = payload.show
            this.message = payload.message
            this.disable = payload.disable
            this.expand = !payload.show
            this.showGeoJson()
        },
        showGeoJson() {

            function onEachFeature(feature, layer) { 
                // pour faire apparaitre le popup du marker si popupContent est defini
                if (feature.properties && feature.properties.popupContent) {
                    layer.bindPopup(feature.properties.popupContent);
                }
                /* layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                });  */       
            }
                    
            let geojsonMarkerOptions = { // style marker if not icon
                radius: 4,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            var typeNature = L.icon(this.natureIcon)
            var typeMonument = L.icon(this.monumentIcon)

            L.geoJSON(this.geojsonFeature, { // on peut enchainer les options ici
                onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng) {
                    let iconePick
                    switch (feature.properties.category) {
                        case 'monument':
                            iconePick = typeMonument
                            break;
                        case 'nature':
                            iconePick = typeNature
                            break;
                    }
                    return L.marker(latlng, {icon: iconePick});
                }
            }).addTo(this.map); 
            this.disable = true  
        },
        saveGeoJson() {
            localStorage.setItem('APIGeoMap', JSON.stringify(this.geojsonFeature))
        }
    },
    mounted() {
        const tokenMapbox='pk.eyJ1IjoiZ2d3ZWJkZXYiLCJhIjoiY2t4OGVhemd5MXpyMzJvbzE4ZXpxajJzZCJ9.P2KXn7NQDyQ11BkYVkPEcQ'
        const mapBoxUrl = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${tokenMapbox}`
        const mapboxStreets = 'mapbox/streets-v11'
        const mapboxOutdoors = 'mapbox/outdoors-v11'
        const mapboxAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
        // pour switcher sur different layers
        var outdoors = L.tileLayer(mapBoxUrl, {id: mapboxOutdoors, tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: tokenMapbox}),
            streets   = L.tileLayer(mapBoxUrl, {id: mapboxStreets, tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: tokenMapbox});        
        // bouton pour le switch
        var baseMaps = {
            "Outdoors": outdoors,
            "Streets": streets
        }

        // build the container with switch layer
        this.map = L.map('map', {layers: [streets, outdoors]}).setView([13.7412488, 106.9778479], 13)
        // build the container with one layer
        /* L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${tokenMapbox}`, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/outdoors-v11', //streets-v11, satellite-v9 pour avoir une vue satellite
            tileSize: 512,
            zoomOffset: -1,
            accessToken: tokenMapbox
        }).addTo(this.map) */

        // control layer choice
        L.control.layers(baseMaps).addTo(this.map)
        L.control.scale().addTo(this.map);

        // create a marker on click
        let putMarker = L.marker()
        let addMarker = (e => {
            putMarker
                .setLatLng(e.latlng)
                .addTo(this.map)
            this.geojsonFeature.push({
                "type": "Feature",
                "properties": {
                    "name": "",
                    "amenity": "",
                    "popupContent": "",
                    "category": ""
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [e.latlng.lng, e.latlng.lat]
                }
            })
            this.showInputGeoDetail = true
            this.expand = false
        })
        this.map.on('click', addMarker)

        // AJOUTER DIFFERENT MARKER A DES ENDROITS PRECIS
        /* var marker = L.marker([13.7412488, 106.9778479], {opacity: 0.5}).addTo(this.map)
        var circle = L.circle([13.7402488, 106.9798479], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 20
        }).addTo(this.map) */

        //ADD POPUP
        /* marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup() // to open automaticly on load
        circle.bindPopup("<h1>I am a circle.</h1>") */
        
        // STYLE POPUP ON CLICK
        var popup = L.popup( //create a popup
            { // pass options here
                minWidth: 450
            }
        )

        // ecoute si online ou non automatiquement 
        // fonctionnalité permettant d'enregistrer le geojson en mode offline
        // mettre un bouton precisant que l'on souhaite travailler en offline
        // enregistre le geojson dans le localstorage
        // ou retour de la connection, faire apparaitre le bouton pour sauvegarder le json dans le DB
        window.addEventListener('offline', function(e) { console.log('offline'); })
        window.addEventListener('online', function(e) { console.log('online'); });
    }
}
</script>

<style>
#map { 
    height: 380px; 
    width: 800px;
}
</style>