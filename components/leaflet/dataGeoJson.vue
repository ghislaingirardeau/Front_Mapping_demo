<template>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
    {{addGeoJson}}  {{colorsPick}}
      <v-select
        v-model="addGeoJson.properties.category"
        :items="category"
        :rules="[v => !!v || 'Item is required']"
        label="Category"
        required
        @change="addGeoJson.properties.subCategory = ''"
      ></v-select>

      <v-select
        v-if="subCategory && subCategory.length > 0"
        v-model="addGeoJson.properties.subCategory"
        :items="subCategory"
        :rules="[v => !!v || 'Item is required']"
        label="Sub category"
        required
      ></v-select>

      <v-text-field
        v-model="addGeoJson.properties.name"
        :counter="20"
        :rules="nameRules"
        label="Name"
        required
      ></v-text-field>

      <v-text-field
        v-model="addGeoJson.properties.popupContent"
        :counter="20"
        :rules="popupContentRules"
        label="Content"
        required
      ></v-text-field>

      <v-text-field 
          v-if="coordinates.length === 0"
          v-model="latitude"
          label="latitude"
          required
      ></v-text-field>

      <v-text-field 
          v-if="coordinates.length === 0"
          v-model="longitude"
          label="longitude"
          required
      ></v-text-field>

      <v-btn
        :disabled="!valid"
        color="success"
        class="mr-4"
        @click="validate"
      >
        Validate
      </v-btn>

      <v-btn
        color="secondary"
        class="mr-4"
        @click="manualCoordinates"
      >
        Manual
      </v-btn>

      <v-btn
        color="error"
        class="mr-4 mt-3 mt-sm-0"
        @click="cancel"
      >
        Cancel
      </v-btn>
    </v-form>
</template>

<script>
  export default {
    data: () => ({
      valid: true,
      itemsCategory: {
        point: [],
        multiLineString: [],
        polygon: []
      },
      itemsSubcategory: [],
      itemsIcon: {
        type: [],
        color: []
      },
      latitude: "13'44.4745",
      longitude: "106'58.6615",
      addGeoJson: {
          "type": "Feature",
          "properties": {
              "name": "Clean water",
              "popupContent": " ",
              "category": "",
              "subCategory" : '',
          },
          "geometry": {
              "type": "",
              "coordinates": []
          },
          "icon": {
              "type": "",
              "color": "red" 
          }
      },
      name: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 20) || 'Name must be less than 20 characters',
      ],
      popupContentRules: [
        v => !!v || 'Popup content is required',
        v => (v && v.length <= 20) || 'Name must be less than 20 characters',
      ],
    }),

    props: {
        geoJsonHouse: Array,
        geoJsonVillage: Array,
        coordinates: Array
    },
    computed: {
      category() {
        if (this.coordinates.length === 1 || this.coordinates.length === 0) {
          return this.itemsCategory.point
        } else {
          return this.itemsCategory.polygon.concat(this.itemsCategory.multiLineString)
        }
      },
      subCategory() {
        let index = this.itemsCategory.point.indexOf(this.addGeoJson.properties.category)
        this.addGeoJson.icon.type = this.itemsIcon.type[index]  // charge directement dans json addgeojson
        if(index === -1) {
          return undefined
        } else {
          return this.itemsSubcategory[index]
        }
      },
      colorsPick() {
        // recup de la couleur en fonction de l'index de la categorie puis de la soucategorie selectionné
        let indexCategory = this.itemsCategory.point.indexOf(this.addGeoJson.properties.category)
        if(this.addGeoJson.properties.subCategory) {
          let colorsAttribut = this.itemsIcon.color[indexCategory]
          let indexSubCategory = this.subCategory.indexOf(this.addGeoJson.properties.subCategory)
          this.addGeoJson.icon.color = colorsAttribut[indexSubCategory] // charge directement dans json addgeojson
          return colorsAttribut[indexSubCategory]
        } else { 
          this.addGeoJson.icon.color = this.itemsIcon.color[indexCategory] // charge directement dans json addgeojson
          return this.itemsIcon.color[indexCategory]
        }
      }
    },
    methods: {
      validate () {
        if(this.$refs.form.validate()) {
          
            let getCoordinates = []
            let geoType 

            if(this.coordinates.length === 1) { 
              // si je n'ai qu'une coordonnée alors je ne veux enregistrer qu'un seul point
              getCoordinates = this.coordinates[0]
              geoType = 'Point'
            } else if(this.coordinates.length === 0) {
              // je saisis manuellement les coordonnées
              // convertir les coordonnées en degres/minute en lng/lat
              function convertCoordinate(data) { 
                let indexLng = data.indexOf("'")
                let degres = data.slice(0, indexLng)
                let minute = (data.slice((indexLng + 1))) / 60
                return parseFloat(degres) + parseFloat(minute)
              }
              getCoordinates.push(convertCoordinate(this.longitude))
              getCoordinates.push(convertCoordinate(this.latitude))
              geoType = 'Point'
            } else {
              // sinon j'enregistre un polygon
              getCoordinates.push(this.coordinates)
              if(this.addGeoJson.properties.category === 'trace'){
                geoType = 'MultiLineString'
              } else {
                geoType = 'Polygon'
              }
            }
            
            this.addGeoJson.geometry.coordinates = getCoordinates
            this.addGeoJson.geometry.type = geoType

            let group
            switch (this.addGeoJson.properties.category) {
              case "house":
                  this.geoJsonHouse.push(this.addGeoJson)
                  group = 'house'
                break;
            
              default:
                this.geoJsonVillage.push(this.addGeoJson)
                group = 'village'
                break;
            }
            
            this.$emit('send-data', {
                show: false,
                resetCoordinates: true,
                layerGroup: group
            })
        }
      },
      manualCoordinates () {
        this.coordinates = []
      },
      cancel() {
        this.$emit('send-data', { 
            show: false,
            resetCoordinates: true
        })
      }
    },
    mounted () {
                const requestIndexedDB = window.indexedDB.open("Map_Database", 1);
                requestIndexedDB.onerror = event => {
                    console.log(event);
                };

                // la requete
                requestIndexedDB.onsuccess = event => {
                    let db = event.target.result;

                    let transaction = db.transaction("markers", "readwrite")
                    let store = transaction.objectStore('markers') // store = table in sql
                    let idQuery = store.openCursor() // recherche sur l'id
                    idQuery.onsuccess = event => {
                        var cursor = event.target.result;
                        if(cursor){
                          switch (cursor.value.type) {
                            case "Point":
                              this.itemsCategory.point.push(cursor.value.category)
                              this.itemsSubcategory.push(cursor.value.subCategory)
                              this.itemsIcon.type.push(cursor.value.icon)
                              this.itemsIcon.color.push(cursor.value.color)
                              break;
                            case "MultiLineString":
                              this.itemsCategory.multiLineString.push(cursor.value.category)
                              this.itemsSubcategory.push(cursor.value.subCategory)
                              break;
                            case "Polygon":
                              this.itemsCategory.polygon.push(cursor.value.category)
                              this.itemsSubcategory.push(cursor.value.subCategory)
                              break;
                          }
                          cursor.continue();
                        }
                    }

                   // close db at the end of transaction
                    transaction.oncomplete = () => {
                        db.close()
                    }
                };
    },
  }
</script>