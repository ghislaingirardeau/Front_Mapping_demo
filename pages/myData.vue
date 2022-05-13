<template>
  <v-row>
    <v-col cols="12" class="text-center">
      <h1>My datas</h1>
    </v-col>
    <v-col cols="12" class="text-center">
      <p :class="{ active: isActive }">
        You have collected {{ allDatas ? allDatas.length : '' }} datas
      </p>
    </v-col>
    <tableGeoJson
      v-if="allDatas"
      :allDatas="allDatas"
    />
    <v-col v-else cols="12">
      <p>No data save yet</p>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'

export default {
  layout: 'datasLayout',
  data() {
    return {
      isActive: false,
      objetData: {}
    }
  },
    computed: {
    ...mapState(['markers', 'GeoJsonDatas']),
    allDatas() {
      let properties = []
      for (let property in this.GeoJsonDatas) {
        properties.push(...JSON.parse(JSON.stringify(this.GeoJsonDatas[property]))) 
        // for a deep copy of GeoJsonDatas and avoid mutate error on update
      }
      return properties
    }
  },
  methods: {
    linkMap() {
      this.$router.push('/')
    },
  },
}
</script>

<style lang="scss">
</style>
