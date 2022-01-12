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
        label="Item"
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
        v-model="addGeoJson.properties.amenity"
        :counter="10"
        :rules="amenityRules"
        label="Amenity"
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

      <!-- <slot name="manualCoordinates"></slot> -->

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
{{addGeoJson}}
    </v-form>
  </v-col>
</template>

<script>
  export default {
    data: () => ({
      valid: true,
      latitude: undefined,
      longitude: undefined,
      addGeoJson: {
          "type": "Feature",
          "properties": {
              "name": "arbre",
              "amenity": "test",
              "popupContent": "test",
              "category": ""
          },
          "geometry": {
              "type": "",
              "coordinates": []
          }
      },
      name: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be less than 10 characters',
      ],
      amenityRules: [
        v => !!v || 'Anemity is required',
        v => (v && v.length <= 10) || 'Name must be less than 10 characters',
      ],
      popupContentRules: [
        v => !!v || 'Popup content is required',
        v => (v && v.length <= 20) || 'Name must be less than 20 characters',
      ],
    }),

    props: {
        geoJsonFeature: Array,
        coordinates: Array
    },
    computed: {
      GeoType() {
        if(this.coordinates.length > 1) {
          return [
            'rice',
            'cashew'
          ]
        } else {
          return [
            'not interview',
            'interview',
            'indebted',
            'land lost'
          ]
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
              getCoordinates.push(parseFloat(this.longitude))
              getCoordinates.push(parseFloat(this.latitude))
              geoType = 'Point'
            } else {
              // sinon j'enregistre un polygon
              getCoordinates.push(this.coordinates)
              geoType = 'Polygon'
            }
            
            this.addGeoJson.geometry.coordinates = getCoordinates
            this.addGeoJson.geometry.type = geoType
            this.geoJsonFeature.push(this.addGeoJson)
            this.$emit('send-data', {
                show: false,
                resetCoordinates: true
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