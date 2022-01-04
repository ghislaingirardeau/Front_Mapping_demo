<template>
    <div>
        <h2>save coordinate on click</h2> 

        <v-expand-transition>
            <dataGeoJson 
                v-if="showInputGeoDetail" 
                @send-data="getData" 
                :geoJsonFeature="geoJsonFeature"
                :coordinates="coordinates"
            />
        </v-expand-transition>

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
            @click="updateLocation"
        >
            Update my location
        </v-btn>
        
        <manageStorage :geoJsonFeature="geoJsonFeature" />
        <h3>Les coordonnées cliquées : {{coordinates}}</h3>

        <v-expand-transition>
            <div id="map" v-show="expand">
            </div>
        </v-expand-transition>

        <tableGeoJson 
            :geoJsonFeature="geoJsonFeature"
        />

        <!-- <v-btn 
            class="my-5" 
            color="primary" 
            outlined 
            @click="showExport"
        >
        print
        </v-btn> -->

    </div>
</template>

<script>
import dataGeoJson from '@/components/leaflet/dataGeoJson.vue' 
import tableGeoJson from '@/components/leaflet/tableGeoJson.vue'
import manageStorage from '@/components/leaflet/manageStorage.vue'

export default {
    data: () => ({
        map: '',
        coordinates: [],
        myLocationMark: undefined,
        clickMapMark: undefined,
        showInputGeoDetail: false,
        disable: false,
        expand: true,
        geoJsonFeature: [
            {
                "type": "Feature",
                "properties": {
                    "name": "Coors Field",
                    "amenity": "Baseball Stadium",
                    "popupContent": "This is where the Rockies play!",
                    "category": "credit"
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
                    "category": "indebted"
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
        tableGeoJson,
        manageStorage
    },
    methods: {
        getData(payload) { 
            this.showInputGeoDetail = payload.show
            this.disable = payload.disable
            this.expand = !payload.show
            this.showGeoJson()
            if(payload.resetCoordinates) {
                this.coordinates = []
            }
            this.myLocationMark
            this.clickMapMark.remove(this.map) // retire le marker click
            this.myLocationMark.remove(this.map) // retire le marker de ma location        
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
            // FUNCTION RETURN ICON HOUSE SVG DEPENDING ON COLOR PARAMS
            function houseIcons(colors) {
                return L.divIcon({
                className: 'house-icon',
                html: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path fill="${colors}" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                        </svg>`
                })
            }

            L.geoJSON(this.geoJsonFeature, { // on peut enchainer les options ici
                onEachFeature: onEachFeature,
                pointToLayer: function (feature, latlng) {
                    let iconePick
                    switch (feature.properties.category) {
                        case 'credit':
                            iconePick = houseIcons('green')
                            break;
                        case 'indebted':
                            iconePick = houseIcons('red')
                            break;
                        case 'polygon':
                            iconePick = undefined
                            break;
                    }
                    if(iconePick != undefined) {
                        return L.marker(latlng, {icon: iconePick});
                    } else {
                        return  L.polygon(latlngs, {color: 'red'})
                    }
                }
            }).addTo(this.map); 
            this.disable = true  
        },
        updateLocation () { // update my location, recenter the map, show marker, push the coordinate for record
            this.map.locate({setView: true, maxZoom: 16})

            this.myLocationMark = L.marker()

            let onLocationFound= (e => {
                this.myLocationMark
                    .setLatLng(e.latlng)
                    .addTo(this.map)
                this.coordinates.push([e.latlng.lng, e.latlng.lat])
                this.showInputGeoDetail = true
            })
            this.map.on('locationfound', onLocationFound)         
        },
        showExport() {
            /* L.control.bigImage({
                position: 'topleft',
                maxScale: 3
            }).addTo(this.map); */
        },
    },
    mounted() {
        // config mapbox
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
        this.map = L.map('map', {layers: [streets, outdoors]}).fitWorld()
        this.map.locate({setView: true, maxZoom: 16})

        // control layer choice
        L.control.layers(baseMaps).addTo(this.map)
        L.control.scale().addTo(this.map)

        // show my location on load
        this.myLocationMark = L.marker()
        let onLocationFound= (e => {
            this.myLocationMark
                .setLatLng(e.latlng)
                .addTo(this.map)
        })
        this.map.on('locationfound', onLocationFound)       

        // remove the marker eah click
        // add a new marker to new click
        // get the coordinates
        this.clickMapMark = L.marker()
        let addMarker = (async e => {
/*             await this.clickMapMark.remove(this.map)
 */            await this.clickMapMark
                .setLatLng(e.latlng)
                .addTo(this.map)
            this.coordinates.push([e.latlng.lng, e.latlng.lat])
            this.showInputGeoDetail = true
        })
        this.map.on('click', addMarker)

        /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
        let geoFromLocal = localStorage.getItem('APIGeoMap')

        if(geoFromLocal) {
            this.geoJsonFeature = JSON.parse(geoFromLocal)
            this.showGeoJson()
        }

        L.control.bigImage({
            position: 'topleft',
            maxScale: 3
        }).addTo(this.map);

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