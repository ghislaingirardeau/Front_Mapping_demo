<template>
    <v-row justify="center">

              <!-- <v-btn color='primary' @click="followMe">follow me</v-btn>
      <v-btn color='primary' @click="stopFollowMe">Stop follow me</v-btn> -->
      <p v-if="accuracyLocation">accuracy {{accuracyLocation}} coordonneé {{coordinates}} </p>
      


        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <span class="close">&times;</span>
                <p>{{messageModal}}</p>
            </div>
        </div>

        <div id="map" v-show="expand">
        </div>

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

function showModal () {
    // Get the modal
    var modal = document.getElementById("myModal")
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0]
    // When the user clicks on the button, open the modal
    modal.style.display = "block"
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
    modal.style.display = "none"
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    }
}

export default {
    data: () => ({
        map: Object,
        coordinates: [],
        myLocationMark: undefined,
        clickMapMark: undefined,
        showInputGeoDetail: false,
        geoJsonFeature: [],
        expand: true,
        layerGroupHouse: undefined,
        layerGeoJson: undefined,
        btnMeasure: true,
        messageModal: '',
        watchMe: undefined,
        accuracyLocation: undefined
    }),
    components: {
        dataGeoJson,
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
            /* 
<svg style="width:24px;height:24px" viewBox="0 0 24 24">
    <path fill="currentColor" d="M10,2H14C17.31,2 19,4.69 19,8V18.66C16.88,17.63 15.07,17 12,17C8.93,17 7.12,17.63 5,18.66V8C5,4.69 6.69,2 10,2M8,8V9.5H16V8H8M9,12V13.5H15V12H9M3,22V21.31C5.66,19.62 13.23,15.84 21,21.25V22H3Z" />
</svg>
<svg style="width:24px;height:24px" viewBox="0 0 24 24">
    <path fill="currentColor" d="M7 5C8.11 5 9 5.9 9 7S8.11 9 7 9 5 8.11 5 7 5.9 5 7 5M20 13V4.83C20 3.27 18.73 2 17.17 2C16.42 2 15.7 2.3 15.17 2.83L13.92 4.08C13.76 4.03 13.59 4 13.41 4C13 4 12.64 4.12 12.33 4.32L15.09 7.08C15.29 6.77 15.41 6.4 15.41 6C15.41 5.82 15.38 5.66 15.34 5.5L16.59 4.24C16.74 4.09 16.95 4 17.17 4C17.63 4 18 4.37 18 4.83V13H11.15C10.85 12.79 10.58 12.55 10.33 12.28L8.93 10.73C8.74 10.5 8.5 10.35 8.24 10.23C7.93 10.08 7.59 10 7.24 10C6 10 5 11 5 12.25V13H2V19C2 20.1 2.9 21 4 21C4 21.55 4.45 22 5 22H19C19.55 22 20 21.55 20 21C21.1 21 22 20.1 22 19V13H20M20 19H4V15H20V19Z" />
</svg>
<svg style="width:24px;height:24px" viewBox="0 0 24 24">
    <path fill="currentColor" d="M10,2V4.26L12,5.59V4H22V19H17V21H24V2H10M7.5,5L0,10V21H15V10L7.5,5M14,6V6.93L15.61,8H16V6H14M18,6V8H20V6H18M7.5,7.5L13,11V19H10V13H5V19H2V11L7.5,7.5M18,10V12H20V10H18M18,14V16H20V14H18Z" />
</svg>
<svg style="width:24px;height:24px" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12,3L2,12H5V20H19V12H22L12,3M12,7.7C14.1,7.7 15.8,9.4 15.8,11.5C15.8,14.5 12,18 12,18C12,18 8.2,14.5 8.2,11.5C8.2,9.4 9.9,7.7 12,7.7M12,10A1.5,1.5 0 0,0 10.5,11.5A1.5,1.5 0 0,0 12,13A1.5,1.5 0 0,0 13.5,11.5A1.5,1.5 0 0,0 12,10Z" />
</svg>
<svg style="width:24px;height:24px" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 5C6.5 5 2 9.5 2 15V21H22V15C22 9.5 17.5 5 12 5M12 7C14.53 7 16.78 8.17 18.25 10H5.76C7.22 8.17 9.47 7 12 7M8 19H4V15C4 13.94 4.21 12.93 4.58 12H8V19M14 19H10V12H14V19M20 19H16V12H19.42C19.79 12.93 20 13.94 20 15V19Z" />
</svg>
<svg style="width:24px;height:24px" viewBox="0 0 24 24">
    <path fill="currentColor" d="M3.62 8H5V15H7V8H11V10H13V8H17V15H19V8H20.61C21.16 8 21.61 7.56 21.61 7C21.61 6.89 21.6 6.78 21.56 6.68L19 2H5L2.72 6.55C2.47 7.04 2.67 7.64 3.16 7.89C3.31 7.96 3.46 8 3.62 8M6.24 4H17.76L18.76 6H5.24L6.24 4M2 16V18H4V22H20V18H22V16H2M18 20H6V18H18V20M13.93 11C14.21 11 14.43 11.22 14.43 11.5C14.43 11.5 14.43 11.54 14.43 11.56L14.05 14.56C14 14.81 13.81 15 13.56 15H10.44C10.19 15 10 14.81 9.95 14.56L9.57 11.56C9.54 11.29 9.73 11.04 10 11C10.03 11 10.05 11 10.07 11H13.93Z" />
</svg>

*/
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
        /* updateLocation () { 
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
        }, */
        showMeasure() {
            // show measure on click
            // HIDE MEASURE ON SECOND CLICK + BUTTON DYNAMIC
            // DEBUG ON PRINT = NOT SHOWING MEASURE
            if(this.btnMeasure === true){
                this.map.eachLayer(function(layer){
                    if(layer instanceof L.Polygon && !(layer instanceof L.Rectangle) ){
                        layer.showMeasurements()
                    }
                })
            } else {
                this.map.eachLayer(function(layer){
                    if(layer instanceof L.Polygon && !(layer instanceof L.Rectangle) ){
                        layer.hideMeasurements()
                    }
                })
            }
            this.btnMeasure = !this.btnMeasure            
        },
        async deleteItem() {
            await this.layerGroupHouse.removeLayer(this.layerGeoJson);
            await this.geoJsonFeature.pop()
            await this.showGeoJson()
            this.messageModal = "Last data removed"
            showModal()
        },
        removeGeoJson() {
            localStorage.removeItem('APIGeoMap')
            this.messageModal = "data remove from local storage"
            showModal()
        },
        saveGeoJson() {
            localStorage.setItem('APIGeoMap', JSON.stringify(this.geoJsonFeature))
            this.messageModal = "data save in local storage"
            showModal()
        },
        addCoordinates() {
            this.showInputGeoDetail = !this.showInputGeoDetail
        },
        followMe() {
            // track my location, update the coordinates
            let success = (position) => {
                this.accuracyLocation = position.coords.accuracy
                this.coordinates = [[position.coords.longitude, position.coords.latitude]]
                let updatePositionMarker = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }
                this.myLocationMark
                    .setLatLng(updatePositionMarker)
            }

            let error = () => {
                /* this.message = 'Unable to retrieve your location'; */
            }

            if (navigator.geolocation) {
                /* this.message = 'Locating...' */
                this.watchMe = navigator.geolocation.watchPosition(success, error, {
                enableHighAccuracy: true,
                maximumAge: 0
                })
                
            } else {
                /* this.message = 'Geolocation is not supported by your browser' */
            }
        },
        stopFollowMe() {
            navigator.geolocation.clearWatch(this.watchMe)
            this.coordinates = []
        }
    },
    mounted() {
        // config mapbox
        const tokenMapbox='pk.eyJ1IjoiZ2d3ZWJkZXYiLCJhIjoiY2t4OGVhemd5MXpyMzJvbzE4ZXpxajJzZCJ9.P2KXn7NQDyQ11BkYVkPEcQ'
        const mapBoxUrl = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${tokenMapbox}`
        const mapboxStreets = 'mapbox/streets-v11'
        const mapboxOutdoors = 'mapbox/outdoors-v11'
        const mapboxSatellite = 'mapbox/satellite-v9'
        const mapboxAttribution = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
        
        // pour switcher sur different layers
        var outdoors = L.tileLayer(mapBoxUrl, {id: mapboxOutdoors, tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: tokenMapbox}),
            streets   = L.tileLayer(mapBoxUrl, {id: mapboxStreets, tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: tokenMapbox}),        
            satellite   = L.tileLayer(mapBoxUrl, {id: mapboxSatellite, tileSize: 512, zoomOffset: -1, attribution: mapboxAttribution, accessToken: tokenMapbox})        
        // bouton pour le switch
        var baseMaps = {
            "Streets": streets,
            /* "Satellite": satellite, */
            "Outdoors": outdoors,
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

        // CUSTOMIZE AN ICON MENU ACTIONS ON THE MAP: 2 option of adding custome icons
        /* OPTION 1 */
        // function qui créer le bouton
        let createBtn = (position, callBack, svg) => {
          L.control.custom({
              position: position,
              content : svg,
              classes : 'btn-group-icon-map-option1',
              style   :
              {
                  margin: '10px',
                  padding: '4px 2px 0px 2px',
                  cursor: 'pointer',
              },
              events:
              {
                    click: (e) =>
                        {
                            callBack()
                        },
              }
          })
          .addTo(this.map)
        }
        // les icones d'actions
        const itemsAction = [
            {
                position: 'topright',
                callback: this.addCoordinates,
                svg: '<svg style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="blue" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>'
            },
            {
                position: 'topright',
                callback: this.followMe,
                svg: '<svg style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="black" d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z" /></svg>'
            },
            {
                position: 'topright',
                callback: this.showMeasure,
                svg: '<svg style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="black" d="M1.39,18.36L3.16,16.6L4.58,18L5.64,16.95L4.22,15.54L5.64,14.12L8.11,16.6L9.17,15.54L6.7,13.06L8.11,11.65L9.53,13.06L10.59,12L9.17,10.59L10.59,9.17L13.06,11.65L14.12,10.59L11.65,8.11L13.06,6.7L14.47,8.11L15.54,7.05L14.12,5.64L15.54,4.22L18,6.7L19.07,5.64L16.6,3.16L18.36,1.39L22.61,5.64L5.64,22.61L1.39,18.36Z" /></svg>'
            },
            {
                position: 'topright',
                callback: this.deleteItem,
                svg: '<svg style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="orange" d="M22,3H7C6.31,3 5.77,3.35 5.41,3.88L0,12L5.41,20.11C5.77,20.64 6.31,21 7,21H22A2,2 0 0,0 24,19V5A2,2 0 0,0 22,3M19,15.59L17.59,17L14,13.41L10.41,17L9,15.59L12.59,12L9,8.41L10.41,7L14,10.59L17.59,7L19,8.41L15.41,12" /></svg>'
            },
            {
                position: 'topleft',
                callback: this.saveGeoJson,
                svg: '<svg style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="green" d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" /></svg>'
            },
            {
                position: 'topleft',
                callback: this.removeGeoJson,
                svg: '<svg style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="red" d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z" /></svg>'
            }
        ]
        // applique la fonction pour chaque icone
        for (let item of itemsAction) {
            createBtn(item.position, item.callback, item.svg)
        }

        /* ----------------- */
        /* option 2 */
        /* L.control.custom({
            position: 'bottomright',
            content : '<button type="button" id="btn-save" class="btn-map save">'+
                    '    <svg id="btn-save" style="width:34px;height:34px" viewBox="0 0 24 24"><path id="btn-save" fill="white" d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"  /></svg>' +
                    '</button>' +
                    '<button type="button" id="btn-erase" class="btn-map erase">'+
                    '    <svg id="btn-erase" style="width:34px;height:34px" viewBox="0 0 24 24"><path id="btn-erase" fill="white" d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z"/></svg>' +
                    '</button>',
            classes : 'btn-group-icon-map-option2',
            style   :
            {
                margin: '10px',
                padding: '0px',
                cursor: 'pointer',
            },
            events:
            {
                click: (data) =>
                {
                    switch (data.target.id) {
                        case 'btn-save':
                            this.saveGeoJson()
                            break;
                        case 'btn-erase':
                            this.removeGeoJson()
                            break;
                    }
                },
            }
        })
        .addTo(this.map); */
        /* ------------------------- */

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

// STYLE BTN GROUP OM MAP
.btn-group-icon-map-option1{
    background-color: white;
    border: 2px solid grey;
    border-radius: 5px 5px;
}
// OPTION 2 ICON ACTION MAP
/* .btn-map{
    border: 2px solid grey;
    border-radius: 5px 5px;
    padding: 4px 2px 0px 2px;
    margin: 0px 8px 0px 8px;
}
.save{
    background-color: green;
}
.erase{
    background-color: red;
} */

// STYLE THE MODAL
/* The Modal (background) */
.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 2; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  color: black;
  width: 80%; /* Could be more or less, depending on screen size */
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
