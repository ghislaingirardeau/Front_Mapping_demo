<template>
  <div>
    <p>Import a file will remove all the data actually displayed !</p>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-file-input
        label="Select CSV file"
        id="csv"
        @click="readFileCsv"
        accept=".csv"
      ></v-file-input>
      <v-file-input
        label="Select GPX or KML file"
        id="geojson"
        accept=".gpx, .kml"
        @click="readGeoJson"
      ></v-file-input>
      <!-- <v-file-input
        label="Select GPX or KML file"
        id="geojson"
        accept=".gpx, .kml"
        @click="fileToConvert"
      ></v-file-input> -->
    </v-form>
    <v-spacer></v-spacer>
    <v-btn color="success" class="mr-4" @click="validImport"> Import </v-btn>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    valid: true,
    objetData: {},
    newMarker: [],
    error: false,
  }),
  computed: {
    ...mapState(['markers']),

    fileNameRules() {
      return [
        (v) => !!v || 'A file is required',
        (v) => this.error || 'The CSV format is not correct',
      ]
    },
  },
  methods: {
    readGeoJson() {
      try {
        this.objetData = {}
        this.newMarker = []
        const convertForApp = (newGeoJson) => {
          let convert
          newGeoJson.features.forEach((element, i) => {
            convert = {
              type: 'Feature',
              properties: {
                id: `ID${i}${Date.now()}`,
                name: element.properties.name,
                time: element.properties.time,
                popupContent: ' ',
                category: element.properties.name,
                subCategory: '',
              },
              geometry: element.geometry,
              icon: {
                type: element.geometry.type === 'Point' ? 'map-marker' : '',
                color: '',
              },
            }
            if (this.objetData[element.properties.name]) {
              convert.icon.color =
                this.objetData[element.properties.name][0].icon.color
              this.objetData[element.properties.name].push(convert)
            } else {
              let randomColor = Math.floor(Math.random() * 16777215).toString(
                16
              )
              convert.icon.color = `#${randomColor}`
              this.newMarker.push({
                type: element.geometry.type === 'Point' ? 'Point' : 'MultiLineString',
                category: element.properties.name,
                subCategory: '',
                icon: element.geometry.type === 'Point' ? 'map-marker' : '',
                color: convert.icon.color,
              })
              this.objetData[element.properties.name] = new Array()
              this.objetData[element.properties.name].push(convert)
            }
          })
          console.log(this.objetData, this.newMarker)
        }
        const myGPX = document.querySelector('#geojson')
        myGPX.addEventListener('change', (e) => {
          const gpxFile = e.target.files
          const mime = e.target.files[0].name.slice(-3)
          if (!gpxFile.length) {
            return false
          }
          const reader = new FileReader()
          reader.onload = (e) => {
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(e.target.result, 'text/xml')
            let newGeoJson
            switch (mime) {
              case 'gpx':
                newGeoJson = this.$convertToGeoJson.gpx(xmlDoc)
                break
              case 'kml':
                newGeoJson = this.$convertToGeoJson.kml(xmlDoc)
                break
            }
            console.log(newGeoJson) // GPX ou KML function
            convertForApp(newGeoJson)
          }
          reader.readAsText(gpxFile[0])
        })
        this.error = true
      } catch {}
    },
    async readFileCsv() {
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
              popupContent: element.popupContent,
              category: element.category,
              subCategory: element.subCategory,
            },
            geometry: {
              type: element.type,
              coordinates: coordinates,
            },
            icon: {
              type: element.icon,
              color: element.color,
            },
          }
          layer.push(newGeoJson)
          this.error = true
        } catch (error) {
          console.log('wrong files', error)
          this.error = false
        }
      }
      try {
        // GET THE FILE IMPORTED AND APPLY THE FUNCTION
        var fileInput = document.getElementById('csv')

        let readFile = () => {
          var reader = new FileReader()
          reader.onload = async () => {
            // get the csv data here
            let csv = reader.result
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
            let categories = [
              ...new Set(JsonFromCsv.map((elt) => elt.category)),
            ]
            // CREATE THE MARKERS
            this.newMarker = []
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
            this.newMarker = res.map(
              ({ type, category, subCategory, icon, color }) => ({
                type: type,
                category: category,
                subCategory: subCategory ? subCategory : '',
                icon: icon,
                color: color,
              })
            )
            this.objetData = {}
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
            console.log(this.objetData)
          }
          reader.readAsBinaryString(fileInput.files[0])
        }

        fileInput.addEventListener('change', readFile)
        this.error = true
      } catch (error) {
        console.log(error, 'file is not at the right format')
        this.error = false
      }
    },
    async validImport() {
      if (this.$refs.form.validate()) {
        try {
          let dataStore = {
            markers: this.newMarker,
            GeoJsonDatas: this.objetData,
          }
          this.$store.dispatch('appLoad', dataStore)
          this.$router.push('/myData')
        } catch (error) {
          console.log(error)
        }
      }
    },
  },
}
</script>
