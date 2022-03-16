<template>
  <v-row>
    <v-col cols="12">
      <h1>My datas</h1>
    </v-col>
    <v-col cols="12">
      <p :class="{ active: isActive }">
        You have collected {{ geoJsonFeature ? geoJsonFeature.length : '' }} datas
      </p>
    </v-col>
    <tableGeoJson v-if="geoJsonFeature" :geoJsonFeature="geoJsonFeature" />
    <v-col v-else cols="12">
      <p>No data save yet</p>
    </v-col>

  </v-row>
</template>

<script>
import tableGeoJson from '@/components/leaflet/tableGeoJson.vue'

export default {
  layout: 'datasLayout',
  data() {
    return {
      geoJsonFeature: undefined,
      isActive: false,
    }
  },
  components: {
    tableGeoJson,
  },
  methods: {
    linkMap() {
      this.$router.push('/')
    },
  },
  mounted() {
    try {
      /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
      let geoFromLocal = JSON.parse(localStorage.getItem('APIGeoMap'))
      this.geoJsonFeature = [...geoFromLocal[0], ...geoFromLocal[1]]
    } catch (error) {}
  },
}
</script>

<style lang="scss">
</style>
