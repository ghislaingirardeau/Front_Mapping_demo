<template>
  <v-row>
    <createMarker :markers="markers" :showModal="showModal" @send-marker="modalMarkerResponse" />

    <v-col cols="12" class="text-center">
      <h1 class="mb-2">My Markers</h1>
      <p v-if="DBmessage">{{ DBmessage }}</p>
      <v-btn @click="showBtnDBExist ? deleteDB() : activateIndexedDB()">{{
        showBtnDBExist ? 'Delete database' : 'Create database'
      }}</v-btn>

      <v-btn @click="showModal = true">Add marker</v-btn>
    </v-col>

    <tableMarkers :markers="markers" />
  </v-row>
</template>

<script>
import createMarker from '@/components/leaflet/createMarker.vue'
import tableMarkers from '@/components/leaflet/tableMarkers.vue'
import { createIndexedDB, deleteIndexedDB } from '@/static/functions/indexedDb'
import { mapState } from 'vuex'

export default {
  layout: 'datasLayout',
  data() {
    return {
      showModal: false,
      showBtnDBExist: false,
      DBmessage: undefined,
    }
  },
  components: {
    tableMarkers,
    createMarker
  },
  computed: {
    ...mapState(['markers'])
  },
  methods: {
    modalMarkerResponse(payload) {
      this.showModal = payload.message
    },
    async activateIndexedDB() {
      let response = await createIndexedDB()
      console.log(response)
      if (response) {
        this.showBtnDBExist = true
        this.DBmessage = response.message
      } else {
        this.DBmessage = 'an error is occured'
      }
    },
    async deleteDB() {
      let confirm = window.confirm(
        'Are you sure you want to delete all the markers ?'
      )
      if (confirm) {
        let response = await deleteIndexedDB()
        console.log(response)
        if (response) {
          this.markers = []
          this.showBtnDBExist = false
          this.DBmessage = response.message
        } else {
          this.DBmessage = 'an error is occured'
        }
      }
    },
  },
  mounted() {
    // check if the database exist
    const checkDB = async () => {
      const dbName = 'Map_Database'
      const isExisting = (await window.indexedDB.databases())
        .map((db) => db.name)
        .includes(dbName)
      if (isExisting) {
        this.showBtnDBExist = true
        this.$store.dispatch('loadMarkers')
      } else {
        this.showBtnDBExist = false
      }
    }
    checkDB()
  },
}
</script>

<style lang="scss" scoped>

</style>