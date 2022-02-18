<template>
  <div class="dataTable">
    <v-btn color="primary" class="backToMap" @click="linkMap">
      <v-icon>mdi-map-outline</v-icon>
    </v-btn>
    <h1>My data collected</h1>
    <h2 :class="{active : isActive}">Here you'll find all the datas details collected</h2>
    <nuxt-link to="/"></nuxt-link>   
    <tableGeoJson v-if="geoJsonFeature" :geoJsonFeature="geoJsonFeature" />
    <p v-else>No data save yet</p>
  </div>
</template>

<script>
import tableGeoJson from "@/components/leaflet/tableGeoJson.vue";

export default {
  data() {
    return {
      geoJsonFeature: undefined,
      isActive: false,
    };
  },
  components: {
    tableGeoJson,
  },
  methods: {
    linkMap() {
      this.$router.push("/")
    }
  },
  mounted() {
    try {
      /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
      let geoFromLocal = JSON.parse(localStorage.getItem("APIGeoMap"));
      this.geoJsonFeature = [...geoFromLocal[0], ...geoFromLocal[1]];
    } catch (error) {}
  },
};
</script>

<style lang="scss">
.dataTable{
  padding: 12px;
  position: relative;
}
.backToMap{
  position: absolute;
  top: 20px;
  right: 20px;
}
</style>
