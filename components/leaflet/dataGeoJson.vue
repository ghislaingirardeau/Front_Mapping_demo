<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-select
      v-if="coordinates.length > 1"
      v-model="typeSelection"
      :items="geometryTypes"
      :rules="[(v) => !!v || 'Item is required']"
      label="Area type"
      required
    ></v-select>

    <v-select
      v-model="addGeoJson.properties.category"
      :items="category"
      :rules="[(v) => !!v || 'Item is required']"
      label="Category"
      required
      @change="addGeoJson.properties.subCategory = ''"
    ></v-select>

    <v-select
      v-if="subCategory && subCategory.length > 0"
      v-model="addGeoJson.properties.subCategory"
      :items="subCategory"
      :rules="[(v) => !!v || 'Item is required']"
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

    <v-btn :disabled="!valid" color="primary" class="mr-4" @click="validate">
      Validate
    </v-btn>

    <v-btn color="secondary" class="mr-4" @click="manualCoordinates">
      Manual
    </v-btn>

    <!-- <v-btn color="secondary" class="mr-4" @click="addCoordinate">
      Add
    </v-btn>
 -->
    <v-btn color="error" class="mr-4 mt-3 mt-sm-0" @click="cancel">
      Cancel
    </v-btn>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    valid: true,
    geometryTypes: ['Area', 'Line'],
    latitude: "13'44.4745",
    longitude: "106'58.6615",
    typeSelection: '',
    addGeoJson: {
      type: 'Feature',
      properties: {
        id: `ID${Date.now()}`,
        name: 'plus 01',
        popupContent: ' ',
        category: '',
        subCategory: '',
      },
      geometry: {
        type: '',
        coordinates: [],
      },
      icon: {
        type: '',
        color: '',
      },
    },
    name: '',
    nameRules: [
      (v) => !!v || 'Name is required',
      (v) => (v && v.length <= 20) || 'Name must be less than 20 characters',
    ],
    popupContentRules: [
      (v) => !!v || 'Popup content is required',
      (v) => (v && v.length <= 20) || 'Name must be less than 20 characters',
    ],
  }),

  props: {
    coordinates: Array,
  },
  computed: {
    ...mapState(['markers']),
    // return Array with category from DB depending on type GeoJson
    category() {
      const markerCategories = (geoJsonType) => {
        let markerCategories = new Set(
          this.markers
            .filter((elt) => elt.type === geoJsonType)
            .map((i) => i.category)
        )
        return [...markerCategories]
      }
      if (this.coordinates.length === 1 || this.coordinates.length === 0) {
        this.addGeoJson.geometry.type = 'Point'
        this.typeSelection = 'Point'
        return markerCategories(this.addGeoJson.geometry.type)
      } else {
        switch (this.typeSelection) {
          case 'Area':
            this.addGeoJson.geometry.type = 'Polygon'
            return markerCategories(this.addGeoJson.geometry.type)
            break
          case 'Line':
            this.addGeoJson.geometry.type = 'MultiLineString'
            return markerCategories(this.addGeoJson.geometry.type)
            break
        }
      }
    },
    // return Array of subCategory depending on the category selected
    subCategory() {
      let arraySub = this.markers.filter(
        (elt) => elt.category === this.addGeoJson.properties.category
      )
      arraySub.length > 0 ? (this.addGeoJson.icon.type = arraySub[0].icon) : '' // apply icon type here, no matter whoch sub cat selected
      if (arraySub.length > 1) {
        return arraySub.map((i) => i.subCategory)
      } else {
        return []
      }
    },
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        const colorGeoJson = () => {
          let category = this.markers.filter(
            (elt) => elt.category === this.addGeoJson.properties.category
          )
          if (category.length > 1) {
            let subCategory = category.find(
              (elt) =>
                elt.subCategory === this.addGeoJson.properties.subCategory
            )
            this.addGeoJson.icon.color = subCategory.color
          } else {
            this.addGeoJson.icon.color = category[0].color // if no sub categories
          }
        }
        const convertCoordinate = (data) => {
          let indexLng = data.indexOf("'")
          let degres = data.slice(0, indexLng)
          let minute = data.slice(indexLng + 1) / 60
          return parseFloat(degres) + parseFloat(minute)
        }
        colorGeoJson()

        let getCoordinates = []
        if (this.coordinates.length === 1) {
          // si je n'ai qu'une coordonnée alors je ne veux enregistrer qu'un seul point
          getCoordinates = this.coordinates[0]
        } else if (this.coordinates.length === 0) {
          // je saisis manuellement les coordonnées
          // convertir les coordonnées en degres/minute en lng/lat
          getCoordinates.push(convertCoordinate(this.longitude))
          getCoordinates.push(convertCoordinate(this.latitude))
        } else {
          // sinon je renvoie l'ensemble des coordonnées saisies
          getCoordinates.push(this.coordinates)
        }

        this.addGeoJson.geometry.coordinates = getCoordinates
        this.addGeoJson.properties.time = new Date(Date.now()).toISOString().slice(0, -5)

        this.$emit('send-data', {
          show: false,
          resetCoordinates: true,
          createGeoJon: true,
          newGeoJson: this.addGeoJson,
        })
      }
    },
    manualCoordinates() {
      this.coordinates = []
    },
    cancel() {
      this.$emit('send-data', {
        show: false,
        resetCoordinates: true,
      })
    },
  },
}
</script>