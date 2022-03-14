<template>
  <v-row>
    <modalCustom :showModal="showModal" @send-modal="modalResponse">
      <template v-slot:title> </template>
      <template v-slot:content>
        {{ newIcon }} {{colorSelected}}
        <v-row>
        <v-col cols="12" sm="6">
            <v-select
            v-model="newIcon.type"
            :items="typeSelection"
            label="Type"
            required
            :disabled="disableInput"
            ></v-select>
        </v-col>
        <v-col cols="12" sm="6">
            <v-text-field
            v-model="newIcon.category"
            label="category"
            required
            :disabled="disableInput"
            ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
            <v-text-field
            v-model="subCategorySelected"
            :disabled="disableInputMarker"
            label="Sub Categorie Optionnal"
            append-icon="mdi-plus-circle"
            @click:append="addToArrayMarker(true)"
            ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
            <v-text-field
            v-model="newIcon.icon"
            label="icon"
            required
            :disabled="disableInput"
            ></v-text-field>
        </v-col>
        </v-row>

        <v-row class="text-center">
            <v-col cols="7">
                <v-color-picker
                v-model="colorSelected"
                dot-size="21"
                swatches-max-height="100"
                hide-inputs
                ></v-color-picker>
            </v-col>
            <v-col cols="4">
                <p>Add a color icon</p>
                <v-icon size="36px" @click="addToArrayMarker(false)">mdi-plus-circle</v-icon>
            </v-col>
        </v-row>
        
        <!-- Fait apparaitre le résumé de la sélection -->
        <v-row class="text-center" v-if="newIcon.color.length > 0">
            <v-col cols="11" v-for="(item, l) in newIcon.color" :key="l">
                <span>{{newIcon.subCategory[l]}}</span>
                <v-icon :color="colorSelected" size="36px">mdi-{{newIcon.icon}}</v-icon>
            </v-col>
        </v-row>


        <v-btn color="primary" :disabled="disableInputMarker" @click="addNewMarker">Add the markers</v-btn>
        <v-btn color="primary" @click="resetMarker">Reset</v-btn>
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
      search: '',
      showModal: true,
      subCategorySelected: undefined,
      disableInput: false,
      disableInputMarker: false,
      colorSelected: '',
      typeSelection: ['Point', 'Polygon', 'multiLineString'],
      newIcon: {
        type: 'Point',
        category: 'test',
        subCategory: [],
        icon: 'account',
        color: [],
      },
      markers: [],
      sub: [],
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
      // RESET THE FORM AND ENABLE ALL BUTTON
      resetMarker() {
          this.newIcon = {
                type: 'Point',
                category: 'test',
                subCategory: [],
                icon: 'account',
                color: []
            }
            this.disableInput = false
            this.disableInputMarker = false
      },
      addToArrayMarker(e){
          if(e) {
              this.newIcon.subCategory.push(this.subCategorySelected)
              this.disableInput = true
              this.disableInputMarker = true
          } else {
              if(this.newIcon.subCategory.length > 0){
                // REACTIVE BTN ADD SUB CAT
                this.disableInputMarker = false
                this.newIcon.color.push(this.colorSelected)
              } else {
                this.newIcon.color.push(this.colorSelected)
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
        if(this.newIcon.subCategory.length > this.newIcon.color.length) {
            alert('Add a color to the category')
        } else if(this.newIcon.subCategory.length > this.newIcon.color.length) {
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
            }
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
</style>