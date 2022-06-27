<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-select
      v-if="coordinates.length > 1"
      v-model="typeSelection"
      :items="geometryTypes"
      :rules="[(v) => !!v || 'Select a category']"
      label="Area type"
      required
    ></v-select>

    <v-select
      v-model="addGeoJson.properties.category"
      :items="category"
      :rules="[(v) => !!v || 'No marker created for this category']"
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

    <div v-if="coordinates.length === 0">
      <span>The accuracy is too low, add the coordinates manualy ?</span>
      <v-btn text color="secondary" class="mr-4" @click="manualCoordinates">
        Manual
      </v-btn>
    </div>

    <v-row v-if="manualActive" class="mt-sm-2" no-gutters align="center">
      <v-col cols="11" sm="2">
        <p>Latitude :</p>
      </v-col>

      <v-col cols="3" sm="3">
        <v-text-field
          outlined
          v-model="manualLatitude.deg"
          :rules="[(v) => (v < 91 && v > -91) || '-90 < latitude > 90']"
          label="Degrees"
        ></v-text-field>
      </v-col>
      <v-col cols="3" sm="3" class="mx-1">
        <v-text-field
          outlined
          v-model="manualLatitude.min"
          :rules="[(v) => (v < 60 && v >= 0) || 'wrong']"
          label="Minutes"
        ></v-text-field>
      </v-col>
      <v-col cols="4" sm="3">
        <v-text-field
          outlined
          v-model="manualLatitude.sec"
          :rules="[(v) => (v < 9999 && v > 0) || 'wrong']"
          label="Seconds"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row v-if="manualActive" no-gutters align="center">
      <v-col cols="11" sm="2">
        <p>Longitude :</p>
      </v-col>

      <v-col cols="3" sm="3">
        <v-text-field
          outlined
          v-model="manualLongitude.deg"
          :rules="[(v) => (v < 181 && v > -181) || '-181 < longitude > 181']"
          label="Degrees"
        ></v-text-field>
      </v-col>
      <v-col cols="3" sm="3" class="mx-1">
        <v-text-field
          outlined
          v-model="manualLongitude.min"
          :rules="[(v) => (v < 60 && v >= 0) || 'wrong']"
          label="Minutes"
        ></v-text-field>
      </v-col>
      <v-col cols="4" sm="3">
        <v-text-field
          outlined
          v-model="manualLongitude.sec"
          :rules="[(v) => (v < 9999 && v > 0) || 'wrong']"
          label="Seconds"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-btn
      :disabled="!valid"
      color="primary"
      class="mr-4"
      @click="validate"
      v-if="coordinates.length > 0 || manualActive"
    >
      Validate
    </v-btn>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'

const manualCoordRules = (data, limits, text) => {
  let index = data.indexOf("'")
  let deg = parseInt(data.slice(0, index))
  if (deg > -limits && deg < limits) {
    return [true]
  } else {
    return [`wrong ${text}, has to be in the format Deg'min.sec`]
  }
}

export default {
  data: () => ({
    valid: true,
    geometryTypes: ['Area', 'Line'],
    manualLatitude: {
      deg: 13,
      min: 44,
      sec: 4745,
    },
    manualLongitude: {
      deg: 106,
      min: 58,
      sec: 6615,
    },
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
    manualActive: false,
  }),

  props: {
    coordinates: Array,
  },
  computed: {
    ...mapState(['markers']),

    category() {
      // return Array with category from DB depending on type GeoJson
      const markerCategories = (geoJsonType) => {
        const markerCategories = new Set(
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
      const arraySubcategory = this.markers.filter(
        (elt) => elt.category === this.addGeoJson.properties.category
      )
      arraySubcategory.length > 0
        ? (this.addGeoJson.icon.type = arraySubcategory[0].icon)
        : '' // apply icon type here, no matter whoch sub cat selected

      if (arraySubcategory.length > 1)
        return arraySubcategory.map((i) => i.subCategory)
      return []
    },
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        const colorGeoJson = () => {
          const category = this.markers.filter(
            (elt) => elt.category === this.addGeoJson.properties.category
          )
          if (category.length > 1) {
            const subCategory = category.find(
              (elt) =>
                elt.subCategory === this.addGeoJson.properties.subCategory
            )
            this.addGeoJson.icon.color = subCategory.color
          } else {
            this.addGeoJson.icon.color = category[0].color // if no sub categories
          }
        }
        const convertCoordinate = (data) => {
          const calcTime = `${data.min}.${data.sec}`
          return parseFloat(data.deg) + parseFloat(calcTime / 60)
        }
        colorGeoJson()

        let getCoordinates = []
        if (this.coordinates.length === 1) {
          // si je n'ai qu'une coordonnée alors je ne veux enregistrer qu'un seul point
          getCoordinates = this.coordinates[0]
        } else if (this.coordinates.length === 0) {
          // je saisis manuellement les coordonnées
          // convertir les coordonnées en degres/minute en lng/lat
          getCoordinates.push(convertCoordinate(this.manualLongitude))
          getCoordinates.push(convertCoordinate(this.manualLatitude))
        } else {
          // sinon je renvoie l'ensemble des coordonnées saisies
          getCoordinates.push(this.coordinates)
        }

        this.addGeoJson.geometry.coordinates = getCoordinates
        this.addGeoJson.properties.time = new Date(Date.now())
          .toISOString()
          .slice(0, -5)

        this.$emit('send-data', {
          show: false,
          newGeoJson: this.addGeoJson,
        })
      }
    },
    manualCoordinates() {
      this.manualActive = !this.manualActive
    },
  },
}
</script>