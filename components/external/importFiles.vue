<template>
  <div>
    <p>Import a file will remove all the data actually displayed !</p>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-file-input
        label="Select CSV, GPX or KML files"
        id="fileInput"
        accept=".gpx, .kml, .csv"
        @click="fileToConvert"
        :rules="fileNameRules"
      ></v-file-input>
    </v-form>
    <v-spacer></v-spacer>
    <v-checkbox
      v-model="checkboxMerge"
      :label="`Merge the import datas to your actual data ? ${checkboxMerge.toString()}`"
    ></v-checkbox>
    <v-btn color="primary" class="mr-4" @click="validImport"> Import </v-btn>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    valid: true,
    checkboxMerge: false,
    objetData: {},
    newMarker: [],
    error: true,
  }),
  computed: {
    ...mapState(['markers', 'userAuth']),

    fileNameRules() {
      console.log(this.error);
      return [
        (v) => (!!v) || 'A file is required',
        (v) => this.error || 'format incorrect'
      ]
    },
  },
  methods: {
    fileToConvert() {
      try {
        this.objetData = {}
        this.newMarker = []
        const fileToConvert = document.querySelector('#fileInput')
        fileToConvert.addEventListener('change', (e) => {
          const getFile = e.target.files
          const mime = e.target.files[0].name.slice(-3)
          if (!getFile.length) {
            return false
          }
          const reader = new FileReader()
          reader.onload = (e) => {
            switch (mime) {
              case 'gpx': // do GPX method
                this.readGeoJson(mime, e)
                this.error = true
                break
              case 'kml': // do KML method
                this.readGeoJson(mime, e)
                this.error = true
                break
              case 'csv': // do CSV method
                this.readFileCsv(mime, e)
                this.error = true
                break
              default: 
                console.log('wrong file');
                this.error = false
                break
            }
          }
          reader.readAsText(getFile[0])
        })
        
      } catch (error) {
        console.log(error);
      }
    },
    readGeoJson(mimeParams, e) {
      const convertForApp = (newGeoJson) => {
        let convert
        // any character that is not a letter character
        const regex = /[^A-z]/g
        newGeoJson.features.forEach((element, i) => {
          // create the name of the category, extracting the first string char until a special char
          let category = element.properties.name.slice(
            0,
            element.properties.name.search(regex)
          )
          let getMarker = this.markers.find((e) => e.category === category)

          convert = {
            type: 'Feature',
            properties: {
              id: `ID${i}${Date.now()}`,
              name: element.properties.name,
              time: element.properties.time,
              popupContent: (element.properties.popupContent && element.properties.popupContent.length > 1) ? element.properties.popupContent: element.properties.name,
              category: category,
              subCategory: '',
            },
            geometry: element.geometry,
            icon: {
              type: element.geometry.type === 'Point' ? (getMarker ? getMarker.icon : 'map-marker') : '',
              color: getMarker ? getMarker.color : '',
            },
          }
          if (this.objetData[category]) {
            // get the color of the first element of the array, to get the same color
            convert.icon.color = this.objetData[category][0].icon.color
            this.objetData[category].push(convert)
          } else {
            
            if (!getMarker) { // if this category of marker exist already
              let randomColor = Math.floor(Math.random() * 16777215).toString(
                16
              )
              convert.icon.color = `#${randomColor}`
              // create the marker if the category is not create yet & define a random color
              // if point define map-marker as default marker
              this.newMarker.push({
                id: `IM${i}${Date.now()}`,
                type:
                  element.geometry.type === 'Point'
                    ? 'Point'
                    : 'MultiLineString',
                category: category,
                subCategory: '',
                icon: element.geometry.type === 'Point' ? 'map-marker' : '',
                color: convert.icon.color,
              })
            }
            this.objetData[category] = new Array()
            this.objetData[category].push(convert)
          }
        })
      }

      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(e.target.result, 'text/xml')
      let newGeoJson
      switch (
        mimeParams // GPX ou KML function
      ) {
        case 'gpx':
          newGeoJson = this.$convertToGeoJson.gpx(xmlDoc)
          break
        case 'kml':
          newGeoJson = this.$convertToGeoJson.kml(xmlDoc)
          break
      }
      convertForApp(newGeoJson)
    },
    async readFileCsv(mimeParams, e) {
      // convert the coordinates
      const convertCoordinate = (coordinates, data) => {
        let indexLng = data.indexOf("'")
        if (indexLng === -1) {
          coordinates.push(parseFloat(data))
        } else {
          let degres = data.slice(0, indexLng)
          let minute = data.slice(indexLng + 1) / 60
          coordinates.push(parseFloat(degres) + parseFloat(minute))
        }
      }

      // function to create the layer for each category of json
      const createGeoJsons = (element, layer) => {
        try {
          let coordinates = []
          if (element.coordinates.indexOf('/') === -1) {
            let coordinateNumber = element.coordinates.split(' ')
            coordinateNumber.forEach((element) => {
              convertCoordinate(coordinates, element)
            })
          } else {
            let coordinateNumber = element.coordinates.split('/')
            let array = []
            coordinateNumber.forEach((element) => {
              array.push(element.split(' '))
            })
            coordinates.push(array)
          }
          let newGeoJson = {
            type: 'Feature',
            properties: {
              id: element.id,
              name: element.name,
              popupContent: (element.popupContent && element.popupContent.length > 1) ? element.popupContent: element.name,
              time: element.time,
              category: element.category,
              subCategory: element.subCategory,
            },
            geometry: {
              type: element.type,
              coordinates: coordinates,
            },
            icon: {
              type: this.newMarker.find(e => e.category === element.category).icon,
              color: this.newMarker.find(e => e.category === element.category && e.subCategory === element.subCategory).color,
            },
          }
          layer.push(newGeoJson)
        } catch (error) {
          console.log('wrong files', error)
        }
      }

      let csv = e.target.result
      // CONVERT CSV TO JSON
      var lines = csv.split('\n')
      var result = []
      var headers = lines[0].split(',')

      for (var i = 1; i < lines.length - 1; i++) {
        var obj = {}
        var currentline = lines[i].split(',')

        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j]
        }

        result.push(obj)
      }
      let JsonFromCsv = result
      // reinitialize datas marker & geojson => to prevent adding when change files
      let categories = [...new Set(JsonFromCsv.map((elt) => elt.category))]

      // CREATE THE MARKERS
      // remove the object which as the same category and sub category
      let res = JsonFromCsv.filter(
        (value, index, array) =>
          index ===
          array.findIndex(
            (t) =>
              t.category === value.category &&
              t.subCategory === value.subCategory
          )
      )
      let allMarkers = [...this.markers, ...res]
      let checkIfMarkExist = allMarkers.filter(
        (value, index, array) =>
          index ===
          array.findIndex(
            (t) =>
              t.category === value.category &&
              t.subCategory === value.subCategory
          )
      )
      this.newMarker = checkIfMarkExist.map(
        ({ id, type, category, subCategory, icon, color }) => ({
          id: `IM${id.slice(2)}`,
          type: type,
          category: category,
          subCategory: subCategory ? subCategory : '',
          icon: icon,
          color: color,
        })
      )
      // CREATE THE GEOJSON
      await categories.forEach((eltCategory, i) => {
        // pour chaque category, je lui crée un nouveau tableau
        this.objetData[eltCategory] = new Array()
        JsonFromCsv.forEach((index) => {
          // j'envoie le geojson dans le tableau correspondant
          if (index.category === eltCategory) {
            createGeoJsons(index, this.objetData[eltCategory])
          }
        })
      })
    },

    validImport() {
      if (this.$refs.form.validate()) {
        try {
          let dataStore = {
            markers: this.newMarker,
            GeoJsonDatas: this.objetData,
            merge: this.checkboxMerge,
          }
          this.$store.dispatch('appLoad', dataStore)
          this.refreshMap()
        } catch (error) {
          console.log(error)
        }
      }
    },
  },
}
</script>
