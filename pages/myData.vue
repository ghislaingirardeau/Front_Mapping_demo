<template>
  <v-row>
    <theNavBar/>
    <v-col cols="11" class="text-center mt-3">
      <h1>
        {{ userAuth ? `My datas : ${userAuth.displayName}` : 'My datas' }}
      </h1>
    </v-col>
    <v-col cols="11" class="text-center">
      <p :class="{ active: isActive }">
        You have collected {{ GeoJsonTable ? GeoJsonTable.length : '' }} datas
      </p>
      <p v-if="!userAuth">Remember to login or register to save your data !</p>
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
  data() {
    return {
      isActive: false,
      objetData: {},
    }
  },
  computed: {
    ...mapState(['markers', 'GeoJsonDatas', 'userAuth']),
    ...mapGetters(['GeoJsonTable']),
    // BUG ON LOAD IMPORT, BECAUSE THE STATE KEY IS NOT CREATE YET
  },
  methods: {
    linkMap() {
      this.$router.push('/')
    },
  },
  mounted() {
    this.$store.dispatch('appLoad')
  },
}
</script>

<style lang="scss">
</style>
