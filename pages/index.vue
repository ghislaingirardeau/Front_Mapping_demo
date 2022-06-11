<template>
  <div class="container__map">
    <!-- MODAL CREATE MARKER -->
    <createMarker
      :markers="markers"
      :showModal="modalShow.addMarker"
      @send-marker="modalResponse"
    />
    <!-- MODAL SETTING -->
    <modalCustom :showModal="modalShow.legend" @send-modal="modalResponse">
      <template v-slot:title> Legend & Options </template>
      <template v-slot:content>
        <legendModal
          :markers="markers"
          :map="map"
          :measureActive="measureActive"
          @send-measure="measureActivate"
        />
      </template>
    </modalCustom>

    <modalCustom :showModal="modalShow.addLocation" @send-modal="modalResponse">
      <template v-slot:title> Add a location </template>
      <template v-slot:content>
        <dataGeoJson
          @send-data="getData"
          :coordinates="coordinates"
          :key="modalShow.addLocation"
        />
      </template>
    </modalCustom>

    <modalCustom :showModal="modalShow.setting" @send-modal="modalResponse">
      <template v-slot:title> Settings & Menu </template>
      <template v-slot:content>
        <optionsMenu :key="modalShow.setting" />
      </template>
    </modalCustom>

    <modalCustom :showModal="modalShow.print" @send-modal="modalResponse">
      <template v-slot:title> Print or save as PDF </template>
      <template v-slot:content>
        <printOptions @send-modal="printResponse" />
      </template>
    </modalCustom>

    <modalCustom :showModal="modalShow.generic" @send-modal="modalResponse">
      <template v-slot:title>
        {{ modalShow.modalTitle }}
      </template>
      <template v-slot:content>
        <p>{{ modalShow.modalMessage }}</p>
      </template>
    </modalCustom>

    <!-- MODAL EDIT POSITION -->
    <edit-menu :showModal="editShow.menu" @send-modal="modalResponse">
      <template v-slot:title>
        <span> Edit my data </span>
      </template>
      <template v-slot:content>
        <edit-data
          :editItem="editItem"
          v-if="editShow.location"
          @send-modal="modalEditLocation"
        />
        <edit-marker
          v-if="editShow.mark"
          :rulesEditSub="rulesEditSub"
          :editItem="editMarker"
          :oldItem="oldMark"
        ></edit-marker>
        <div
          class="d-flex justify-space-around align-center"
          v-if="!editShow.mark && !editShow.location"
        >
          <v-btn outlined color="primary" @click="editShow.mark = true"
            >Marker</v-btn
          >
          <span>Or</span>
          <v-btn outlined color="primary" @click="editShow.location = true"
            >Location</v-btn
          >
        </div>
      </template>
    </edit-menu>

    <!-- MODAL TUTORIAL -->
    <theTutorial :showTutorial="showTutorial" @send-tuto="closeTuto" />

    <!-- MODAL GPS LOCATION -->
    <hub-info v-if="hubPosition">
      <template v-slot:title>
        {{ hubCoordinate }}
      </template>
    </hub-info>
    <!-- MODAL INFO -->
    <hub-info
      v-if="
        !userAuth &&
        !hubPosition &&
        !modalShow.print &&
        !modalShow.generic &&
        !modalShow.addMarker &&
        editMark.length === 0
      "
      :hubPosition="hubPosition"
    >
      <template v-slot:title> Don't forget to log to save your datas </template>
    </hub-info>

    <hub-info v-if="editMark.length > 0">
      <template v-slot:title>
        <v-btn color="secondary" outlined @click="cancelMove">cancel</v-btn>
      </template>
    </hub-info>

    <!-- FOR DISTANCE: BUG DIFFERENTE MEASURE BETWEEN POINTS & LINES -->
    <!-- <div class="hub__informations" v-if="distance.length === 2">
      {{ hubDistance }} meters
    </div> -->

    <!-- MODAL HUB POINT LOCATION -->
    <hub-location :saveTarget="saveTarget" :locationTarget="locationTarget" />

    <!-- TITLE FOR PRINTING -->
    <span class="print__block--title">{{ titleDocPrint }}</span>

    <!-- MAP CONTROL ACTIONS -->
    <div class="btn__actions">
      <v-icon
        size="30px"
        :disabled="disableAction"
        color="rgb(33, 150, 243)"
        @click="showTutorial = true"
        class="pa-2"
        >mdi-help-rhombus-outline</v-icon
      >
      <v-icon
        size="30px"
        :disabled="disableAction"
        color="rgb(33, 150, 243)"
        @click="modalShow.setting = true"
        class="pa-2 border"
        >mdi-menu</v-icon
      >
      <v-icon
        size="30px"
        :disabled="disableAction"
        color="rgb(33, 150, 243)"
        @click="modalShow.legend = !modalShow.legend"
        class="pa-2"
        >mdi-map-legend</v-icon
      >
      <v-icon
        size="30px"
        :disabled="disableAction"
        color="rgb(33, 150, 243)"
        @click="saveAction"
        class="pa-2"
        >mdi-content-save</v-icon
      >
      <v-icon
        size="30px"
        :disabled="disableAction"
        v-if="$vuetify.breakpoint.width > 990"
        color="rgb(33, 150, 243)"
        @click="printAction"
        class="pa-2"
        >mdi-printer</v-icon
      >
      <v-icon
        size="30px"
        :disabled="disableAction"
        color="rgb(33, 150, 243)"
        @click="modalShow.addMarker = !modalShow.addMarker"
        class="pa-2 border"
        >mdi-map-marker-plus</v-icon
      >
    </div>

    <div class="btn__location">
      <v-icon
        size="33px"
        color="rgb(33, 150, 243)"
        :disabled="disableLocation.position"
        @click="GPSLocation(true, $event)"
        class="pa-3 btn-track"
        >mdi-map-marker-radius</v-icon
      >
      <v-icon
        size="33px"
        color="rgb(33, 150, 243)"
        :disabled="disableLocation.track"
        @click="GPSLocation(false, $event)"
        class="pa-3 btn-track"
        >mdi-map-marker-path</v-icon
      >
      <v-icon
        size="33px"
        color="rgb(33, 150, 243)"
        :disabled="disableLocation.target"
        @click="targetLocation"
        class="pa-3 btn-track"
        >mdi-map-marker-outline</v-icon
      >
    </div>

    <!-- MAP -->
    <div id="map" class="mt-5"></div>

    <!-- DISPLAY FOR PRINTING -->
    <div class="print__block">
      <legend-modal
        class="print__block--legend"
        v-if="showPrintMap"
        :showPrintMap="modalShow.print"
        :markers="markers"
      />
    </div>
    <div id="mapPrint" v-show="showPrintMap"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    map: Object,
    coordinates: [],
    myLocationMark: undefined,
    watchMe: undefined,
    accuracyLocation: undefined,
    hubPosition: undefined,
    layerGeoJson: undefined,
    // tutorial
    showTutorial: false,
    // modal modalShow.addMarker
    modalShow: {
      generic: false,
      addLocation: false,
      addMarker: false,
      legend: false,
      print: false,
      setting: false,
      modalTitle: false,
      modalMessage: false,
    },
    measureActive: false,
    // btn controls
    disableAction: false,
    disableLocation: {
      position: false,
      track: false,
      target: false
    },
    // print
    showPrintMap: false,
    printLayer: undefined,
    titleDocPrint: undefined,
    printMap: undefined,
    // hub display
    markerTarget: undefined,
    // layers & layer group
    dynamicLayerGroup: {},
    propertiesNames: [],
    controlLayers: undefined,
    //test distance
    distance: [],
    //edit Item editShow.mark
    editShow: {
      menu: false,
      location: false,
      mark: false,
    },
    editItem: {},
    editMark: [],
    oldMark: {},
    editMarker: {},
    rulesEditSub: [(v) => v.length > 1 || 'minimum 2 characters'],
    pointsOfLocation: {},
  }),
  computed: {
    ...mapState(['markers', 'userAuth', 'GeoJsonDatas']),
    hubCoordinate() {
      let crd = this.coordinates[this.coordinates.length - 1]
      if (this.coordinates.length > 0) {
        return `Acc ${parseInt(this.accuracyLocation)}, lat ${crd[1]}, lng ${
          crd[0]
        }`
      } else {
        return 'Waiting for position... Accuracy too low'
      }
    },
    /* hubDistance() {
      let meters = this.map.distance(this.distance[0], this.distance[1])
      return meters
    }, */
  },
  methods: {
    saveAction() {
      this.saveDatas() //mixins
      this.modalShow.generic = !this.modalShow.generic
      this.modalShow.modalTitle = this.userAuth
        ? 'Data save'
        : 'Data save TEMPORALY'
      this.modalShow.modalMessage = this.userAuth
        ? 'Your data is saved in the database.'
        : 'For a safely save, consider to export your datas to CSV or Register for free'
    },
    async printAction() {
      let openPrintOptions = () => {
        return new Promise((resolve, reject) => {
          this.modalShow.print = !this.modalShow.print // modal for options ex: add a title
          this.showPrintMap = !this.showPrintMap // build map print container
          resolve(true)
        })
      }

      // set the view dynamicly
      let actualMapCenter = [this.map.getCenter().lat, this.map.getCenter().lng]
      let result = await openPrintOptions()
      if (result) {
        // mount the map after
        this.printMap = await L.map('mapPrint').setView(actualMapCenter, 6)
        this.printLayer.addTo(this.printMap)
        let mark = L.marker(actualMapCenter).addTo(this.printMap)
        window.onafterprint = (event) => {
          this.modalShow.print = false
          this.showPrintMap = false
          mark.removeFrom(this.printMap) // remove the marker for the next print
          this.printMap.remove() // debug error, remove the map built
        }
      }
    },
    measureActivate(payload) {
      this.measureActive = payload.measure
    },
    closeTuto(payload) {
      this.showTutorial = payload.message
    },
    modalEditLocation(payload) {
      // build the marker on map only if click on move or add
      const displayMarkersOnMap = () => {
        this.editMark = []

        this.pointsOfLocation.coordinates.forEach((element, i) => {
          this.editMark.push(
            L.marker(element.reverse(), {
              icon: L.divIcon({
                html: `<i aria-hidden="true" class="v-icon notranslate mdi mdi-arrow-expand-all theme--dark icon__layer--update--size" style="font-size: 20px; color:black;"></i>`,
              }),
              draggable: true,
            })
          )
          this.editMark[i].addTo(this.map)
          this.editMark[i].on('dragend', (el) => {
            let data = {
              id: this.pointsOfLocation.id,
              coordinates: [el.target._latlng.lng, el.target._latlng.lat],
              index: i,
            }
            this.$store.dispatch('updateMarkCoordinates', data)
            this.refreshMap()
          })
        })
      }
      if (payload.message === 'move') {
        displayMarkersOnMap()
        this.disableAction = !this.disableAction
      } else if (payload.message === 'add') {
        displayMarkersOnMap()
        this.disableAction = !this.disableAction
        // add a point to the line or polygon
        // change the cursor
        document.getElementById('map').style.cursor = 'crosshair'
        // remove all editMark
        this.editMark.forEach((elt) => elt.removeFrom(this.map))
        this.map.on('click', (e) => {
          let coordinates = [e.latlng.lng, e.latlng.lat]
          let data = {
            id: payload.id,
            coordinates: coordinates,
          }
          this.$store.dispatch('addPointLine', data)
          // disable the click after one
          this.map.off('click')
          this.refreshMap()
        })
      }
      this.editShow.location = false
      this.editShow.menu = !this.editShow.menu
    },
    cancelMove() {
      this.refreshMap()
    },
    modalResponse(payload) {
      Object.keys(this.modalShow).forEach((element) => {
        this.modalShow[element] = payload.message
      })
      Object.keys(this.editShow).forEach((element) => {
        this.editShow[element] = payload.message
      })
      if (this.showPrintMap) {
        this.showPrintMap = false
        this.printMap.remove()
        this.printMap = undefined
      }
      this.coordinates = []
    },
    printResponse(payload) {
      this.titleDocPrint = payload.titleDocPrint
      this.modalShow.print = false
    },
    getData(payload) {
      this.modalShow.addLocation = payload.show

      if (payload.newGeoJson) {
        // si je valide la creation
        let newGeoJson = payload.newGeoJson
        let groupLayer = newGeoJson.properties.category
        this.$store.dispatch('geoJsonOnCreate', newGeoJson)

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

          // SAVE THE newGeoJson DIRECTLY INSIDE THE LOCALSTORAGE
          // SO I CAN REMOVE ALL THE CONVERT JSON CODE INSIDE SAVETEMP METHODS

          this.createGeoJsonLayer(
            newGeoJson,
            this.dynamicLayerGroup[groupLayer]
          )
        }
      }

      this.coordinates = []
    },
    createGeoJsonLayer(layerType, groupLayer) {
      // layerType = le geojson que je souhaite envoyer dans le layer
      // groupLayer = dans quel groupe de layer je charge celui-ci : village ou house

      const onEachFeature = async (feature, layer) => {
        const createLayer = () => {
          return new Promise((resolve, reject) => {
            const showPopupMarker = (e) => {
              var layer = e.target
              layer.openPopup()
            }

            const hidePopupMarker = (e) => {
              var layer = e.target
              layer.closePopup()
            }

            const editLocation = (e) => {
              // EDIT LOCATION
              this.editItem = structuredClone({ ...e.target.feature })
              // if it's a point or a polygon, store array of coordinates differently
              this.editItem.geometry.type === 'Point'
                ? (this.pointsOfLocation.coordinates = [
                    structuredClone(this.editItem.geometry.coordinates),
                  ])
                : (this.pointsOfLocation.coordinates = structuredClone(
                    this.editItem.geometry.coordinates[0]
                  ))
              // get the id of the geojson to change
              this.pointsOfLocation.id = this.editItem.properties.id

              // EDIT MARKER
              this.oldMark = this.markers.find(
                (elt) =>
                  elt.category === this.editItem.properties.category &&
                  elt.icon === this.editItem.icon.type &&
                  elt.color === this.editItem.icon.color &&
                  elt.subCategory === this.editItem.properties.subCategory
              )
              if (this.editItem.properties.subCategory.length > 0) {
                this.rulesEditSub = [
                  (v) => v.length > 1 || 'minimum 2 characters',
                ]
              } else {
                this.rulesEditSub = [true]
              }
              this.editMarker = structuredClone(this.oldMark)

              this.editShow.menu = !this.editShow.menu
            }
            // pour faire apparaitre le popup du marker si popupContent est defini
            if (feature.properties && feature.properties.popupContent) {
              layer.bindPopup(feature.properties.popupContent)
            }
            layer.on({
              mouseover: showPopupMarker,
              mouseout: hidePopupMarker,
              click: editLocation,
            })
            resolve(true)
          })
        }
        let response = await createLayer()
        if (response) {
          // dynamic show of layer if it's activated or not
          if (
            layer instanceof L.Polygon ||
            (layer instanceof L.Path && layer.feature)
          ) {
            this.measureActive
              ? layer.showMeasurements()
              : layer.hideMeasurements()
          }
        }
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
          return { color: feature.icon.color, weight: 4 }
        },
      })

      // GROUPE DE LAYER DANS LEQUEL J'ENREGISTRE LE JSON
      groupLayer.addLayer(this.layerGeoJson)
    },
    GPSLocation(element) {
      const disabledBtn = (boolean) => {
        if (element) {
          this.disableLocation.track = boolean
          this.disableLocation.target = boolean
        } else {
          this.disableLocation.position = boolean
          this.disableLocation.target = boolean
        }
      }
      // customize pseudo element before (already use on the button for the icon)
      let eltBefore = document.getElementsByClassName('btn__location')[0]
      element ? eltBefore.style.setProperty("--selection-top", "20px") : eltBefore.style.setProperty("--selection-top", "90px")

      if (this.markers.length === 0) {
        this.modalShow.generic = !this.modalShow.generic
        this.modalShow.modalTitle = 'Add a location'
        this.modalShow.modalMessage =
          'Create a marker before to add a location !'
      } else {
        if (this.watchMe) {
          navigator.geolocation.clearWatch(this.watchMe)
          this.watchMe = undefined
          this.modalShow.addLocation = true
          this.hubPosition = false
          this.disableAction = !this.disableAction
          disabledBtn(false)
          eltBefore.style.setProperty("--selection-block", "none")
        } else {
          this.disableAction = !this.disableAction
          disabledBtn(true)
          
          let success = (position) => {
            this.hubPosition = true
            this.accuracyLocation = position.coords.accuracy
            if (element && this.accuracyLocation < 10) {
              this.coordinates = [
                [position.coords.longitude, position.coords.latitude],
              ]
            } else if (this.accuracyLocation < 10) {
              // show only if accuracy is good
              eltBefore.style.setProperty("--selection-block", "block")
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
            this.modalShow.modalTitle = 'Unable to retrieve your location'
            this.modalShow.generic = true
          }

          if (navigator.geolocation) {
            this.watchMe = navigator.geolocation.watchPosition(success, error, {
              enableHighAccuracy: true,
              maximumAge: 0,
            })
          } else {
            this.modalShow.modalTitle =
              'Geolocation is not supported by your browser'
            this.modalShow.generic = true
          }
        }
      }
    },
    targetLocation() {
      // disable all btn
      Object.keys(this.disableLocation).forEach((element) => {
        this.disableLocation[element] = true
      })

      if (this.markers.length === 0) {
        this.modalShow.generic = !this.modalShow.generic
        this.modalShow.modalTitle = 'Add a location'
        this.modalShow.modalMessage =
          'Create a marker before to add a location !'
      } else {
        this.disableAction = !this.disableAction
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
      this.disableAction = !this.disableAction
      Object.keys(this.disableLocation).forEach((element) => {
        this.disableLocation[element] = false
      })
      const disabledDisplay = (id) => {
        let elt = document.getElementById(id)
        elt.style.display = 'none'
      }
      disabledDisplay('hubTarget')
      disabledDisplay('hubTuto')
      disabledDisplay('hub')

      if (e) {
        // if click on save marker true
        this.modalShow.addLocation = true
      } else {
        // if false, reset all
        this.coordinates = []
      }
      this.markerTarget.clearLayers()
    },
  },
  mounted() {
    // config mapbox
    const tokenMapbox =
      'pk.eyJ1IjoiZ2d3ZWJkZXYiLCJhIjoiY2t4OGVhemd5MXpyMzJvbzE4ZXpxajJzZCJ9.P2KXn7NQDyQ11BkYVkPEcQ'
    const mapBoxUrl = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${tokenMapbox}`
    const mapboxStreets = 'mapbox/streets-v11'
    const mapboxOutdoors = 'mapbox/outdoors-v11'
    const mapboxAttribution =
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'

    // pour switcher sur different layers
    let outdoors = L.tileLayer(mapBoxUrl, {
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

    this.printLayer = L.tileLayer(mapBoxUrl, {
      id: mapboxOutdoors,
      tileSize: 512,
      zoomOffset: -1,
      attribution: mapboxAttribution,
      accessToken: tokenMapbox,
    })

    // bouton pour le switch
    let baseMaps = {
      Streets: streets,
      Outdoors: outdoors,
      Google: google,
      Lanscape: lanscape,
    }

    /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
    let setMapView = {
      center: [0, 0],
      zoom: 6,
    }
    if (Object.keys(this.GeoJsonDatas).length > 0) {
      // CHECK IF OBJECT GeoJsonDatas IS EMPTY OR NOT
      // if there is data from a file, loaded
      try {
        this.propertiesNames = Object.keys(this.GeoJsonDatas) // recupere le nom de chaque propriete

        this.propertiesNames.forEach((element) => {
          this.dynamicLayerGroup[element] = L.layerGroup() // creer un nouveau groupe de layer pour chaque nom
          this.createGeoJsonLayer(
            this.GeoJsonDatas[element],
            this.dynamicLayerGroup[element]
          ) // charge le array de goejsons dans le layer
          // zoom the map on the last point added coordinates

          if (this.GeoJsonDatas[element][0].geometry.type === 'Point') {
            setMapView.center = []
            setMapView.center.push(
              this.GeoJsonDatas[element][0].geometry.coordinates[1]
            )
            setMapView.center.push(
              this.GeoJsonDatas[element][0].geometry.coordinates[0]
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
      this.showTutorial = !this.showTutorial
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

  },
}
</script>

<style lang="scss">
</style>
