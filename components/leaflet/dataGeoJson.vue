<template>
  <v-col cols="12">
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <v-select
        v-model="addGeoJson.properties.category"
        :items="GeoType"
        :rules="[v => !!v || 'Item is required']"
        label="Category"
        required
      ></v-select>

      <v-select
        v-if="addGeoJson.properties.category === 'house'"
        v-model="addGeoJson.properties.subCategory"
        :items="subCategoryHouse"
        :rules="[v => !!v || 'Item is required']"
        label="Sub category"
        required
      ></v-select>

      <v-select
        v-if="addGeoJson.properties.category === 'well'"
        v-model="addGeoJson.properties.subCategory"
        :items="subCategoryWell"
        :rules="[v => !!v || 'Item is required']"
        label="Sub category"
        required
      ></v-select>

      <v-text-field
        v-model="addGeoJson.properties.name"
        :counter="10"
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
        color="error"
        class="mr-4"
        @click="reset"
      >
        Reset
      </v-btn>

      <v-btn
        color="error"
        class="mr-4"
        @click="cancel"
      >
        Cancel
      </v-btn>
    </v-form>
  </v-col>
</template>

<script>
  export default {
    data: () => ({
      valid: true,
      latitude: "13'44.4745",
      longitude: "106'58.6615",
      addGeoJson: {
          "type": "Feature",
          "properties": {
              "name": "house id",
              "amount": 9000,
              "popupContent": "test",
              "category": "",
              "subCategory" : '',
          },
          "geometry": {
              "type": "",
              "coordinates": []
          }
      },
      subCategoryHouse: ['not interview', 'interview', 'indebted', 'lost land'],
      subCategoryWell: ['private', 'public'],
      name: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be less than 10 characters',
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
      GeoType() {
        if(this.coordinates.length > 1) {
          return [
            'rice',
            'cashew',
            'route'
          ]
        } else {
          return [
            'house',
            'bath',
            'chief House',
            'grave',
            'worship',
            'communal',
            'homestay',
            'well'
          ]
        }
      },
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
              if(this.addGeoJson.properties.category === 'route'){
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
      reset () {
        this.$refs.form.reset()
      },
      cancel() {
        this.$emit('send-data', { 
            show: false,
            resetCoordinates: true
        })
      }
    },
  }
</script>