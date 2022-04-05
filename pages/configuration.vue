<template>
  <v-row>
    <createMarker :markers="markers" :showCursorDB="showCursorDB" :showModal="showModal" @send-marker="modalMarkerResponse" />
    <v-col cols="12" class="text-center">
      <h1>My Markers</h1>
      <p v-if="DBmessage">{{ DBmessage }}</p>
      <v-btn @click="showBtnDBExist ? deleteDB() : activateIndexedDB()">{{
        showBtnDBExist ? 'Delete database' : 'Create database'
      }}</v-btn>

      <v-btn @click="showModal = true">Add marker</v-btn>
    </v-col>

    <tableMarkers :markers="markers" :showCursorDB="showCursorDB" />
  </v-row>
</template>

<script>
import createMarker from '@/components/leaflet/createMarker.vue'
import tableMarkers from '@/components/leaflet/tableMarkers.vue'
import { createIndexedDB, deleteIndexedDB } from '@/static/functions/indexedDb'

export default {
  layout: 'datasLayout',
  data() {
    return {
      showModal: false,
      markers: [],
      showBtnDBExist: false,
      DBmessage: undefined,
    }
  },
  components: {
    tableMarkers,
    createMarker
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
    showCursorDB() {
      this.markers = [] // reinitialise le tableau sinon doublon on show
      const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
      requestIndexedDB.onerror = (event) => {
        console.log(event)
      }

      // la requete
      requestIndexedDB.onsuccess = (event) => {
        let db = event.target.result

        let transaction = db.transaction('markers', 'readwrite')
        let store = transaction.objectStore('markers') // store = table in sql
        let idQuery = store.openCursor() // recherche sur l'id
        idQuery.onsuccess = (event) => {
          var cursor = event.target.result

          if (cursor) {
            // if a get an array of sub category, i create a new object to send in this.markers array
            if (cursor.value.subCategory.length > 0) {
              for (
                let index = 0;
                index < cursor.value.subCategory.length;
                index++
              ) {
                let multiMarker = {
                  type: cursor.value.type,
                  category: cursor.value.category,
                  subCategory: [],
                  icon: cursor.value.icon,
                  color: [],
                }
                multiMarker.subCategory.push(cursor.value.subCategory[index])
                multiMarker.color.push(cursor.value.color[index])
                this.markers.push(multiMarker)
              }
            } else {
              this.markers.push(cursor.value)
            }
            cursor.continue()
          } else {
            console.log('No more entries!')
          }
        }

        // close db at the end of transaction
        transaction.oncomplete = () => {
          db.close()
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
        this.showCursorDB() // faire apparaitre les datas dans le tableau
        this.DBmessage = 'the db is existing'
      } else {
        this.showBtnDBExist = false
        this.DBmessage = 'the db not exist'
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