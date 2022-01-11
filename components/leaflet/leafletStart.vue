<template>
    <div>
        <h2>save coordinate on click</h2> {{geoJsonFeature}}

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
            @click="updateLocation"
        >
            Update my location
        </v-btn>

        <polygonMeasure :map="map" />      

        <deleteLastGeojson 
            :geoJsonFeature="geoJsonFeature" 
            :showGeoJson="showGeoJson" 
            :layerGroup="layerGroup" 
            :layerGeoJson="layerGeoJson" 
        />

        <manageStorage :geoJsonFeature="geoJsonFeature" />

        <h3>Les coordonnées cliquées : {{coordinates}}</h3>

        <v-expand-transition>
            <div id="map" v-show="expand">
            </div>
        </v-expand-transition>

        <legendMap />

    </div>
</template>

<script>
import dataGeoJson from '@/components/leaflet/dataGeoJson.vue' 
import manageStorage from '@/components/leaflet/manageStorage.vue'
import legendMap from '~/components/leaflet/legendMap.vue'
import polygonMeasure from '~/components/leaflet/polygonMeasure.vue'
import deleteLastGeojson from '~/components/leaflet/deleteLastGeojson.vue'

export default {
    data: () => ({
        map: Object,
        coordinates: [],
        myLocationMark: undefined,
        clickMapMark: undefined,
        showInputGeoDetail: false,
        expand: true,
        geoJsonFeature: [],
        layerGroup: undefined,
        layerGeoJson: undefined
    }),
    components: {
        dataGeoJson,
        manageStorage,
        legendMap,
        polygonMeasure,
        deleteLastGeojson
    },
    methods: {
        getData(payload) { 
            this.showInputGeoDetail = payload.show
            this.expand = !payload.show
            this.showGeoJson()
            if(payload.resetCoordinates) {
                this.coordinates = []
            }
            this.myLocationMark
            this.clickMapMark.remove(this.map) // retire le marker click
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

            this.layerGeoJson = L.geoJSON(this.geoJsonFeature, { // on peut enchainer les options ici
                onEachFeature: onEachFeature,
                pointToLayer: (feature, latlng) => { // CREATE THE MARKERS
                    let iconePick
                    switch (feature.properties.category) {
                        case 'credit':
                            iconePick = houseIcons('green')
                            break;
                        case 'indebted':
                            iconePick = houseIcons('red')
                            break;
                    }
                    return L.marker(latlng, {icon: iconePick});
                },
                style: (feature) => { // DEFINE SYTLE OF POLYGONS AND LINE
                    let colorPolygon
                    switch (feature.properties.category) {
                        case "rice":
                            colorPolygon = '#15e60e'
                            break;
                        case "cashew":
                            colorPolygon = '#fcba03'
                            break;
                    }
                    return {color: colorPolygon}
                }
            }).addTo(this.map)
            // contruction inside a layergroup to be able to remove the layer selected
            this.layerGroup = new L.LayerGroup();
            this.layerGroup.addTo(this.map);
            this.layerGroup.addLayer(this.layerGeoJson);
        },
        updateLocation () { 
            // update my location, recenter the map, show marker, push the coordinate for record
            this.map.locate({setView: true, maxZoom: 16})
            this.myLocationMark.remove(this.map)
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
        // ADD scale control
        const scale = L.control.scale().addTo(this.map)

        // show my location on load
        this.myLocationMark = L.marker()
        let onLocationFound= (e => {
            this.myLocationMark
                .setLatLng(e.latlng)
                .addTo(this.map)
        })
        this.map.on('locationfound', onLocationFound)       

        // remove the marker each click
        // add a new marker to new click
        // get the coordinates
        this.clickMapMark = L.marker()
        let addMarker = (async e => {
            await this.clickMapMark
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
        
        // ADD A PRINT CONTROL ON MAP
        L.control.browserPrint({
            printModes: ["Portrait"]
        }).addTo(this.map)
        
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


<style lang="scss">
#map { 
    height: 480px; 
    width: 800px;
}
</style>