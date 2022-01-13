<template>
    <v-row justify="center">
        <v-col cols="1">
            <v-btn 
                :icon="buttonIcon"
                color="primary" 
                outlined 
                @click="updateLocation"
            >
                <v-icon v-if="buttonIcon">mdi-map-marker</v-icon>
                <span v-else>My location</span>
            </v-btn>

        </v-col>
        <polygonMeasure 
            :map="map" 
            :buttonIcon="buttonIcon" 
        />      

        <deleteLastGeojson 
            :geoJsonFeature="geoJsonFeature" 
            :showGeoJson="showGeoJson" 
            :layerGroupHouse="layerGroupHouse" 
            :layerGeoJson="layerGeoJson" 
            :buttonIcon="buttonIcon"
        />

        <manageStorage 
            :geoJsonFeature="geoJsonFeature" 
            :buttonIcon="buttonIcon"
        />

        <div id="map" v-show="expand">
        </div>


        <v-btn color="primary" @click="showInputGeoDetail = !showInputGeoDetail">saisir coordonnée</v-btn>

        <v-expand-transition>
            <dataGeoJson 
                v-if="showInputGeoDetail" 
                @send-data="getData" 
                :geoJsonFeature="geoJsonFeature"
                :coordinates="coordinates"
            /> 
        </v-expand-transition>

    </v-row>
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
        village: {
            "type": "Feature",
            "properties": {
                "name": "Coors Field",
                "amenity": "Baseball Stadium",
                "popupContent": "This is where the Rockies play!"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [103.8409637451172,13.281937687623081]
            }
        },
        geoJsonFeature: [],
        expand: true,
        layerGroupHouse: undefined,
        layerGeoJson: undefined,
    }),
    components: {
        dataGeoJson,
        manageStorage,
        legendMap,
        polygonMeasure,
        deleteLastGeojson
    },
    computed: {
        buttonIcon() {
            if(this.$vuetify.breakpoint.width < 600) {
                return true
            } else {
                return false
            }
        }
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

            function showPopupMarker(e) {
                var layer = e.target;
                layer.openPopup()
            }

            function hidePopupMarker(e) {
                var layer = e.target;
                layer.closePopup()
            }

            function onEachFeature(feature, layer) { 
                // pour faire apparaitre le popup du marker si popupContent est defini
                if (feature.properties && feature.properties.popupContent) {
                    layer.bindPopup(feature.properties.popupContent)
                }
                layer.on({
                    mouseover: showPopupMarker,
                    mouseout: hidePopupMarker,
                });        
            }
                    
            // FUNCTION RETURN ICON HOUSE SVG DEPENDING ON COLOR PARAMS
            function houseIcons(colors, size) {
                return L.divIcon({
                className: 'house-icon',
                html: `<svg style="width:${size}px;height:${size}px" viewBox="0 0 24 24">
                        <path fill="${colors}" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                        </svg>`
                })
            }

            this.layerGeoJson = L.geoJSON(this.geoJsonFeature, { // on peut enchainer les options ici
                onEachFeature: onEachFeature,
                pointToLayer: (feature, latlng) => { // CREATE THE MARKERS
                    let iconePick
                    switch (feature.properties.category) {
                        case 'not interview':
                            iconePick = houseIcons('black', '24')
                            break;
                        case 'indebted':
                            iconePick = houseIcons('orange', '24')
                            break;
                        case 'interview':
                            iconePick = houseIcons('green', '24')
                            break;
                        case 'land lost':
                            iconePick = houseIcons('red', '24')
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
            this.layerGroupHouse.addLayer(this.layerGeoJson)
            // ICI ON PEUT CHOISIR D'AJOUTER UN NOUVEAU TYPE DE LAYER
            // this.layerGroupHouse.addLayer(this.layerVillage)
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
        L.control.scale().addTo(this.map)

        this.layerGroupHouse = new L.LayerGroup()
        this.layerGroupHouse.addTo(this.map)

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

        // CUSTOMIZE AN ICON MENU ACTIONS ON THE MAP
        let createBtn = (callBack, svg) => {
          L.control.custom({
              position: 'topright',
              content : svg,
              classes : 'btn-group-vertical',
              style   :
              {
                  margin: '10px',
                  padding: '0px 0 0 0',
                  cursor: 'pointer',
              },
              events:
              {
                  click: (e) =>
                  {
                      console.log(e);
                      callBack()
                  },
              }
          })
          .addTo(this.map)
        }
        createBtn(this.updateLocation, '<svg id="btn1" style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="black" d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z" /></svg>')
        createBtn('ruler', '<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="red" d="M1.39,18.36L3.16,16.6L4.58,18L5.64,16.95L4.22,15.54L5.64,14.12L8.11,16.6L9.17,15.54L6.7,13.06L8.11,11.65L9.53,13.06L10.59,12L9.17,10.59L10.59,9.17L13.06,11.65L14.12,10.59L11.65,8.11L13.06,6.7L14.47,8.11L15.54,7.05L14.12,5.64L15.54,4.22L18,6.7L19.07,5.64L16.6,3.16L18.36,1.39L22.61,5.64L5.64,22.61L1.39,18.36Z" /></svg>')

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
    height: 100vw; 
    width: 100%;
    margin: 0px 2px 0px 2px;
    z-index: 1;
}

.btn-group-vertical{
  background-color: white;
  border: 1px solid black
}
</style>
