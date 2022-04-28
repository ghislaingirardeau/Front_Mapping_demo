<template>
  <div class="container">
    <createMarker
      :markers="markers"
      :showModal="showModalMarker"
      @send-marker="modalMarkerResponse"
    />
    <!-- MODAL SETTING -->
    <modalCustom :showModal="modalDatas.showModal" @send-modal="modalResponse">
      <template v-slot:title>
        {{ modalDatas.modalTitle }}
      </template>
      <template v-slot:content>
        <legendModal v-show="modalDatas.showLegend" :markers="markers" />
        <dataGeoJson
          v-show="showInputGeoDetail"
          @send-data="getData"
          :coordinates="coordinates"
        />
        <optionsMenu v-show="modalDatas.showSetting" :map="map" />
        <printOptions v-show="showPrintOption" @send-modal="printResponse" />
        <p v-show="modalDatas.modalMessage">{{ modalDatas.modalMessage }}</p>
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
          <p
            v-for="item in tutorialsData"
            :key="item.message"
            :style="{ 'margin-bottom': item.margin }"
          >
            {{ item.message }}
          </p>
        </div>
      </div>
    </div>
    <!-- MODAL INFORMATIONS -->
    <div class="hub__informations" v-if="hubPosition">
      {{ hubCoordinate }}
    </div>

    <!-- FOR DISTANCE: BUG DIFFERENTE MEASURE BETWEEN POINTS & LINES -->
    <!-- <div class="hub__informations" v-if="distance.length === 2">
      {{ hubDistance }} meters
    </div> -->

    <!-- MODAL HUB POINT LOCATION -->
    <div id="hub" class="hub__target--btn">
      <v-btn color="black" class="mx-3" @click="saveTarget(false)">
        Cancel
      </v-btn>
      <v-btn color="black" class="mx-3" @click="saveTarget(true)"> OK </v-btn>
    </div>

    <p id="hubTuto" class="hub__target--tuto">Click inside</p>

    <i
      id="hubTarget"
      @click="locationTarget"
      aria-hidden="true"
      class="hub__target--icon mdi mdi-target"
    ></i>

    <!-- MAP -->
    <span class="print__block--title">{{ titleDocPrint }}</span>
    <div id="map" class="mt-5"></div>

    <!-- DISPLAY FOR PRINTING -->
    <div class="print__block">
      <legendModal
        class="print__block--legend"
        v-if="showPrintMap"
        :showPrintMap="showPrintOption"
        :markers="markers"
      />
    </div>
    <div id="mapPrint" v-show="showPrintMap"></div>
  </div>
</template>

<script>
import { createIndexedDB } from '@/static/functions/indexedDb'
import { mapState } from 'vuex'

export default {
  data: () => ({
    map: Object,
    coordinates: [],
    myLocationMark: undefined,
    showInputGeoDetail: false,
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
      {
        message: '<-- Show tutorial',
        margin: '22px',
      },
      {
        message: '<-- Settings and options',
        margin: '22px',
      },
      {
        message: '<-- Show legend',
        margin: '22px',
      },
      {
        message: '<-- Print or save as PDF',
        margin: '22px',
      },
      {
        message: '<-- Save datas temporaly',
        margin: '40px',
      },
      {
        message: '<-- Create custom marker/layer',
        margin: '22px',
      },
    ],
    tutoPage: false,
    // modal
    modalDatas: {
      showModal: false,
      showLegend: false,
      showSetting: false,
      modalTitle: false,
      modalMessage: false,
    },
    //modal Markers
    showModalMarker: false,
    // print
    showPrintOption: false,
    showPrintMap: false,
    titleDocPrint: undefined,
    printMap: undefined,
    // hub display
    markerTarget: undefined,
    // layers & layer group
    dynamicLayerGroup: {},
    propertiesNames: [],
    controlLayers: undefined,
    distance: [],
  }),
  computed: {
    ...mapState(['markers']),
    hubCoordinate() {
      let crd = this.coordinates[this.coordinates.length - 1]
      if (this.coordinates.length > 0) {
        return `Acc ${parseInt(this.accuracyLocation)}, lat ${crd[1]}, lng ${
          crd[0]
        }`
      } else {
        return 'Waiting for position...'
      }
    },
    hubDistance() {
      let meters = this.map.distance(this.distance[0], this.distance[1])
      return meters
    },
  },
  methods: {
    modalMarkerResponse(payload) {
      this.showModalMarker = payload.message
    },
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
      Object.keys(this.modalDatas).forEach((element) => {
        this.modalDatas[element] = payload.message
      })
      this.showInputGeoDetail = payload.message
      this.showPrintOption = false
      if (this.showPrintMap) {
        this.showPrintMap = false
        this.printMap.remove()
      }
    },
    printResponse(payload) {
      this.modalDatas.modalTitle = false
      this.modalDatas.showModal = payload.message
      this.titleDocPrint = payload.titleDocPrint
    },
    getData(payload) {
      this.showInputGeoDetail = payload.show
      this.modalDatas.showModal = payload.show
      this.modalDatas.modalTitle = false

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
        if (this.distance.length < 2) {
          this.distance.push(layer.feature.geometry.coordinates)
        } else {
          this.distance = []
          this.distance.push(layer.feature.geometry.coordinates)
        }
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
        let showHtml = `<i aria-hidden="true" class="v-icon notranslate mdi mdi-${type} theme--dark icon__layer--update--size" style="font-size: ${size}px; color:${color};"></i>`
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
              20,
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
    coordinatesOnLocation(element) {
      if (this.watchMe) {
        navigator.geolocation.clearWatch(this.watchMe)
        this.watchMe = undefined
        this.showInputGeoDetail = true
        this.modalDatas.showModal = true
        this.modalDatas.modalTitle = 'Add a symbol'
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
          this.modalDatas.modalTitle = 'Unable to retrieve your location'
          this.modalDatas.showModal = true
        }

        if (navigator.geolocation) {
          /* this.message = 'Locating...' */
          this.watchMe = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            maximumAge: 0,
          })
        } else {
          this.modalDatas.modalTitle =
            'Geolocation is not supported by your browser'
          this.modalDatas.showModal = true
        }
      }
    },
    locationTarget() {
      let style = {
        color: 'red',
        fillColor: 'red',
        radius: 2,
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
      const disabledDisplay = (id) => {
        let elt = document.getElementById(id)
        elt.style.display = 'none'
      }
      disabledDisplay('hubTarget')
      disabledDisplay('hubTuto')
      disabledDisplay('hub')

      if (e) {
        // if click on save marker true
        this.showInputGeoDetail = true
        this.modalDatas.showModal = true
        this.modalDatas.modalTitle = 'Add a symbol'
      } else {
        // if false, reset all
        this.coordinates = []
      }
      this.markerTarget.clearLayers()
      this.activateOrNotBtn(['btn-add', 'btn-trace', 'btn-target'])
    },
    activateOrNotBtn(arrayId) {
      let firstButton = document.getElementById(arrayId[0])
      let actionsBtn = document.getElementsByClassName('btn-map--action')
      let btnMarker = document.getElementById('btn-map-marker')
      let attribut = firstButton.getAttribute('disabled')
      let btn

      const btnAttribut = (booleen, color = 'grey') => {
        let typeColor = typeof color === 'string'
        arrayId.forEach((btnId) => {
          btn = document.getElementById(btnId)
          attributMethod(btn, booleen)
          btn.firstChild.style.color = typeColor ? color : color[0]
        })
        for (let btnAction of actionsBtn) {
          attributMethod(btnAction, booleen)
          btnAction.firstChild.style.color = typeColor ? color : color[1]
        }
        attributMethod(btnMarker, booleen)
        btnMarker.firstChild.style.color = typeColor ? color : color[2]
        btnMarker.style.border = `2px solid ${typeColor ? color : color[2]}`
      }
      const attributMethod = (a, booleen) => {
        booleen
          ? a.removeAttribute('disabled', '')
          : a.setAttribute('disabled', '')
      }

      if (attribut != null) {
        this.myLocationMark.removeFrom(this.map)
        btnAttribut(true, ['white', 'rgb(33, 150, 243)', '#e6e20b'])
      } else {
        btnAttribut(false)
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
      print = L.tileLayer(mapBoxUrl, {
        id: mapboxOutdoors,
        tileSize: 512,
        zoomOffset: -1,
        attribution: mapboxAttribution,
        accessToken: tokenMapbox,
      }),
      google = L.tileLayer(
        'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
        {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }
      ),
      lanscape = L.tileLayer(
        'https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=05002ac7d7034aec81f8963fa723e851'
      )

    // bouton pour le switch
    var baseMaps = {
      Streets: streets,
      Outdoors: outdoors,
      Google: google,
      Lanscape: lanscape,
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
    } else {
      // if no data in local storage, no overlay and open the tutorials
      this.propertiesNames = []
      this.helpModal()
    }

    const layersToShow = () => {
      let array = [lanscape, google, streets, outdoors, this.markerTarget] // layer by default + the layer for the target selection
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
      wheelPxPerZoomLevel: 300, // to control the snap of the zoom
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
      e.classList.contains('click')
        ? e.classList.remove('click')
        : e.classList.add('click')
    }

    let actionsControl = L.control.custom({
      position: 'topleft',
      content:
        '<button id="btn-tutorial" type="button" class="btn-map btn-map--action">' +
        '<i aria-hidden="true" class="v-icon notranslate mdi mdi-help-circle theme--dark" style="color:rgb(33, 150, 243);"></i>' +
        '</button>' +
        '<button id="btn-menu" type="button" class="btn-map btn-map--action">' +
        '<i aria-hidden="true" class="v-icon notranslate mdi mdi-menu theme--dark" style="color:rgb(33, 150, 243);"></i>' +
        '</button>' +
        '<button id="btn-legend" type="button" class="btn-map btn-map--action">' +
        '<i aria-hidden="true" class="v-icon notranslate mdi mdi-map-legend theme--dark" style="color:rgb(33, 150, 243);"></i>' +
        '</button>' +
        '<button id="btn-printer" type="button" class="btn-map btn-map--action">' +
        '<i aria-hidden="true" class="v-icon notranslate mdi mdi-printer theme--dark" style="color:rgb(33, 150, 243);"></i>' +
        '</button>' +
        '<button id="btn-save" type="button" class="btn-map btn-map--action">' +
        '<i aria-hidden="true" class="v-icon notranslate mdi mdi-content-save theme--dark" style="color:rgb(33, 150, 243);"></i>' +
        '</button>' +
        '<button id="btn-map-marker" type="button" class="btn-map btn-map--marker">' +
        '<i aria-hidden="true" class="v-icon notranslate mdi mdi-map-marker theme--dark" style="color:#e6e20b;"></i>' +
        '</button>',
      classes: 'btn-group-icon-map',
      style: styleControl,
      events: {
        click: async (data) => {
          if (data.target.getAttribute('id') === 'btn-tutorial') {
            this.helpModal()
          } else if (data.target.getAttribute('id') === 'btn-menu') {
            this.saveTemporaly()
            this.modalDatas.showModal = true
            this.modalDatas.modalTitle = 'Settings and Options'
            this.modalDatas.showSetting = true
          } else if (data.target.getAttribute('id') === 'btn-legend') {
            this.modalDatas.showLegend = !this.modalDatas.showLegend
            this.modalDatas.showModal = !this.modalDatas.showModal
            this.modalDatas.modalTitle = 'Map Legend'
          } else if (data.target.getAttribute('id') === 'btn-save') {
            this.saveTemporaly()
            this.modalDatas.showModal = !this.modalDatas.showModal
            this.modalDatas.modalTitle = 'Data save TEMPORALY'
            this.modalDatas.modalMessage =
              'For a safely save, consider to export your datas to CSV in settings'
          } else if (data.target.getAttribute('id') === 'btn-printer') {
            let openPrintOptions = () => {
              this.showPrintOption = !this.showPrintOption // modal for options ex: add a title
              this.modalDatas.showModal = !this.modalDatas.showModal // open common modal
              this.showPrintMap = !this.showPrintMap // build map print container
              this.modalDatas.modalTitle = 'Print option'
            }

            await openPrintOptions()
            // set the view dynamicly
            let actualMapCenter = [
              this.map.getCenter().lat,
              this.map.getCenter().lng,
            ]
            // mount the map after
            this.printMap = await L.map('mapPrint').setView(actualMapCenter, 6)
            await print.addTo(this.printMap)
            let mark = L.marker(actualMapCenter).addTo(this.printMap)
            // hide the container after the printing: cancel or save
            window.onafterprint = (event) => {
              this.showPrintOption = false
              this.showPrintMap = false
              mark.removeFrom(this.printMap) // remove the marker for the next print
              this.printMap.remove() // debug error, remove the map built
            }
          } else if (data.target.getAttribute('id') === 'btn-map-marker') {
            this.showModalMarker = !this.showModalMarker
          }
        },
      },
    })

    const checkIfMarkerEmpty = (doThis) => {
      if (this.markers.length === 0) {
        this.modalDatas.showModal = !this.modalDatas.showModal
        this.modalDatas.modalTitle = 'Create a marker first !'
      } else {
        doThis()
      }
    }

    let locationsControl = L.control.custom({
      position: 'topright',
      content:
        '<button id="btn-add" type="button" class="btn-map btn-map--location">' +
        '<i aria-hidden="true" class="v-icon notranslate mdi mdi-map-marker-radius theme--dark" style="color:white;"></i>' +
        '</button>' +
        '<button id="btn-trace" type="button" class="btn-map btn-map--location">' +
        '<i aria-hidden="true" class="v-icon notranslate mdi mdi-map-marker-path theme--dark" style="color:white;"></i>' +
        '</button>' +
        '<button id="btn-target" type="button" class="btn-map btn-map--location">' +
        '<i aria-hidden="true" class="v-icon notranslate mdi mdi-map-marker-plus theme--dark" style="color:white;"></i>' +
        '</button>',
      classes: 'btn-group-icon-map',
      style: styleControl,
      events: {
        click: (data) => {
          // ADD MY POSTION
          if (data.target.getAttribute('id') === 'btn-add') {
            const functionsLocate = () => {
              styleOnClick(data.target)
              this.activateOrNotBtn(['btn-trace', 'btn-target'])
              this.coordinatesOnLocation(true) // display differente type of coordinates one array
            }
            checkIfMarkerEmpty(functionsLocate)

            // TRACK ME
          } else if (data.target.getAttribute('id') === 'btn-trace') {
            const functionsTrack = () => {
              styleOnClick(data.target)
              this.coordinatesOnLocation(false) // display differente type of coordinates multiple array
              this.activateOrNotBtn(['btn-add', 'btn-target'])
            }
            checkIfMarkerEmpty(functionsTrack)

            // POINT A COORDINATE
          } else if (data.target.getAttribute('id') === 'btn-target') {
            const functionsAdd = () => {
              this.activateOrNotBtn(['btn-add', 'btn-trace', 'btn-target'])
              // LOAD THE HUB FOR TARGET
              let x = this.map.getSize().x / 2 - 24
              let y = this.map.getSize().y / 2 - 29.5

              let icon = document.getElementById('hubTarget')
              icon.style.display = 'block'
              let tuto = document.getElementById('hubTuto')
              tuto.style.display = 'block'
              let hub = document.getElementById('hub')
              hub.style.display = 'flex'

              icon.style.top = `${y}px`
              icon.style.left = `${x}px`
              tuto.style.top = `${y - 10}px`
              tuto.style.left = `${x - 10}px`
              hub.style.top = `${y + 100}px`
              hub.style.left = `${x + 20}px`
            }
            checkIfMarkerEmpty(functionsAdd)
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
        let result = await createIndexedDB()

        if (result) {
          const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
          requestIndexedDB.onsuccess = (event) => {
            var db = event.target.result

            var transaction = db.transaction('markers', 'readwrite')
            const store = transaction.objectStore('markers')
            let newIcons = [
              {
                type: 'Point',
                category: 'home',
                subCategory: [],
                icon: 'home',
                color: ['red'],
              },
              {
                type: 'Polygon',
                category: 'area',
                subCategory: [],
                icon: '',
                color: ['green'],
              },
              {
                type: 'MultiLineString',
                category: 'line',
                subCategory: [],
                icon: '',
                color: ['blue'],
              },
            ]
            newIcons.forEach((element) => {
              store.add(element)
            })

            console.log('markers added to the store')
            transaction.oncomplete = () => {
              db.close()
            }
          }
          requestIndexedDB.onerror = (event) => {
            console.log(event)
          }
        }
      }
      this.$store.dispatch('loadMarkers')
    }
    checkDB()
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
  font-family: 'Architects Daughter', cursive;
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
.leaflet-touch .leaflet-control-layers {
  background-color: black;
  border: 2px solid #e6e20b;
  color: white;
  padding: 4px;
  border-radius: 20px 2px;
  margin-right: 15px;
  color: white;
}
.leaflet-control-layers-expanded {
  background-color: black;
}
.hub__target {
  &--icon {
    display: none;
    position: absolute;
    z-index: 3;
    color: black;
    font-size: 50px;
  }
  &--tuto {
    display: none;
    position: absolute;
    z-index: 3;
    color: black;
    font-size: 15px;
    font-weight: bold;
  }
  &--btn {
    display: none;
    justify-content: space-between;
    position: absolute;
    transform: translate(-50%, -50%);
    width: 270px;
    height: 50px;
    background-color: transparent;
    z-index: 3;
  }
}
.hub__informations {
  display: block;
  position: absolute;
  bottom: 8%;
  left: 20%;
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
  background-color: black;
  position: relative;
  margin: 3px 0px;
  &--action {
    padding: 6px;
    border-radius: 10px 10px;
    width: 40px;
    margin-left: 7px;
  }
  &--location {
    padding: 15px;
    border-radius: 30px 30px;
  }
  &--marker {
    padding: 15px;
    margin-top: 10px;
    border-radius: 20px 2px;
    border: 2px solid #e6e20b;
  }
  &::after {
    /* extend the click to all the button */
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
  &::before {
    content: 'Click to save =>';
    font-family: 'Architects Daughter', cursive;
    position: absolute;
    top: 15px;
    left: -130px;
    height: 20px;
    width: 130px;
    color: rgb(46, 46, 46);
    font-size: 15px;
    font-weight: bold;
  }
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
  }
}

/* The Close Button */
.modal_action {
  position: absolute;
  left: 5%;
  top: 300px;
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
      left: 170px;
    }
  }
  .modal_action {
    padding-left: 100px;
  }
  .btn-map {
    &--action {
      &:hover {
        border: 2px solid rgb(33, 150, 243);
      }
    }
    &--location {
      &:hover {
        border: 2px solid rgb(33, 150, 243);
      }
    }
    &--marker {
      &:hover {
        border: 2px solid white;
      }
    }
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
    height: 400px !important;
    width: 740px !important;
    border: 2px solid grey;
    margin-top: 10px;
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
    display: block !important;
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
