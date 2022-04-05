<template>
  <div class="container">
    <!-- MODAL SETTING -->
    <modalCustom :showModal="showModal" @send-modal="modalResponse">
      <template v-slot:title>
        {{ modalTitle ? modalTitle : messageModal }}
      </template>
      <template v-slot:content>
        <legendModal v-if="showLegend" />
        <dataGeoJson
          v-if="showInputGeoDetail"
          @send-data="getData"
          :coordinates="coordinates"
        />
        <manageDatas v-if="showSetting" />
        <printOptions v-if="showPrintOption" @send-modal="printResponse"/>
      </template>
    </modalCustom>

    <!-- MODAL TUTORIAL -->
    <div id="helpModal" class="modal_help">
      <div class="modal_action">
        <span class="modal_action-close">&times;</span>
        <button
          class="modal_action-btn"
          @click="tutoPage = !tutoPage"
          v-if="this.$vuetify.breakpoint.width < 600"
        >
          {{ tutoPage ? 'Previous' : 'Next' }}
        </button>
      </div>
      <div class="modal_tuto">
        <div
          class="modal_tuto-actions"
          v-if="this.$vuetify.breakpoint.width > 600 || !tutoPage"
        >
          <p v-for="item in tutorialsAction" :key="item">
            {{ item }}
          </p>
        </div>
        <div
          class="modal_tuto-data"
          v-if="this.$vuetify.breakpoint.width > 600 || tutoPage"
        >
          <p v-for="item in tutorialsData" :key="item">
            {{ item }}
          </p>
        </div>
      </div>
    </div>
    <!-- MODAL COORDINATES -->
    <div class="hub__accuracy" v-if="hubPosition">
      {{ hubCoordinate }}
    </div>
    <!-- MODAL HUB POINT LOCATION -->
    <div class="hub__target--btn" v-if="hubTargetDisplay">
      <v-btn color="black" class="mx-3" @click="saveTarget(false)">
        Cancel
      </v-btn>
      <v-btn color="black" class="mx-3" @click="saveTarget(true)"> OK </v-btn>
    </div>

    <i
      id="targetIconLocate"
      @click="locationTarget"
      aria-hidden="true"
      class="hub__target--icon mdi mdi-target"
    ></i>

    <!-- MAP -->
    <span class="print__block--title">{{titleDocPrint}}</span>
    <div id="map" class="mt-5"></div>

    <!-- DISPLAY FOR PRINTING -->
    <div class="print__block">
      <legendModal class="print__block--legend" v-if="showPrintMap"/>
    </div>
    <div id="mapPrint" v-show="showPrintMap"></div>
  </div>

</template>

<script>
import dataGeoJson from '@/components/leaflet/dataGeoJson.vue'
import legendModal from '~/components/leaflet/legendModal.vue'
import modalCustom from '@/components/leaflet/modalCustom.vue'
import printOptions from '@/components/leaflet/printOptions.vue'
import manageDatas from '@/components/manageDatas.vue'
import { createIndexedDB } from '@/static/functions/indexedDb'

export default {
  data: () => ({
    map: Object,
    coordinates: [],
    myLocationMark: undefined,
    showInputGeoDetail: false,
    btnMeasure: true,
    watchMe: undefined,
    accuracyLocation: undefined,
    hubPosition: undefined,
    layerGeoJson: undefined,
    // tutorial
    tutorialsAction: [
      'Select layers to show -->',
      'Find me and add a coordinate -->',
      'Track me and add an area -->',
      'Add or draw on map -->',
    ],
    tutorialsData: [
      '<-- Show tutorial',
      '<-- Settings and add markers',
      '<-- Show legend',
      '<-- Show area measure',
    ],
    tutoPage: false,
    // modal
    showModal: false,
    showLegend: false,
    showSetting: false,
    modalTitle: undefined,
    messageModal: undefined,
    // print
    showPrintOption: false,
    showPrintMap: false,
    titleDocPrint: undefined,
    printMap: undefined,
    // hub display
    markerTarget: undefined,
    hubTargetDisplay: false,
    // layers & layer group
    dynamicLayerGroup: {},
    propertiesNames: [],
    controlLayers: undefined,
  }),
  computed: {
    hubCoordinate() {
      let crd = this.coordinates[this.coordinates.length - 1]
      if (this.coordinates.length > 0) {
        return `Acc ${parseInt(this.accuracyLocation)}, lat ${crd[1]}, lng ${
          crd[0]
        }`
      } else {
        return 'Searching position...'
      }
    },
  },
  components: {
    dataGeoJson,
    legendModal,
    modalCustom,
    manageDatas,
    printOptions
  },
  methods: {
    helpModal() {
      // affiche un message lors du click
      var modal = document.getElementById('helpModal')
      var span = document.getElementsByClassName('modal_action-close')[0]
      modal.style.display = 'block'
      const resetModal = (display) => {
        display.style.display = 'none'
      }
      span.onclick = () => {
        resetModal(modal)
      }
      window.onclick = (event) => {
        if (event.target == modal) {
          resetModal(modal)
        }
      }
    },
    modalResponse(payload) {
      this.showModal = payload.message
      this.showLegend = payload.message
      this.showInputGeoDetail = payload.message
      this.showSetting = payload.message
      this.messageModal = undefined
      this.modalTitle = undefined
      this.showPrintOption = false
    },
    printResponse(payload) {
      this.modalTitle = undefined
      this.showModal = payload.message
      this.showPrintOption = payload.message
      this.titleDocPrint = payload.titleDocPrint
    },
    getData(payload) {
      this.showInputGeoDetail = payload.show
      this.showModal = payload.show
      this.modalTitle = undefined

      if (payload.createGeoJon) {
        // si je valide la creation
        let newGeoJson = payload.newGeoJson
        let groupLayer = newGeoJson.properties.category

        if (this.propertiesNames.indexOf(groupLayer) === -1) {
          // if category is not inside the layer control, i add it
          this.propertiesNames.push(groupLayer)
          this.dynamicLayerGroup[groupLayer] = L.layerGroup()
          this.createGeoJsonLayer(
            newGeoJson,
            this.dynamicLayerGroup[groupLayer]
          )
          // add the new layer inside the control overlay
          this.controlLayers.addOverlay(
            this.dynamicLayerGroup[groupLayer],
            groupLayer
          )
          // show automaticly the new layer group marker on map
          this.map.addLayer(this.dynamicLayerGroup[groupLayer]) 
        } else {
          // if category already exist, i just create the new geojson marker
          this.createGeoJsonLayer(
            newGeoJson,
            this.dynamicLayerGroup[groupLayer]
          )
        }
      } else {
        // sinon je l'ai annulé en cliquant sur cancel
      }

      if (payload.resetCoordinates) {
        this.coordinates = []
      }
    },
    createGeoJsonLayer(layerType, groupLayer) {
      // layerType = le geojson que je souhaite envoyer dans le layer
      // groupLayer = dans quel groupe de layer je charge celui-ci : village ou house

      function showPopupMarker(e) {
        var layer = e.target
        layer.openPopup()
      }

      function hidePopupMarker(e) {
        var layer = e.target
        layer.closePopup()
      }

      let testClick = (e) => {
        // TEST TO MODIFY DIRECTLY HERE !!!!!!!!!
        var layer = e.target
        let test = document.getElementById('helpModal')
        console.log(layer)
      }

      function onEachFeature(feature, layer) {
        // pour faire apparaitre le popup du marker si popupContent est defini
        if (feature.properties && feature.properties.popupContent) {
          layer.bindPopup(feature.properties.popupContent)
        }
        layer.on({
          mouseover: showPopupMarker,
          mouseout: hidePopupMarker,
          dblclick: testClick,
        })
      }

      // FUNCTION RETURN ICON HOUSE SVG DEPENDING ON COLOR PARAMS
      const createIcon = (type, color, size, name) => {
        let showHtml = `<i aria-hidden="true" class="v-icon notranslate mdi mdi-${type} theme--dark" style="font-size: ${size}; color:${color};"></i>`
        return L.divIcon({
          className: `${type}-icon`,
          html: showHtml,
        })
      }

      this.layerGeoJson = L.geoJSON(layerType, {
        // on peut enchainer les options ici
        onEachFeature: onEachFeature,
        pointToLayer: (feature, latlng) => {
          // CREATE THE MARKERS
          return L.marker(latlng, {
            icon: createIcon(
              feature.icon.type,
              feature.icon.color,
              'small',
              feature.properties.name
            ),
          })
        },
        style: (feature) => {
          // DEFINE SYTLE OF POLYGONS AND LINE
          return { color: feature.icon.color }
        },
      })

      // GROUPE DE LAYER DANS LEQUEL J'ENREGISTRE LE JSON
      groupLayer.addLayer(this.layerGeoJson)      

    },
    showMeasure() {
      // show measure on click
      // HIDE MEASURE ON SECOND CLICK + BUTTON DYNAMIC
      // DEBUG ON PRINT = NOT SHOWING MEASURE

      if (this.btnMeasure === true) {
        this.map.eachLayer((layer) => {
          if (
            layer instanceof L.Polygon ||
            (layer instanceof L.Path && layer.feature)
          ) {
            // layer feature not undefined ex: L.circleMarker is a layer = show an error. but layer L.circleMarker doesn't have a feature
            layer.showMeasurements()
          }
        })
      } else {
        this.map.eachLayer((layer) => {
          if (
            layer instanceof L.Polygon ||
            (layer instanceof L.Path && layer.feature)
          ) {
            layer.hideMeasurements()
          }
        })
      }
      this.btnMeasure = !this.btnMeasure
    },
    coordinatesOnLocation(element) {
      if (this.watchMe) {
        navigator.geolocation.clearWatch(this.watchMe)
        this.watchMe = undefined
        this.showInputGeoDetail = true
        this.showModal = true
        this.modalTitle = 'Add a symbol'
        this.hubPosition = false
      } else {
        // track my location, update the coordinates

        let success = (position) => {
          this.hubPosition = true
          this.accuracyLocation = position.coords.accuracy
          if (element && this.accuracyLocation < 10) {
            this.coordinates = [
              [position.coords.longitude, position.coords.latitude],
            ]
          } else if (this.accuracyLocation < 10) {
            this.coordinates.push([
              position.coords.longitude,
              position.coords.latitude,
            ])
          }

          let updatePositionMarker = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          this.myLocationMark
            .setLatLng(updatePositionMarker)
            .setRadius(position.coords.accuracy)

          this.map.flyTo(updatePositionMarker, 16)
          this.myLocationMark.addTo(this.map)
        }

        let error = () => {
          this.messageModal = 'Unable to retrieve your location'
          this.showModal = true
        }

        if (navigator.geolocation) {
          /* this.message = 'Locating...' */
          this.watchMe = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            maximumAge: 0,
          })
        } else {
          this.messageModal = 'Geolocation is not supported by your browser'
          this.showModal = true
        }
      }
    },
    locationTarget() {
      let style = {
        color: 'red',
        fillColor: 'red',
        radius: 3,
      }

      let target = L.circleMarker()
      let addMarker = (e) => {
        let center = this.map.getCenter()
        target.setLatLng(center).setStyle(style)
        this.coordinates.push([center.lng, center.lat])
        this.markerTarget.addLayer(target)
      }
      addMarker()
    },
    saveTarget(e) {
      let iconTarget = document.getElementById('targetIconLocate')
      iconTarget.style.display = 'none'
      if (e) {
        // if click on save marker true
        this.showInputGeoDetail = true
        this.showModal = true
        this.modalTitle = 'Add a symbol'
      } else {
        // if false, reset all
        this.coordinates = []
      }
      this.hubTargetDisplay = false
      this.markerTarget.clearLayers()
      this.activateOrNotBtn('btn-add')
      this.activateOrNotBtn('btn-trace')
      this.activateOrNotBtn('btn-target')
    },
    activateOrNotBtn(elt) {
      let button = document.getElementById(elt)
      let actionsBtn = document.getElementsByClassName('btn-map--action')
      let attribut = button.parentElement.getAttribute('disabled')

      if (attribut != null) {
        this.myLocationMark.removeFrom(this.map)
        button.parentElement.removeAttribute('disabled', '')
        button.style.color = 'white'
        for (let element of actionsBtn) {
          element.removeAttribute('disabled', '')
          element.firstChild.style.color = 'rgb(33, 150, 243)'
        }
      } else {
        button.parentElement.setAttribute('disabled', '')
        button.style.color = 'grey'
        for (let element of actionsBtn) {
          element.setAttribute('disabled', '')
          element.firstChild.style.color = 'grey'
        }
      }
    },
    saveTemporaly() {
      let jsonToSave = {}
      for (let property in this.dynamicLayerGroup) {
        jsonToSave[property] = [] // create a property as an array empty
        let arrayPerProperty = this.dynamicLayerGroup[property].getLayers()
        arrayPerProperty.forEach((element) => {
          let feature = element.getLayers()
          if (feature.length > 1) {
            // when it add a geojson to the grouplayer, it create an other array of what it's added
            feature.forEach((element) => {
              let item = element.feature
              jsonToSave[item.properties.category].push(item)
            })
          } else {
            // when it's mounted it create an array / layer => so we look only for the [0]
            let item = feature[0].feature
            jsonToSave[item.properties.category].push(item)
          }
        })
      }
      localStorage.setItem('APIGeoMap', JSON.stringify(jsonToSave))
    },
  },
  mounted() {
    // config mapbox
    const tokenMapbox =
      'pk.eyJ1IjoiZ2d3ZWJkZXYiLCJhIjoiY2t4OGVhemd5MXpyMzJvbzE4ZXpxajJzZCJ9.P2KXn7NQDyQ11BkYVkPEcQ'
    const mapBoxUrl = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${tokenMapbox}`
    const mapboxStreets = 'mapbox/streets-v11'
    const mapboxOutdoors = 'mapbox/outdoors-v11'
    const mapboxSatellite = 'mapbox/satellite-v9'
    const mapboxAttribution =
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'

    // pour switcher sur different layers
    var outdoors = L.tileLayer(mapBoxUrl, {
        id: mapboxOutdoors,
        tileSize: 512,
        zoomOffset: -1,
        attribution: mapboxAttribution,
        accessToken: tokenMapbox,
      }),
      streets = L.tileLayer(mapBoxUrl, {
        id: mapboxStreets,
        tileSize: 512,
        zoomOffset: -1,
        attribution: mapboxAttribution,
        accessToken: tokenMapbox,
      }),
      satellite = L.tileLayer(mapBoxUrl, {
        id: mapboxSatellite,
        tileSize: 512,
        zoomOffset: -1,
        attribution: mapboxAttribution,
        accessToken: tokenMapbox,
      }),
      print = L.tileLayer(mapBoxUrl, {
        id: mapboxOutdoors,
        tileSize: 512,
        zoomOffset: -1,
        attribution: mapboxAttribution,
        accessToken: tokenMapbox,
      })
    // bouton pour le switch
    var baseMaps = {
      Streets: streets,
      /* "Satellite": satellite, */
      Outdoors: outdoors,
    }

    /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
    let geoFromLocal = JSON.parse(localStorage.getItem('APIGeoMap'))
    let setMapView = {
      center: [0, 0],
      zoom: 3,
    }
    if (geoFromLocal) {
      // if there is data from a file, loaded
      try {
        this.propertiesNames = Object.keys(geoFromLocal) // recupere le nom de chaque propriete

        this.propertiesNames.forEach((element) => {
          this.dynamicLayerGroup[element] = L.layerGroup() // creer un nouveau groupe de layer pour chaque nom
          this.createGeoJsonLayer(
            geoFromLocal[element],
            this.dynamicLayerGroup[element]
          ) // charge le array de goejsons dans le layer
          // zoom the map on the last point added coordinates
          if (geoFromLocal[element][0].geometry.type === 'Point') {
            setMapView.center = []
            setMapView.center.push(
              geoFromLocal[element][0].geometry.coordinates[1]
            )
            setMapView.center.push(
              geoFromLocal[element][0].geometry.coordinates[0]
            )
            setMapView.zoom = 13
          }
        })
      } catch (error) {
        console.log(error)
      }
    } else { // if no data in local storage, no overlay and open the tutorials
      this.propertiesNames = []
      this.helpModal()
    }

    const layersToShow = () => {
      let array = [streets, outdoors, this.markerTarget] // layer by default + the layer for the target selection
      // add to the array the futur otherlays, depending on the object dynamicLayerGroup properties
      this.propertiesNames.forEach((element) => {
        array.push(this.dynamicLayerGroup[element])
      })
      return array
    }

    this.markerTarget = L.layerGroup()
    this.myLocationMark = L.circleMarker()

    // build the container with switch layer
    this.map = L.map('map', {
      layers: layersToShow(), // return the dynamical array of overlays
      center: setMapView.center,
      zoomSnap: 0.25, // to control the snap of the zoom
      zoomDelta: 0.25,
      zoom: setMapView.zoom,
      zoomControl: false,
      wheelPxPerZoomLevel: 300 // to control the snap of the zoom
    })


    // control layer choice
    this.controlLayers = L.control.layers(baseMaps, this.dynamicLayerGroup)
    this.controlLayers.addTo(this.map)
    // ADD scale control
    L.control.scale().addTo(this.map)


    // CUSTOMIZE AN ICON MENU ACTIONS ON THE MAP
    let styleControl = {
      margin: '15px',
      padding: '0px',
      cursor: 'pointer',
    }

    const styleOnClick = (e) => {
      let element = e.classList.contains('click')
      if (element) {
        e.classList.remove('click')
      } else {
        e.classList.add('click')
      }
    }

    let actionsControl = L.control.custom({
      position: 'topleft',
      content:
        '<button type="button" class="btn-map btn-map--action">' +
        '<i id="btn-tutorial" aria-hidden="true" class="v-icon notranslate mdi mdi-help-circle theme--dark" style="color:rgb(33, 150, 243);"></i>' +
        '</button>' +
        '<button type="button" class="btn-map btn-map--action">' +
        '<i id="btn-data" aria-hidden="true" class="v-icon notranslate mdi mdi-sitemap theme--dark" style="color:rgb(33, 150, 243);"></i>' +
        '</button>' +
        '<button type="button" class="btn-map btn-map--action">' +
        '<i id="btn-legend" aria-hidden="true" class="v-icon notranslate mdi mdi-map-legend theme--dark" style="color:rgb(33, 150, 243);"></i>' +
        '</button>' +
        '<button type="button" class="btn-map btn-map--action">' +
        '<i id="btn-ruler" aria-hidden="true" class="v-icon notranslate mdi mdi-ruler theme--dark" style="color:rgb(33, 150, 243);"></i>' +
        '</button>' +
        '<button type="button" class="btn-map btn-map--action">' +
        '<i id="btn-printer" aria-hidden="true" class="v-icon notranslate mdi mdi-printer theme--dark" style="color:rgb(33, 150, 243);"></i>' +
        '</button>',
      classes: 'btn-group-icon-map',
      style: styleControl,
      events: {
        click: async (data) => {
          if (data.target.querySelector('#btn-tutorial')) {
            this.helpModal()
          } else if (data.target.querySelector('#btn-data')) {
            this.saveTemporaly()
            this.showModal = true
            this.messageModal = 'Manage my datas'
            this.showSetting = true
          } else if (data.target.querySelector('#btn-ruler')) {
            styleOnClick(data.target)
            this.showMeasure()
          } else if (data.target.querySelector('#btn-legend')) {
            this.showLegend = !this.showLegend
            this.showModal = !this.showModal
            this.modalTitle = 'Map Legend'
          } else if (data.target.querySelector('#btn-printer')) {
            
            let openPrintOptions = () => {
              this.showPrintOption = !this.showPrintOption // modal for options ex: add a title
              this.showModal = !this.showModal // open common modal
              this.showPrintMap = !this.showPrintMap // build map print container
              this.modalTitle = 'Print option' 
            }
            await openPrintOptions() // display components first
            let actualMapCenter = [this.map.getCenter().lat, this.map.getCenter().lng] // get center of the map dynamicaly
            // mount the map after
            this.printMap = L.map('mapPrint').setView(actualMapCenter, 6);
            print.addTo(this.printMap);
            L.marker(actualMapCenter).addTo(this.printMap)
            // hide the container after the printing: cancel or save
            window.onafterprint = (event) => {
              this.showPrintMap = false
              this.printMap.remove() // debug error, remove the map built
            };
          }
        },
      },
    })

    let locationsControl = L.control.custom({
      position: 'topright',
      content:
        '<button type="button" class="btn-map btn-map--location">' +
        '<i id="btn-add" aria-hidden="true" class="v-icon notranslate mdi mdi-map-marker-radius theme--dark" style="color:white;"></i>' +
        '</button>' +
        '<button type="button" class="btn-map btn-map--location">' +
        '<i id="btn-trace" aria-hidden="true" class="v-icon notranslate mdi mdi-map-marker-path theme--dark" style="color:white;"></i>' +
        '</button>' +
        '<button type="button" class="btn-map btn-map--location">' +
        '<i id="btn-target" aria-hidden="true" class="v-icon notranslate mdi mdi-map-marker-plus theme--dark" style="color:white;"></i>' +
        '</button>',
      classes: 'btn-group-icon-map',
      style: styleControl,
      events: {
        click: (data) => {
          // function on click
          if (data.target.querySelector('#btn-add')) {
            styleOnClick(data.target)
            this.activateOrNotBtn('btn-trace')
            this.activateOrNotBtn('btn-target')
            this.coordinatesOnLocation(true) // display differente type of coordinates one array
          } else if (data.target.querySelector('#btn-trace')) {
            styleOnClick(data.target)
            this.coordinatesOnLocation(false) // display differente type of coordinates multiple array
            this.activateOrNotBtn('btn-add')
            this.activateOrNotBtn('btn-target')
          } else if (data.target.querySelector('#btn-target')) {
            this.activateOrNotBtn('btn-add')
            this.activateOrNotBtn('btn-trace')
            this.activateOrNotBtn('btn-target')
            // LOAD THE HUB FOR TARGET
            let x = this.map.getSize().x / 2 - 24.3
            let y = this.map.getSize().y / 2 - 30

            this.hubTargetDisplay = true

            let icon = document.getElementById('targetIconLocate')
            icon.style.display = 'block'

            icon.style.top = `${y}px`
            icon.style.left = `${x}px`
          }
        },
      },
    })

    this.map.addControl(actionsControl)
    this.map.addControl(locationsControl)

    // CREATE A THE DB FOR THE FIRST CONNECTION AND TO TEST THE APP
    const checkDB = async () => {
      const dbName = 'Map_Database'
      const isExisting = (await window.indexedDB.databases())
        .map((db) => db.name)
        .includes(dbName)
      if (isExisting) {
      } else {
        let response = await createIndexedDB()
        if(response) {
          const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
          requestIndexedDB.onsuccess = (event) => {
            var db = event.target.result

            var transaction = db.transaction('markers', 'readwrite')
            const store = transaction.objectStore('markers')
            let newIcon = {
              type: 'Point',
              category: 'home',
              subCategory: [],
              icon: 'home',
              color: ['red'],
            }
            store.add(newIcon)

            console.log('markers added to the store')
            transaction.oncomplete = () => {
              db.close()
            }
          }
          requestIndexedDB.onerror = (event) => {
            console.log(event);
          }
        }
      }
    }
    checkDB()

    // ecoute si online ou non automatiquement
    window.addEventListener('offline', function (e) {
      console.log('offline')
    })
    window.addEventListener('online', function (e) {
      console.log('online')
    })  
  },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap');

.container {
  height: 100%;
  width: 100vw;
  padding: 0px;
  position: relative;
}
#map {
  height: 100%;
  width: 100%;
  z-index: 1;
}
#mapPrint {
  height: 300px;
  width: 360px;
  z-index: 1;
  border: 2px solid grey;
}
.leaflet-touch .leaflet-control-layers-toggle {
  background-color: black;
  color: white;
}
.hub__target {
  &--icon {
    display: none;
    position: absolute;
    z-index: 3;
    color: black;
    font-size: 50px;
  }
  &--btn {
    display: flex;
    justify-content: space-between;
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 270px;
    height: 50px;
    background-color: transparent;
    z-index: 3;
  }
}
.hub__accuracy {
  display: block;
  position: absolute;
  bottom: 13%;
  left: 2%;
  padding: 5px;
  z-index: 2;
  background-color: black;
  color: white;
  font-size: 12px;
  border-radius: 5px 5px;
}
.icon--name {
  padding-left: 10px;
  font-weight: 800;
}
// STYLE BTN GROUP OM MAP
.btn-group-icon-map {
  position: relative;
  display: flex;
  flex-direction: column;
}
.btn-map {
  border: 2px solid black;
  border-radius: 10px 10px;
  background-color: black;
  position: relative;
  margin-bottom: 6px;
  padding: 8px;
  &--location {
    padding: 15px;
    border-radius: 30px 30px;
  }
  &::after {
    content: '';
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
  }
}
/* style button on map on click */
.click {
  border: 2px solid rgb(33, 150, 243);
}

// STYLE THE MODAL
/* The Modal (background) */
.modal_help {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 2; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.6); /* Black w/ opacity */
  font-family: 'Architects Daughter', cursive;
}

/* Modal Content/Box */

.modal_tuto {
  position: relative;
  &-actions {
    position: absolute;
    text-align: right;
    right: 80px;
    top: 20px;
    color: rgb(255, 255, 255);
    width: 70%; /* Could be more or less, depending on screen size */
    & > p {
      margin-bottom: 40px;
    }
  }
  &-data {
    position: absolute;
    text-align: left;
    left: 80px;
    top: 20px;
    color: rgb(255, 255, 255);
    width: 70%; /* Could be more or less, depending on screen size */
    & > p {
      margin-bottom: 25px;
    }
  }
}

/* The Close Button */
.modal_action {
  position: absolute;
  left: 5%;
  top: 250px;
  width: 90%;

  &-close {
    color: rgb(255, 255, 255);
    font-size: 62px;
    font-weight: bold;
    &:hover,
    &:focus {
      color: rgb(151, 151, 151);
      text-decoration: none;
      cursor: pointer;
    }
  }
  &-btn {
    position: absolute;
    right: 5%;
    top: 20px;
    font-size: 24px;
    padding: 8px 10px;
    border: 2px white solid;
    border-radius: 4px 4px;
  }
}
.print__block {
  display: none;
  &--title {
    display: none;
  }
}

@media screen and (min-width: 990px) {
  .modal_tuto {
    &-actions {
      right: 160px;
    }
    &-data {
      left: 160px;
    }
  }
  .modal_action {
    padding-left: 100px;
  }
}

@media screen and (min-width: 1400px) {
  .modal_tuto {
    &-actions {
      right: 280px;
    }
    &-data {
      left: 280px;
    }
  }
}

@media print {
  body {
    -webkit-print-color-adjust: exact !important;
  }
  #app {
    background-color: white !important;
  }
  .container {
    height: 100%;
    width: 100%;
  }
  #map {
    height: 400px;
    width: 580px;
    border: 2px solid grey;
    width: 740px;
  }
  #mapPrint {
    position: absolute;
    top: 2%;
    left: 51%;
  }
  .leaflet-control-container {
    display: none;
  }
  .print__block {
    display: block;
    &--legend {
      width: 48%;
      border: 2px solid grey;
      color: grey !important;
      background-color: white !important;
      position: absolute;
      left: 0px;
      top: 51%;
    }
    &--title {
      margin-top: 30px;
      display: block;
      color: grey;
      font-size: 30px;
    }
  }
}
</style>
