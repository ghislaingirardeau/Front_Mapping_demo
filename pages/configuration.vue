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
@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

.animationShake {
  /* transform: scale(1.1);
  transition: transform 400ms; */
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
.divider__block {
  border-top: 2px solid white;
}
.chips__area {
  padding: 5px;
}
</style>