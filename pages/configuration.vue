<template>
  <v-row>
    <modalCustom :showModal="showModal" @send-modal="modalResponse">
      <template v-slot:title> Build your marker</template>
      <template v-slot:content>
        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step :complete="e1 > 1" step="1">
              Marker
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="e1 > 2" step="2"> Color </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="3"> Summary </v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-row align="center">
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="newIcon.type"
                    :items="typeSelection"
                    label="Type"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="newIcon.category"
                    label="category"
                    :rules="rulesCategory"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" v-if="newIcon.type === 'Point'">
                  <v-text-field
                    v-model="newIcon.icon"
                    label="Add the name of the icon ex: plus-circle"
                    hint="Only copy the name of the icon ex: help-circle-outline"
                    persistent-hint
                    prefix="mdi-"
                    required
                  >
                    <template v-slot:append>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-icon v-on="on" @click="linkToIcon">
                            mdi-help-circle-outline
                          </v-icon>
                        </template>
                        Click to get the name of all icons available
                      </v-tooltip>
                    </template>
                    <template v-slot:append-outer>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-icon v-on="on"> mdi-{{ newIcon.icon }} </v-icon>
                        </template>
                        Preview
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-btn color="primary" @click="checkStep1"> Continue </v-btn>
                </v-col>
              </v-row>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-row align="center" justify="space-around">
                <v-col cols="7">
                  <h4>Optionnal</h4>
                  <v-text-field
                    v-model="subCategorySelected"
                    :disabled="disableInputs"
                    label="Add subcategories here"
                  ></v-text-field>
                </v-col>
                <v-col cols="5" class="text-center">
                  <v-btn
                    outlined
                    :disabled="disableInputs"
                    @click="addToArrayMarker(true)"
                    >Add</v-btn
                  >
                </v-col>

                <v-col 
                  cols="2" 
                  v-for="(i, l) in swatches" 
                  :key="l" 
                >
                    <v-chip 
                    :color="i"
                    label
                    @click="colorSelected = i"
                  >
                  </v-chip>
                </v-col>

               <v-col cols="2" sm="3">
                  <!-- <v-btn
                    outlined
                    color="primary"
                    :class="{ animationShake: disableInputs }"
                    @click="addToArrayMarker(false)"
                    :disabled="disableColor"
                    class="my-4"
                    >
                    
                    </v-btn
                    
                  > -->
                  <v-icon
                    color="primary"
                    :class="{ animationShake: disableInputs }"
                    @click="addToArrayMarker(false)"
                    :disabled="disableColor"
                  >mdi-plus-circle</v-icon>
                </v-col>
                <v-col cols="3" sm="3" class="text-center">
                  <v-icon
                    v-if="newIcon.type === 'Point'"
                    :color="colorSelected"
                    size="36px"
                    >mdi-{{ newIcon.icon }}</v-icon
                  >
                  <v-chip v-else :color="colorSelected" label
                    >area
                  </v-chip>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    color="primary"
                    @click="e1 = 3"
                    v-if="newIcon.color.length > 0"
                    :disabled="disableInputs"
                  >
                    Continue
                  </v-btn>

                  <v-btn text @click="e1 = 1" :disabled="disableInputs">
                    back
                  </v-btn>
                </v-col>
              </v-row>
            </v-stepper-content>

            <v-stepper-content step="3">
              <!-- Fait apparaitre le résumé de la sélection -->
              <v-row v-if="newIcon.color.length > 0">
                <v-col cols="12">
                  <h4>My markers selected</h4>
                </v-col>
                <v-col cols="6" sm="4" v-for="(item, l) in newIcon.color" :key="l">
                  <span v-if="newIcon.type === 'Point'">{{
                    newIcon.subCategory[l]
                      ? newIcon.subCategory[l]
                      : newIcon.category
                  }}</span>
                  <v-icon
                    v-if="newIcon.type === 'Point'"
                    :color="newIcon.color[l]"
                    size="36px"
                    >mdi-{{ newIcon.icon }}</v-icon
                  >
                  <v-chip v-else :color="newIcon.color[l]" label x-large>{{
                    newIcon.subCategory[l]
                      ? newIcon.subCategory[l]
                      : 'my preview'
                  }}</v-chip>
                </v-col>
                <v-col cols="12">
                  <v-btn color="primary" @click="addNewMarker"
                    >Add the markers</v-btn
                  >
                  <v-btn color="primary" @click="resetMarker">Reset</v-btn>
                  <v-btn text @click="e1 = 2" :disabled="disableInputs">
                    back
                  </v-btn>
                </v-col>
              </v-row>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </template>
    </modalCustom>

    <v-col cols="12" class="text-center">
      <h1>My Markers</h1>
      <p v-if="DBmessage">{{ DBmessage }}</p>
      <v-btn @click="showBtnDBExist ? deleteDB() : activateIndexedDB()">{{
        showBtnDBExist ? 'Delete database' : 'Create database'
      }}</v-btn>

      <!-- <v-btn @click="showCursorDB">Show datas</v-btn> -->
      <v-btn @click="showModal = true">Create a marker</v-btn>
    </v-col>

    <tableMarkers :markers="markers" :showCursorDB="showCursorDB" />
  </v-row>
</template>

<script>
import modalCustom from '@/components/leaflet/modalCustom.vue'
import tableMarkers from '@/components/leaflet/tableMarkers.vue'
import { createIndexedDB, deleteIndexedDB } from '@/static/functions/indexedDb'

export default {
  layout: 'datasLayout',
  data() {
    return {
      // stepper
      e1: 1,
      // control inside modal
      showModal: false,
      disableInputs: false,
      disableColor: false,
      colorSelected: '',
      swatches: [
        '#FF0000', '#AA0000', '#550000',
        '#FFFF00', '#AAAA00', '#555500',
        '#00FF00', '#00AA00', '#005500',
        '#00FFFF', '#00AAAA', '#005555',
        '#0000FF', '#0000AA', '#000055',
      ],
      // item for text fields
      subCategorySelected: undefined,
      rulesCategory: [(v) => v.length >= 2 || 'Mininum 2 characters'],
      typeSelection: ['Point', 'Polygon', 'MultiLineString'],
      newIcon: {
        type: 'Point',
        category: 'test',
        subCategory: [],
        icon: '',
        color: [],
      },
      // manage datas
      markers: [],
      showBtnDBExist: false,
      DBmessage: undefined,
    }
  },
  components: {
    modalCustom,
    tableMarkers,
  },
  methods: {
    linkToIcon() {
      window.open('https://pictogrammers.github.io/@mdi/font/6.5.95/', '_blank')
    },
    checkStep1() {
      let nameExist
      this.markers.forEach((element) => {
        if (element.category.indexOf(this.newIcon.category) != -1) {
          nameExist = true
        }
      })
      nameExist
        ? (this.rulesCategory = ['this category already exist'])
        : (this.e1 = 2)
    },
    // RESET THE FORM AND ENABLE ALL BUTTON
    resetMarker() {
      this.newIcon = {
        type: 'Point',
        category: 'test',
        subCategory: [],
        icon: '',
        color: [],
      }
      this.subCategorySelected = undefined
      this.disableInputs = false
      this.disableColor = false
      this.e1 = 1
      this.rulesCategory = [(v) => v.length >= 2 || 'Mininum 2 characters']
    },
    addToArrayMarker(e) {
      if (e) {
        this.disableColor = false // active icon add color de toute facon
        this.newIcon.subCategory.push(this.subCategorySelected)
        this.disableInputs = true // desactive tous les autres
      } else {
        this.newIcon.color.push(this.colorSelected)
        this.disableInputs = false
        if (this.newIcon.subCategory.length > 0) {
          // if already add one subcategory, disabled it after executing code above
          this.disableColor = true
        }
      }
    },
    modalResponse(payload) {
      this.showModal = payload.message
      this.resetMarker()
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
    addNewMarker() {
      try {
        const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
        requestIndexedDB.onsuccess = (event) => {
          var db = event.target.result

          var transaction = db.transaction('markers', 'readwrite')
          const store = transaction.objectStore('markers') // store = table in sql
          // insert data  in the store
          store.add(this.newIcon)
          this.showCursorDB()

          console.log('markers added to the store')
          transaction.oncomplete = () => {
            db.close()
          }
          this.showModal = false
          this.resetMarker()
        }
        requestIndexedDB.onerror = (event) => {
          this.DBmessage = event
        }
      } catch (error) {
        console.log(error);
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
</style>