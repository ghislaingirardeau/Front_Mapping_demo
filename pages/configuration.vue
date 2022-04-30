<template>
  <v-row>
    <createMarker
      :markers="markers"
      :showModal="showModal"
      @send-marker="modalMarkerResponse"
    />

    <v-col cols="12" class="text-center">
      <h1 class="mb-2">My Markers</h1> {{markers}}
      <p v-if="DBmessage">{{ DBmessage }}</p>
      <v-btn @click="deleteDB">Delete All Markers</v-btn>

      <v-btn @click="showModal = true">Add marker</v-btn>
    </v-col>

    <tableMarkers :markers="markers" :key="markers.length" />
  </v-row>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  layout: 'datasLayout',
  data() {
    return {
      showModal: false,
      showBtnDBExist: false,
      DBmessage: undefined,
    }
  },
  computed: {
    ...mapState(['markers']),
  },
  methods: {
    ...mapMutations(['RESET_MARKERS']),
    modalMarkerResponse(payload) {
      this.showModal = payload.message
    },
    deleteDB() {
      this.resetDB()
    },
  },
  mounted() {
    this.$store.dispatch('loadMarkers')
  },
}
</script>

<style lang="scss" scoped>
</style>