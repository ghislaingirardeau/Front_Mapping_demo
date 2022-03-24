<template>
  <v-row>
    <v-col cols="12">
      <h1>My datas</h1>
    </v-col>
    <v-col cols="12">
      <p :class="{ active: isActive }">
        You have collected {{ allDatas ? allDatas.length : '' }} datas
      </p>
    </v-col>
    <tableGeoJson
      v-if="allDatas"
      :allDatas="allDatas"
      @data-update="tableUpdate"
    />
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
      allDatas: [],
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
    tableUpdate(playload) {
      if(playload.action) {
        this.allDatas.splice(playload.index, 1)
      } else {
        // get the update and refresh alldatas
        let {name, index, popupContent} = playload.itemToSave
        this.allDatas[index].properties.name = name
        this.allDatas[index].properties.popupContent = popupContent
      }
      // UPDATE LOCALSTORAGE AT THE END
    }
  },
  mounted() {
    try {
      /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
      let geoFromLocal = JSON.parse(localStorage.getItem('APIGeoMap'))
      console.log(geoFromLocal)
      for (let property in geoFromLocal) {
        this.allDatas.push(...geoFromLocal[property])
      }
    } catch (error) {}
  },
}
</script>

<style lang="scss">
</style>
