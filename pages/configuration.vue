<template>
  <v-row justify="center">
    <theNavBar/>

    <v-col cols="12" class="mb-2 text-center">
      <h1 class="mb-2">My Markers</h1>
      <p v-if="DBmessage">{{ DBmessage }}</p>

      <v-btn color="secondary" outlined @click="showModal = true">Add marker</v-btn>
    </v-col>
    <createMarker
      :markers="markers"
      :showModal="showModal"
      @send-marker="modalMarkerResponse"
    />

    <tableMarkers :key="markers.length" />
  </v-row>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  transition: 'home',
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
    modalMarkerResponse(payload) {
      this.showModal = payload.message
    },
  },
}
</script>

<style lang="scss" scoped>
</style>