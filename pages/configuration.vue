<template>
  <v-row>
    <modalCustom :showModal="showModal" @send-modal="modalResponse">
      <template v-slot:title> Build your marker {{ newIcon }} </template>
      <template v-slot:content>
        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step :complete="e1 > 1" step="1">
              Name of step 1
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="e1 > 2" step="2">
              Name of step 2
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="3"> Name of step 3 </v-stepper-step>
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
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" v-if="newIcon.type === 'Point'">
                  <v-text-field
                    v-model="newIcon.icon"
                    label="Add the name of the icon ex: plus-circle"
                    hint="Ony copy the name of the icon ex: help-circle-outline"
                    persistent-hint
                    required
                  >
                  <template v-slot:append>
                    <v-tooltip
                      bottom
                    >
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" @click="linkToIcon">
                          mdi-help-circle-outline
                        </v-icon>
                      </template>
                      Click to get the name of all icons available
                    </v-tooltip>
                  </template>
                  <template v-slot:append-outer>
                    <v-tooltip
                      bottom
                    >
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on">
                          mdi-{{ newIcon.icon }}
                        </v-icon>
                      </template>
                      Preview
                    </v-tooltip>
                  </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-btn color="primary" @click="e1 = 2"> Continue </v-btn>
                </v-col>
              </v-row>

            </v-stepper-content>

            <v-stepper-content step="2">
              <v-row>
                <v-col cols="12" sm="8">
                <v-tooltip top>
                  <template>
                  <v-text-field
                    v-model="subCategorySelected"
                    :disabled="disableInputs"
                    label="Sub Categorie Optionnal"
                    append-icon="mdi-plus-circle"
                    @click:append="addToArrayMarker(true)"
                  ></v-text-field>
                  </template>
                <span>Tooltip</span>
                </v-tooltip>
                </v-col>

                <v-col cols="12" sm="4">
                  <v-btn
                    outlined
                    color="primary"
                    :class="{ alert: disableInputs }"
                    @click="addToArrayMarker(false)"
                    :disabled="disableColor"
                    class="my-4"
                    >Add color</v-btn
                  >
                </v-col>

                <v-col cols="12" sm="7">
                  <v-color-picker
                    v-model="colorSelected"
                    dot-size="21"
                    swatches-max-height="100"
                    hide-inputs
                  ></v-color-picker>
                </v-col>
                <v-col cols="12" sm="4">
                  <p v-if="newIcon.type === 'Point'">Preview icon color</p>
                  <v-icon v-if="newIcon.type === 'Point'" :color="colorSelected" size="36px"
                    >mdi-{{ newIcon.icon }}</v-icon
                  >
                  <v-chip
                    v-else
                    :color="colorSelected"
                    label
                    x-large
                  >color preview</v-chip>
                </v-col>
                <v-col cols="12">
                  <v-btn color="primary" @click="e1 = 3" v-if="newIcon.color.length > 0" :disabled="disableInputs">
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
                <v-col cols="4" v-for="(item, l) in newIcon.color" :key="l">
                  <span v-if="newIcon.type === 'Point'">{{ newIcon.subCategory[l] ? newIcon.subCategory[l] : newIcon.category }}</span>
                  <v-icon v-if="newIcon.type === 'Point'" :color="newIcon.color[l]" size="36px"
                    >mdi-{{ newIcon.icon }}</v-icon
                  >
                  <v-chip
                    v-else
                    :color="newIcon.color[l]"
                    label
                    x-large
                  >{{ newIcon.subCategory[l] ? newIcon.subCategory[l] : 'my preview' }}</v-chip>
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

    <v-col cols="12">
      <h1>My Icons configaurations</h1>
      <v-btn disabled @click="activateIndexedDB">Create the database</v-btn>
      <v-btn disabled @click="addToDB">add a data</v-btn>
      <v-btn @click="cursorDB">Show datas</v-btn>
      <v-btn @click="updateDB">update data</v-btn>
      <v-btn @click="showModal = true">open modal</v-btn>
    </v-col>
    <v-col cols="12">
      <v-card>
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="markers" :search="search">
          <template v-slot:[`item.remove`]="{ item }">
            <v-icon @click="removeDB(item)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import modalCustom from '@/components/leaflet/modalCustom.vue'
export default {
  data() {
    return {
      e1: 1, // stepper
      search: '',
      // control inside modal
      showModal: true,
      disableInputs: false,
      disableColor: false,
      colorSelected: '',
      // item for text fields
      subCategorySelected: undefined,
      typeSelection: ['Point', 'Polygon', 'multiLineString'],
      newIcon: {
        type: 'Point',
        category: 'test',
        subCategory: [],
        icon: '',
        color: [],
      },
      // items for the table
      markers: [],
      headers: [
        {
          text: 'Type',
          align: 'start',
          filterable: false,
          value: 'type',
        },
        { text: 'Category', value: 'category' },
        { text: 'Sub Category', value: 'subCategory' },
        { text: 'Icon', value: 'icon' },
        { text: 'Color', value: 'color' },
        { text: 'Remove', value: 'remove' },
      ],
    }
  },
  components: {
    modalCustom,
  },
  methods: {
    linkToIcon() {
      window.open('https://materialdesignicons.com/', '_blank')
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
      this.disableInputs = false
      this.disableColor = false
      this.e1=1
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
    },
    activateIndexedDB() {
      const IndexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB
      if (!IndexedDB) {
        alert(
          "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available."
        )
      }
      const requestIndexedDB = window.indexedDB.open('Map_Database', 1)

      requestIndexedDB.onerror = (event) => {
        console.log(event)
      }
      requestIndexedDB.onupgradeneeded = (event) => {
        // Save the IDBDatabase interface
        var db = event.target.result

        // Create an objectStore for this database
        var objectStore = db.createObjectStore('markers', {
          autoIncrement: true,
        })
        objectStore.createIndex('markers_category', ['category'], {
          unique: false,
        }) // créer les index de recherche
        console.log('database created')
      }
    },
    addToDB() {
      const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
      requestIndexedDB.onsuccess = (event) => {
        var db = event.target.result

        var transaction = db.transaction('markers', 'readwrite')
        const store = transaction.objectStore('markers') // store = table in sql
        // insert data  in the store
        store.add({
          type: 'Point',
          category: 'house',
          subCategory: ['indebted', 'interview'],
          icon: 'home',
          color: ['green', 'red'],
        })
        store.add({
          type: 'Point',
          category: 'bath',
          subCategory: [],
          icon: 'water',
          color: 'blue',
        })
        store.add({
          type: 'Point',
          category: 'grave',
          subCategory: [],
          icon: 'grave-stone',
          color: 'blue',
        })
        store.add({
          type: 'Point',
          category: 'worship',
          subCategory: [],
          icon: 'hands-pray',
          color: 'blue',
        })
        store.add({
          type: 'Point',
          category: 'communal',
          subCategory: [],
          icon: 'hoop-house',
          color: 'blue',
        })
        store.add({
          type: 'Point',
          category: 'well',
          subCategory: ['private', 'public'],
          icon: 'water-pump',
          color: ['pink', 'yellow'],
        })
        store.add({
          type: 'Polygon',
          category: 'rice',
          subCategory: [],
          icon: '',
          color: 'blue',
        })
        store.add({
          type: 'MultiLineString',
          category: 'trace',
          subCategory: [],
          icon: '',
          color: 'purple',
        })

        console.log('markers added to the store')
        transaction.oncomplete = () => {
          db.close()
        }
      }
    },
    addNewMarker() {
      const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
      requestIndexedDB.onsuccess = (event) => {
        var db = event.target.result

        var transaction = db.transaction('markers', 'readwrite')
        const store = transaction.objectStore('markers') // store = table in sql
        // insert data  in the store
        store.add(this.newIcon)

        console.log('markers added to the store')
        transaction.oncomplete = () => {
          db.close()
        }
        this.showModal = false
      }
    },
    getDBid() {
      // ouvre la db
      const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
      requestIndexedDB.onerror = (event) => {
        console.log(event)
      }

      // la requete
      requestIndexedDB.onsuccess = (event) => {
        let db = event.target.result

        let transaction = db.transaction('markers', 'readwrite')
        let store = transaction.objectStore('markers') // store = table in sql

        let allDatas = store.getAll() // renvoie tous les modeles qui sont vert
        allDatas.onsuccess = () => {
          this.markers = allDatas.result
        }

        // close db at the end of transaction
        transaction.oncomplete = () => {
          db.close()
        }
        transaction.onerror = (event) => {
          // si il y a une erreur dans la requete
          console.log(event)
        }
      }
    },
    updateDB() {
      // ouvre la db
      const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
      requestIndexedDB.onerror = (event) => {
        console.log(event)
      }

      // la requete
      requestIndexedDB.onsuccess = (event) => {
        let db = event.target.result

        let transaction = db.transaction('markers', 'readwrite')
        let store = transaction.objectStore('markers') // store = table in sql

        store.openCursor().onsuccess = (event) => {
          const cursor = event.target.result
          if (cursor) {
            if (cursor.value.category === 'basket') {
              const updateData = cursor.value

              updateData.size = 'large'
              const request = cursor.update(updateData)
              request.onsuccess = () => {
                console.log('Data updated')
              }
            }
            cursor.continue()
          } else {
            console.log('Entries displayed.')
          }
        }
      }
    },
    cursorDB() {
      this.markers = []
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
              class Data {
                constructor(sub, color) {
                  ;(this.type = cursor.value.type),
                    (this.category = cursor.value.category),
                    (this.subCategory = sub),
                    (this.icon = cursor.value.icon),
                    (this.color = color)
                }
              }
              for (
                let index = 0;
                index < cursor.value.subCategory.length;
                index++
              ) {
                let formatedData = new Data(
                  cursor.value.subCategory[index],
                  cursor.value.color[index]
                )
                this.markers.push(formatedData)
              }
            } else {
              this.markers.push(cursor.value)
            }
            cursor.continue()
          } else {
            console.log(this.markers)
            console.log('No more entries!')
          }
        }

        // close db at the end of transaction
        transaction.oncomplete = () => {
          db.close()
        }
      }
    },
    removeDB(e) {
      const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
      requestIndexedDB.onerror = (event) => {
        console.log(event)
      }

      // la requete
      requestIndexedDB.onsuccess = (event) => {
        let db = event.target.result

        let transaction = db.transaction('markers', 'readwrite')
        let store = transaction.objectStore('markers') // store = table in sql

        store.openCursor().onsuccess = (event) => {
          const cursor = event.target.result
          if (cursor) {
            if (cursor.value.category === e.category) {
              if (cursor.value.subCategory.length > 0) {
                console.log('mutliple')
              } else {
                let idQuery = store.delete(cursor.key)
                idQuery.onsuccess = (event) => {
                  this.cursorDB()
                  alert('this marker has been removed')
                }
              }
            }
            cursor.continue()
          } else {
            console.log('Entries displayed.')
          }
        }

        transaction.oncomplete = () => {
          db.close()
        }
        transaction.onerror = (event) => {
          console.log(event)
        }
      }
    },
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
.alert {
  color: red;
}
</style>