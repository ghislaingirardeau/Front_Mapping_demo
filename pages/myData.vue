<template>
  <v-row class="dataTable">
    <h1>My datas</h1>
    <p :class="{ active: isActive }">
      You have collected {{ geoJsonFeature ? geoJsonFeature.length : '' }} datas
    </p>
    <nuxt-link to="/"></nuxt-link>
    <tableGeoJson v-if="geoJsonFeature" :geoJsonFeature="geoJsonFeature" />
    <p v-else>No data save yet</p>
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
.dataTable {
  padding: 12px;
  position: relative;
}
</style>
