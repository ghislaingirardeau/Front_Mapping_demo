<template>
  <v-row>
    <v-col cols="12" class="text-center">
      <h1>My datas</h1>
    </v-col>
    <v-col cols="12" class="text-center">
      <p :class="{ active: isActive }">
        You have collected {{ GeoJsonTable ? GeoJsonTable.length : '' }} datas
      </p>
    </v-col>
    <tableGeoJson v-if="GeoJsonTable" :allDatas="GeoJsonTable" />
    <v-col v-else cols="12">
      <p>No data save yet</p>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  layout: 'datasLayout',
  data() {
    return {
      isActive: false,
      objetData: {},
    }
  },
  computed: {
    ...mapState(['markers', 'GeoJsonDatas']),
    /* ...mapGetters(['GeoJsonTable']), */
    GeoJsonTable() {
      let values = Object.values(state.GeoJsonDatas).flat()
      let array = values.map(({ properties }) => properties)
      return array
    },
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
