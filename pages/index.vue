<template>
    <v-row justify="center">    

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
                
                :geoJsonHouse="geoJsonHouse"
                :geoJsonVillage="geoJsonVillage"
                :coordinates="coordinates"
            /> 
        </v-expand-transition>

        <exportCSV />

    </v-row>
</template>

<script>
import dataGeoJson from '@/components/leaflet/dataGeoJson.vue' 
import exportCSV from '@/components/leaflet/exportCSV.vue' 

export default {
    async asyncData({$content}) { 
        // convert the coordinates
        function convertCoordinate(data) { 
            let indexLng = data.indexOf("'")
            let degres = data.slice(0, indexLng)
            let minute = (data.slice((indexLng + 1))) / 60
            return parseFloat(degres) + parseFloat(minute)
        }
        // function to create the layer for each category of json
        const createGeoJsons = (element, layer) => {
            let coordinates = []
            if(element.coordinates.indexOf('/') === -1) {
                let test = element.coordinates.split(' ') 
                test.forEach(element => {
                    coordinates.push(parseFloat(element))
                });
            } else {
                let test = element.coordinates.split('/')
                let array = []
                test.forEach(element => {
                    array.push(element.split(' '))
                })
                coordinates.push(array)
            }
            let newGeoJson = {
                "type": "Feature",
                "properties": {
                    "name": element.name,
                    "popupContent": element.popupContent,
                    "category": element.category,
                    "subCategory" : element.subcategory,
                },
                "geometry": {
                    "type": element.type,
                    "coordinates": coordinates
                }
            }
            layer.push(newGeoJson)

        }
        
        let geoJsonVillage = []
        let geoJsonHouse = []

        const doc = await $content('myNewData').fetch() // convert CSV files in content folder to json

        doc.body.forEach(element => {
            if(element.category === 'house') {
                createGeoJsons(element, geoJsonHouse)
            } else {
                createGeoJsons(element, geoJsonVillage)
            }            
        })

        return {geoJsonHouse, geoJsonVillage}
    },
    data: () => ({
        map: Object,
        coordinates: [],
        myLocationMark: undefined,
        clickMapMark: undefined,
        showInputGeoDetail: false,
        housesLayer: [],
        villageLayer: [],
        lastItem: undefined,
        expand: true,
        layerGeoJson: undefined,
        layerStorageControl: undefined,
        layerActionControl: undefined,
        btnMeasure: true,
        messageModal: '',
        watchMe: undefined,
        accuracyLocation: undefined
    }),
    components: {
        dataGeoJson,
        exportCSV
    },
    methods: {
        showModal () { // affiche un message lors du click
            var modal = document.getElementById("myModal")
            var span = document.getElementsByClassName("close")[0]
            modal.style.display = "block"
            span.onclick = function() {
            modal.style.display = "none"
            }
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none"
                }
            }
        },
        getData(payload) { 
            this.showInputGeoDetail = payload.show
            this.expand = !payload.show
            this.lastItem = payload.layerGroup

            switch (this.lastItem) {
                case 'house':
                    this.createGeoJsonLayer(this.geoJsonHouse, this.houseLayer)
                    break;
                case 'village':
                    this.createGeoJsonLayer(this.geoJsonVillage, this.villageLayer)
                    break;
            }
            
            if(payload.resetCoordinates) {
                this.coordinates = []
            }
            this.myLocationMark
            this.clickMapMark.remove(this.map) // retire le marker click
        },
        createGeoJsonLayer(layerType, groupType) { 
            // layerType = le geojson que je souhaite envoyer dans le layer
            // groupType = dans quel groupe de layer je charge celui-ci : village ou house

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
            function createIcon(category, subCategory, size) {
                let colors
                let path
                if(category === 'house') {
                    switch (subCategory) {
                        case 'not interview':
                            colors = 'black'
                            break;
                        case 'indebted':
                            colors = 'orange'
                            break;
                        case 'interview':
                            colors = 'green'
                            break;
                        case 'lost land':
                            colors = 'red'
                            break;
                    }
                }
                if(category === 'well') {
                    switch (subCategory) {
                        case 'private':
                            colors = 'blue'
                            break;
                        case 'public':
                            colors = 'red'
                            break;
                    }
                }
                switch (category) { // ICON DEPENDING ON THE CATEGORY
                case 'house':
                    path = `<path fill="${colors}" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />`
                    break;
                case 'bath':
                    path = '<path fill="black" d="M7 5C8.11 5 9 5.9 9 7S8.11 9 7 9 5 8.11 5 7 5.9 5 7 5M20 13V4.83C20 3.27 18.73 2 17.17 2C16.42 2 15.7 2.3 15.17 2.83L13.92 4.08C13.76 4.03 13.59 4 13.41 4C13 4 12.64 4.12 12.33 4.32L15.09 7.08C15.29 6.77 15.41 6.4 15.41 6C15.41 5.82 15.38 5.66 15.34 5.5L16.59 4.24C16.74 4.09 16.95 4 17.17 4C17.63 4 18 4.37 18 4.83V13H11.15C10.85 12.79 10.58 12.55 10.33 12.28L8.93 10.73C8.74 10.5 8.5 10.35 8.24 10.23C7.93 10.08 7.59 10 7.24 10C6 10 5 11 5 12.25V13H2V19C2 20.1 2.9 21 4 21C4 21.55 4.45 22 5 22H19C19.55 22 20 21.55 20 21C21.1 21 22 20.1 22 19V13H20M20 19H4V15H20V19Z" />'
                    break;
                case 'grave':
                    path = `<path fill="black" d="M10,2H14C17.31,2 19,4.69 19,8V18.66C16.88,17.63 15.07,17 12,17C8.93,17 7.12,17.63 5,18.66V8C5,4.69 6.69,2 10,2M8,8V9.5H16V8H8M9,12V13.5H15V12H9M3,22V21.31C5.66,19.62 13.23,15.84 21,21.25V22H3Z" />`
                    break;
                case 'chief House':
                    path = `<path fill="black" d="M10,2V4.26L12,5.59V4H22V19H17V21H24V2H10M7.5,5L0,10V21H15V10L7.5,5M14,6V6.93L15.61,8H16V6H14M18,6V8H20V6H18M7.5,7.5L13,11V19H10V13H5V19H2V11L7.5,7.5M18,10V12H20V10H18M18,14V16H20V14H18Z" />`
                    break;
                case 'homestay':
                    path = `<path fill="black" d="M12,3L2,12H5V20H19V12H22L12,3M12,7.7C14.1,7.7 15.8,9.4 15.8,11.5C15.8,14.5 12,18 12,18C12,18 8.2,14.5 8.2,11.5C8.2,9.4 9.9,7.7 12,7.7M12,10A1.5,1.5 0 0,0 10.5,11.5A1.5,1.5 0 0,0 12,13A1.5,1.5 0 0,0 13.5,11.5A1.5,1.5 0 0,0 12,10Z" />`
                    break;
                case 'communal':
                    path = `<path fill="black" d="M12 5C6.5 5 2 9.5 2 15V21H22V15C22 9.5 17.5 5 12 5M12 7C14.53 7 16.78 8.17 18.25 10H5.76C7.22 8.17 9.47 7 12 7M8 19H4V15C4 13.94 4.21 12.93 4.58 12H8V19M14 19H10V12H14V19M20 19H16V12H19.42C19.79 12.93 20 13.94 20 15V19Z" />`
                    break;
                case 'well':
                    path = `<path fill="${colors}" d="M3.62 8H5V15H7V8H11V10H13V8H17V15H19V8H20.61C21.16 8 21.61 7.56 21.61 7C21.61 6.89 21.6 6.78 21.56 6.68L19 2H5L2.72 6.55C2.47 7.04 2.67 7.64 3.16 7.89C3.31 7.96 3.46 8 3.62 8M6.24 4H17.76L18.76 6H5.24L6.24 4M2 16V18H4V22H20V18H22V16H2M18 20H6V18H18V20M13.93 11C14.21 11 14.43 11.22 14.43 11.5C14.43 11.5 14.43 11.54 14.43 11.56L14.05 14.56C14 14.81 13.81 15 13.56 15H10.44C10.19 15 10 14.81 9.95 14.56L9.57 11.56C9.54 11.29 9.73 11.04 10 11C10.03 11 10.05 11 10.07 11H13.93Z" />`
                    break;
                case 'worship':
                    path = `<path fill="black" d="M15.59,9C17.7,7.74 19,5.46 19,3H17A5,5 0 0,1 12,8A5,5 0 0,1 7,3H5C5,5.46 6.3,7.74 8.41,9C5.09,11 4,15.28 6,18.6C7.97,21.92 12.27,23 15.59,21C18.91,19.04 20,14.74 18,11.42C17.42,10.43 16.58,9.59 15.59,9M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20Z" />`
                    break;
                }
                return L.divIcon({
                className: `${category}-icon`,
                html: `<svg style="width:${size}px;height:${size}px" viewBox="0 0 24 24">${path}</svg>`
                })
            }

            function stylePolygon(element) {
                    let colorPolygon
                    switch (element) {
                        case "rice":
                            colorPolygon = '#15e60e'
                            break;
                        case "cashew":
                            colorPolygon = '#fcba03'
                            break;
                        case "route":
                            colorPolygon = 'red'
                            break;
                    }
                    return {color: colorPolygon}
            }

            this.layerGeoJson = L.geoJSON(layerType, { // on peut enchainer les options ici
                onEachFeature: onEachFeature,
                pointToLayer: (feature, latlng) => { // CREATE THE MARKERS
                    return L.marker(latlng, {
                        icon: createIcon(feature.properties.category, feature.properties.subCategory, '14')
                    });
                },
                style: (feature) => { // DEFINE SYTLE OF POLYGONS AND LINE
                    return stylePolygon(feature.properties.category)
                }
            })

            // GROUPE DE LAYER DANS LEQUEL J'ENREGISTRE LE JSON
            groupType.addLayer(this.layerGeoJson)
            
        },
        showMeasure() {
            // show measure on click
            // HIDE MEASURE ON SECOND CLICK + BUTTON DYNAMIC
            // DEBUG ON PRINT = NOT SHOWING MEASURE

            if(this.btnMeasure === true){
                this.map.eachLayer((layer) => {
                    if(layer instanceof L.Polygon || layer instanceof L.Path && layer.feature){
                        // layer feature not undefined ex: L.circleMarker is a layer = show an error. but layer L.circleMarker doesn't have a feature
                        layer.showMeasurements()
                    }
                })
            } else {
                this.map.eachLayer((layer) => {
                    if(layer instanceof L.Polygon || layer instanceof L.Path && layer.feature){
                        layer.hideMeasurements()
                    }
                })
            }
            this.btnMeasure = !this.btnMeasure            
        },
        async deleteItem() { 
            const removeLastData = async (group, layer, message) => {
                await group.removeLayer(this.layerGeoJson);
                await layer.pop()
                this.createGeoJsonLayer(layer, group)
                this.messageModal = message
                this.showModal()
                this.lastItem = undefined
            }
            switch (this.lastItem) {
                case 'house':
                    removeLastData(this.houseLayer, this.geoJsonHouse, "Last house data removed")
                    break;
                case 'village':
                    removeLastData(this.villageLayer, this.geoJsonVillage, "Last village data removed")
                    break;
                default:
                    this.messageModal = "Nothings to remove"
                    this.showModal()                    
                break;
            }
        },
        removeGeoJson() {
            localStorage.removeItem('APIGeoMap')
            this.messageModal = "data remove from local storage"
            this.showModal()
        },
        saveGeoJson() {
            let data = [this.geoJsonHouse, this.geoJsonVillage]
            localStorage.setItem('APIGeoMap', JSON.stringify(data))
            this.messageModal = "data save in local storage"
            this.showModal()
        },
        coordinatesOnLocation(element) {
            if(this.watchMe) {
                navigator.geolocation.clearWatch(this.watchMe)
                this.watchMe = undefined
                this.showInputGeoDetail = true
            } else {
                // track my location, update the coordinates
                let success = (position) => {
                    this.accuracyLocation = position.coords.accuracy
                    if(element) {
                        this.coordinates = [[position.coords.longitude, position.coords.latitude]]
                    } else {
                        this.coordinates.push([position.coords.longitude, position.coords.latitude])
                    }
                    let updatePositionMarker = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    this.myLocationMark
                        .setLatLng(updatePositionMarker)
                        .setRadius(position.coords.accuracy)
                }

                let error = () => {
                    this.messageModal = 'Unable to retrieve your location'
                    this.showModal()
                }

                if (navigator.geolocation) {
                    /* this.message = 'Locating...' */
                    this.watchMe = navigator.geolocation.watchPosition(success, error, {
                    enableHighAccuracy: true,
                    maximumAge: 0
                    })
                    
                } else {
                    this.messageModal = 'Geolocation is not supported by your browser'
                    this.showModal()
                }
            }
        },
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
        this.villageLayer = L.layerGroup()
        this.houseLayer = L.layerGroup()
        var overlayMaps = {
            "village" : this.villageLayer,
            "house" : this.houseLayer
        }

        this.createGeoJsonLayer(this.geoJsonVillage, this.villageLayer)
        this.createGeoJsonLayer(this.geoJsonHouse, this.houseLayer)

        // build the container with switch layer
        this.map = L.map('map', {layers: [streets, outdoors, this.houseLayer, this.villageLayer]}).fitWorld()
        this.map.locate({setView: true, maxZoom: 16})

        // control layer choice
        L.control.layers(baseMaps, overlayMaps).addTo(this.map)
        // ADD scale control
        L.control.scale().addTo(this.map)

        // show my location on load
        this.myLocationMark = L.circleMarker()
        let onLocationFound= (e => {
            var radius = e.accuracy
            this.myLocationMark
                .setLatLng(e.latlng)
                .setRadius(radius)
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
        let geoFromLocal = JSON.parse(localStorage.getItem('APIGeoMap'))

        if(geoFromLocal) { // if there is data from a file, loaded
            try {
                this.geoJsonHouse = geoFromLocal[0]
                this.geoJsonVillage = geoFromLocal[1]
                this.createGeoJsonLayer(this.geoJsonVillage, this.villageLayer)
                this.createGeoJsonLayer(this.geoJsonHouse, this.houseLayer)
            } catch (error) {
                console.log(error)
            }
        }
        
        // ADD A PRINT CONTROL ON MAP
        L.control.browserPrint({
            printModes: ["Portrait"]
        }).addTo(this.map)
        
        // CUSTOMIZE AN ICON MENU ACTIONS ON THE MAP: 2 option of adding custome icons

        let styleControl = {
            margin: '10px',
            padding: '0px',
            cursor: 'pointer',
        }

        this.layerStorageControl = L.control.custom({
            position: 'topleft',
            content : '<button type="button" class="btn-map">'+
                    '    <svg  id="btn-save" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="green" d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"  /></svg>' +
                    '</button>' +
                    '<button type="button" class="btn-map ">'+
                    '    <svg id="btn-erase" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="red" d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z"/></svg>' +
                    '</button>',
            classes : 'btn-group-icon-map-option1',
            style   : styleControl,
            events:
            {
                click: (data) =>
                {
                    if(data.target.querySelector('#btn-save')){
                        this.saveGeoJson()
                    } else if(data.target.querySelector('#btn-erase')){
                        this.removeGeoJson()
                    }
                },
            }
        })

        this.layerActionControl = L.control.custom({
            position: 'topright',
            content : '<button type="button" class="btn-map">'+
                        '<svg id="btn-add" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="blue" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>' +
                    '</button>' +
                    '<button type="button" class="btn-map">'+
                        '<svg id="btn-location" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="black" d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z" /></svg>' +
                    '</button>' +
                     '<button type="button" class="btn-map">'+
                        '<svg id="btn-ruler" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="black" d="M1.39,18.36L3.16,16.6L4.58,18L5.64,16.95L4.22,15.54L5.64,14.12L8.11,16.6L9.17,15.54L6.7,13.06L8.11,11.65L9.53,13.06L10.59,12L9.17,10.59L10.59,9.17L13.06,11.65L14.12,10.59L11.65,8.11L13.06,6.7L14.47,8.11L15.54,7.05L14.12,5.64L15.54,4.22L18,6.7L19.07,5.64L16.6,3.16L18.36,1.39L22.61,5.64L5.64,22.61L1.39,18.36Z" /></svg>' +
                    '</button>' +
                    '<button type="button" class="btn-map">'+
                        '<svg id="btn-delete" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="orange" d="M22,3H7C6.31,3 5.77,3.35 5.41,3.88L0,12L5.41,20.11C5.77,20.64 6.31,21 7,21H22A2,2 0 0,0 24,19V5A2,2 0 0,0 22,3M19,15.59L17.59,17L14,13.41L10.41,17L9,15.59L12.59,12L9,8.41L10.41,7L14,10.59L17.59,7L19,8.41L15.41,12" /></svg>' +
                    '</button>',
            classes : 'btn-group-icon-map-option1',
            style   : styleControl,
            events:
            {
                click: (data) =>
                {
                    // style css button
                    let styleOnClick = () => {
                        let element = data.target.classList.contains('click')
                        if(element) {
                            data.target.classList.remove("click")
                        } else {
                            data.target.classList.add("click")
                        }
                    }
                    // function on click
                    if(data.target.querySelector('#btn-add')){
                        styleOnClick()
                        this.coordinatesOnLocation(true)
                    } else if(data.target.querySelector('#btn-location')){
                        styleOnClick()
                        this.coordinatesOnLocation(false)
                    } else if(data.target.querySelector('#btn-ruler')){
                        styleOnClick()
                        this.showMeasure()
                    } else if(data.target.querySelector('#btn-delete')){
                        this.deleteItem()
                    }

                },
            }
        })

        this.map.addControl(this.layerStorageControl)
        this.map.addControl(this.layerActionControl)

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
    height: 500px; 
    width: 100%;
    margin: 0px 2px 0px 2px;
    z-index: 1;
}

// STYLE BTN GROUP OM MAP
.btn-group-icon-map-option1{
    position: relative;
    display: flex;
    flex-direction: column;
    /* &::after{
        content: "";
        position: absolute;
        top: 0px;
        left: 0px;
        height: 100%;
        width: 100%;
        background-color: pink;
    } */
}
.btn-map{
    border: 2px solid grey;
    border-radius: 5px 5px;
    background-color: white;
    position: relative;
    margin-bottom: 10px;
    padding: 4px 2px 0px 2px;
    &::after{
        content: "";
        position: absolute;
        top: 0px;
        left: 0px;
        height: 100%;
        width: 100%;
    }
}
.click{
    border: 2px solid red;
}

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
