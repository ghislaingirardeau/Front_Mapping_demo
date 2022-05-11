<template>
  <v-row>
    <createMarker
      :markers="markers"
      :showModal="showModal"
      @send-marker="modalMarkerResponse"
    />

    <v-col cols="12" class="text-center">
      <h1 class="mb-2">My Markers</h1>
      <p v-if="DBmessage">{{ DBmessage }}</p>

      <v-btn @click="showModal = true">Add marker</v-btn>
    </v-col>

    <tableMarkers :markers="markers" :key="markers.length" />
  </v-row>
</template>

<script>
import { mapState, mapActions } from 'vuex'

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
    ...mapActions(['appLoad']),
    modalMarkerResponse(payload) {
      this.showModal = payload.message
    },
  },
  mounted() {
    this.appLoad()
  },
}
</script>

<style lang="scss" scoped>
</style>