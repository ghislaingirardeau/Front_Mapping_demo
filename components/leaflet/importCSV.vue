<template>
  <div>
    <p>Import a file will remove all the data actually displayed !</p>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-file-input
        label="Selelct CSV file"
        id="csv"
        :rules="fileNameRules"
        @click="readFileTest"
        accept=".csv"
      ></v-file-input>
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
        (v) => !!v || "A file is required",
        (v) => this.error || "The CSV format is not correct",
      ]
    }
  },
  methods: {
    async readFileTest() {
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
              color: [element.color],
            },
          }
          layer.push(newGeoJson)
          this.error = true
        } catch (error) {
          console.log('wrong files', error);
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
          let countCategories = []
          // reinitialize datas marker & geojson => to prevent adding when change files
          this.newMarker = []
          this.objetData = {}

          await JsonFromCsv.forEach((element) => {
            // recupere le nombre de category differentes créées
            if (countCategories.indexOf(element.category) === -1) {
              countCategories.push(element.category)
              this.newMarker.push({
                type: element.type,
                category: element.category,
                subCategory: [],
                icon: element.icon,
                color: [],
              })
            }
          })

          await countCategories.forEach((element, i) => {
            // pour chaque category, je lui crée un nouveau tableau
            let name = element
            this.objetData[element] = new Array()
            JsonFromCsv.forEach((index) => {
              // j'envoie le geojson dans le tableau correspondant
              if (index.category === name) {
                createGeoJsons(index, this.objetData[element])
              }
              // enregistre la sous category et la couleur si category presente mais sous category n'existe pas
              if (
                this.newMarker[i].category === index.category &&
                this.newMarker[i].subCategory.indexOf(index.subCategory) === -1
              ) {
                this.newMarker[i].subCategory.push(index.subCategory)
                this.newMarker[i].color.push(index.color)
              }
            })
          })
        }
        reader.readAsBinaryString(fileInput.files[0])
      }

      fileInput.addEventListener('change', readFile)
      this.error = true
        
      } catch (error) {
        console.log(error, 'file is not at the right format');
        this.error = false
      }
    },
    async validImport() {
      if (this.$refs.form.validate()) {
        try {
        // reinitialise la base de donnée marker
          let result = await this.resetDB() // mixin
          if (result) {
            const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
            requestIndexedDB.onsuccess = (event) => {
              var db = event.target.result

              var transaction = db.transaction('markers', 'readwrite')
              const store = transaction.objectStore('markers')
              this.newMarker.forEach((element) => {
                store.add(element)
              })

              console.log('markers added to the store')
              transaction.oncomplete = () => {
                db.close()
              }
            }
            localStorage.setItem('APIGeoMap', JSON.stringify({GeoJsonDatas: this.objetData, markers: this.markers}))
            this.$router.push('/myData')
          }
        } catch (error) {
          console.log(error)
        }
      } 
    },
  },
}
</script>
