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
          @send-data="locationData"
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
    <theTutorial :showTutorial="showTutorial" @send-tuto="closeTuto" :userAuth='userAuth' />

    <!-- MODAL GPS LOCATION -->
    <hub-info v-if="hubPosition">
      <template v-slot:title>
        Waiting for position... Accuracy too low
      </template>
    </hub-info>
    <!-- MODAL INFO -->
    <hub-info
      v-if="
        !userAuth &&
        !hubPosition &&
        !printMap.show &&
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
        <v-btn color="secondary" text @click="cancelMove">cancel</v-btn>
      </template>
    </hub-info>

    <!-- FOR DISTANCE: BUG DIFFERENTE MEASURE BETWEEN POINTS & LINES -->
    <!-- <div class="hub__informations" v-if="distance.length === 2">
      {{ hubDistance }} meters
    </div> -->

    <!-- MODAL HUB POINT LOCATION -->
    <hub-location :saveTarget="saveTarget" :locationTarget="locationTarget" />

    <!-- TITLE FOR PRINTING -->
    <span class="print__block--title">{{ printMap.title }}</span>

    <!-- MAP CONTROL ACTIONS -->
    <nav class="btn__actions" v-if="!printMap.show">
      <control-menu
        :disableAction="disableAction"
        border="border"
        icon="mdi-help-rhombus-outline"
        :doThis="navShow"
        :id="1"
      />
      <control-menu
        :disableAction="disableAction"
        icon="mdi-menu"
        :doThis="navShow"
        :id="2"
      />
      <control-menu
        :disableAction="disableAction"
        icon="mdi-map-legend"
        :doThis="navShow"
        :id="3"
      />
      <control-menu
        :disableAction="disableAction"
        v-if="$vuetify.breakpoint.width > 990"
        icon="mdi-printer"
        :doThis="printAction"
      />
      <control-menu
        :disableAction="disableAction"
        icon="mdi-content-save"
        :doThis="saveAction"
      />
      <control-menu
        :disableAction="disableAction"
        icon="mdi-map-marker-plus"
        border="border-double"
        :doThis="navShow"
        :id="4"
      />
      <!-- MAP LAYERS -->
      <control-layers
        icon="mdi-layers"
        :disableAction="disableAction"
        :closeOnClick="true"
        id="1"
      >
        <template v-slot:content>
          <v-list-item-group>
            <v-list-item
              v-for="(item, i) in Object.keys(layersMapsMixin())"
              :key="i"
            >
              <v-list-item-content @click="switchLayerMap(item)">
                <v-list-item-title v-text="item"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </template>
      </control-layers>
      <!-- GEOJSON LAYERS -->
      <control-layers
        icon="mdi-layers-search"
        :disableAction="disableAction"
        :closeOnClick="false"
        id="2"
        v-if="GeoJsonDatas && Object.keys(GeoJsonDatas).length > 0"
        :key="Object.keys(GeoJsonDatas).length"
      >
        <template v-slot:content>
          <v-list-item v-for="(value, key, index) in GeoJsonDatas" :key="index">
            <v-checkbox
              v-model="geoActive[key]"
              :label="key"
              dense
              @click="switchLayerGeoJson(key)"
              color="secondary"
            ></v-checkbox>
          </v-list-item>
        </template>
      </control-layers>
      <!-- FOLDER TO SHOW -->
      <control-layers
        icon="mdi-layers-edit"
        :disableAction="disableAction"
        :closeOnClick="true"
        id="3"
        v-if="userAuth"
      >
        <template v-slot:content>
          <v-list-item-group>
            <v-list-item
              v-for="(item, i) in foldersName"
              :key="i"
            >
              <v-list-item-content @click="switchFolderMap(item)">
                <v-list-item-title v-text="item" :class="{activeFolder: workOn === item}"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </template>
      </control-layers>

    </nav>

    <aside class="btn__location" v-if="!printMap.show">
      <v-icon
        size="33px"
        color="primary"
        :disabled="disableLocation.position"
        @click="GPSLocation(true, $event)"
        class="pa-3 btn-location-position"
        >mdi-map-marker-radius</v-icon
      >
      <v-icon
        size="33px"
        color="primary"
        :disabled="disableLocation.track"
        @click="GPSLocation(false, $event)"
        class="pa-3 btn-location-trace"
        >mdi-map-marker-path</v-icon
      >
      <v-icon
        size="33px"
        color="primary"
        :disabled="disableLocation.target"
        @click="targetLocation"
        class="pa-3 btn-location-target"
        >mdi-map-marker-outline</v-icon
      >
    </aside>

    <!-- MAP -->
    <div id="map"></div>

    <!-- DISPLAY FOR PRINTING -->
    <div class="print__block">
      <legend-modal
        class="print__block--legend"
        :showPrintMap="printMap.show"
        :markers="markers"
      />
    </div>
    <div id="mapPrint" v-show="printMap.show"></div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  data: () => ({
    map: Object,
    layersList: [],
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
      target: false,
    },
    // print
    printMap: {
      show: false,
      layer: undefined,
      title: undefined,
      map: undefined,
      view: 6,
    },
    // hub display
    markerTarget: undefined,
    // layers & layer group
    dynamicLayerGroup: {},
    propertiesNames: [],
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
    animeBtnLocation: undefined
  }),
  computed: {
    ...mapState(['markers', 'userAuth', 'GeoJsonDatas']),
    ...mapGetters(['workOn', 'foldersName']),
    /* hubDistance() {
      let meters = this.map.distance(this.distance[0], this.distance[1])
      return meters
    }, */
    geoActive() {
      return {}
    },
  },
  methods: {
    navShow(elt, $event) {
      switch (elt) {
        case 1:
          this.showTutorial = !this.showTutorial
          this.animTutoBtn($event.target, false)
          break
        case 2:
          this.modalShow.setting = true
          this.animationBtn($event.target, 0, 180, false) //mixins

          break
        case 3:
          this.modalShow.legend = true
          this.animationBtn($event.target, 0, 180, false) //mixins

          break
        case 4:
          this.modalShow.addMarker = true
          this.animationBtn($event.target, 0, 180, false) //mixins

          break
      }
    },
    async switchLayerMap(name) {
      let layers = this.layersMapsMixin()
      const remove = () => {
        return new Promise((resolve, reject) => {
          Object.keys(layers).forEach((e) => this.map.removeLayer(layers[e]))
          resolve(true)
        })
      }
      let result = await remove()
      result ? this.map.addLayer(layers[name]) : ''
    },
    switchLayerGeoJson(e) {
      this.geoActive[e]
        ? this.map.addLayer(this.dynamicLayerGroup[e])
        : this.map.removeLayer(this.dynamicLayerGroup[e])
    },
    switchFolderMap(name) { 
      let folder = {
        name: name,
      }
      this.$store.dispatch('clickFolder', folder)
      this.refreshMap()
    },
    saveAction(none, $event) {
      this.animationBtn($event.target, 0, 180, false) //mixins
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
          this.printMap.show = !this.printMap.show // build map print container
          resolve(true)
        })
      }

      // set the view dynamicly
      let actualMapCenter = [this.map.getCenter().lat, this.map.getCenter().lng]
      let result = await openPrintOptions()
      if (result) {
        // mount the map after
        this.printMap.map = await L.map('mapPrint').setView(actualMapCenter, this.printMap.view)
        this.printMap.layer.addTo(this.printMap.map)
        let mark = L.marker(actualMapCenter).addTo(this.printMap.map)
        window.onafterprint = (event) => {
          this.modalShow.print = false
          this.printMap.show = false
          mark.removeFrom(this.printMap.map ) // remove the marker for the next print
          this.printMap.map.remove() // debug error, remove the map built
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
        Object.keys(this.disableLocation).forEach((element) => {
          this.disableLocation[element] = true
        })
      } else if (payload.message === 'add') {
        displayMarkersOnMap()
        this.disableAction = !this.disableAction
        Object.keys(this.disableLocation).forEach((element) => {
          this.disableLocation[element] = true
        })
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
      if (this.printMap.show) {
        this.printMap.show = false
        this.printMap.map.remove()
        this.printMap.map = undefined
      }
      this.coordinates = []
      // disable animation

      let elt = document.getElementsByClassName('animationRotateBtn')
      for (let index of elt) {
        this.animationBtn(index, 180, 0, true) //mixins
      }
    },
    printResponse(payload) {
      this.printMap.title = payload.titleDocPrint
      this.modalShow.print = false
    },
    locationData(payload) {
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
          this.createGeoJsonMixin(
            newGeoJson,
            this.dynamicLayerGroup[groupLayer]
          )
          // add the new layer inside the control overlay
          this.geoActive[groupLayer] = true
          // show automaticly the new layer group marker on map
          this.map.addLayer(this.dynamicLayerGroup[groupLayer])
        } else {
          // if category already exist, i just create the new geojson marker

          // SAVE THE newGeoJson DIRECTLY INSIDE THE LOCALSTORAGE
          // SO I CAN REMOVE ALL THE CONVERT JSON CODE INSIDE SAVETEMP METHODS

          this.createGeoJsonMixin(
            newGeoJson,
            this.dynamicLayerGroup[groupLayer]
          )
        }
      }

      this.coordinates = []
      this.myLocationMark.removeFrom(this.map)
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
      gsap.to('.btn-location-target', {
        duration: 1.4,
        rotateZ: '0deg',
        ease: 'elastic.out(1, 0.3)',
      })
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
  created() {
    // menu layer geojson: load switch on true automaticly
    if (this.GeoJsonDatas) {
      Object.keys(this.GeoJsonDatas).forEach((e) => {
        this.geoActive[e] = true
      })
    }
  },
  mounted() {
    this.printMap.layer = L.tileLayer(
      'https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=05002ac7d7034aec81f8963fa723e851'
    )

    /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
    let setMapView = {
      center: [0, 0],
      zoom: 6,
    }
    if (this.GeoJsonDatas && Object.keys(this.GeoJsonDatas).length > 0) {
      // CHECK IF OBJECT GeoJsonDatas IS EMPTY OR NOT
      // if there is data from a file, loaded
      try {
        this.propertiesNames = Object.keys(this.GeoJsonDatas) // recupere le nom de chaque propriete

        this.propertiesNames.forEach((element) => {
          this.dynamicLayerGroup[element] = L.layerGroup() // creer un nouveau groupe de layer pour chaque nom
          this.createGeoJsonMixin(
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
    }

    const layersToShow = () => {
      let array = [this.layersMapsMixin().landscape, this.markerTarget] // layer by default + the layer for the target selection
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
    // ADD scale control
    L.control.scale().addTo(this.map)
  },
}
</script>

<style lang="scss">
</style>
