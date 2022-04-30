<template>
  <v-col cols="12">
    <!-- dialog for the data editing -->
    <modalCustom :showModal="showModal" @send-modal="modalResponse"> 
      <template v-slot:title>
        Edit Item
      </template>
      <template v-slot:content>
          <v-text-field
            v-model="editItem.subCategory"
            label="Change SubCategory"
          >
          </v-text-field>
          <v-color-picker
            v-model="editItem.color"
            dot-size="25"
            hide-inputs
          ></v-color-picker>
        <v-spacer></v-spacer>
        <v-btn color="teal" outlined @click="updateItem">
          Save
        </v-btn>
      </template>
    </modalCustom>

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
        <template v-slot:[`item.icon`]="{ item }">
          <v-icon
            v-if="item.type === 'Point'"
            :color="item.color[0]"
            size="28px"
          >
            mdi-{{ item.icon }}</v-icon
          >
          <v-icon
            v-else-if="item.type === 'MultiLineString'"
            :color="item.color[0]"
            size="28px"
          >
            mdi-vector-polyline
          </v-icon>
          <v-icon
            v-else-if="item.type === 'Polygon'"
            :color="item.color[0]"
            size="28px"
          >
            mdi-triangle
          </v-icon>

          <!-- <v-chip :color="item.color[0]" small v-else>area</v-chip> -->
        </template>
        <template v-slot:[`item.edit`]="{ item }">
          <v-icon color="teal" style="border: 2px solid teal; padding: 3px;" @click="openEditor(item)"> mdi-brush </v-icon>
        </template>
        <template v-slot:[`item.remove`]="{ item }">
          <v-icon color="teal" style="border: 2px solid teal; padding: 3px;" @click="removeDB(item)"> mdi-delete </v-icon>
        </template>
      </v-data-table>
    </v-card>
  </v-col>
</template>

<script>
export default {
  data() {
    return {
      search: '',
      headers: [
        {
          text: 'Category',
          align: 'start',
          filterable: true,
          value: 'category',
        },
        { text: 'Sub Category', value: 'subCategory' },
        { text: 'Icon', value: 'icon' },
        { text: 'Edit', value: 'edit' },
        { text: 'Remove', value: 'remove' },
      ],
      showModal: false,
      valid: true,
      editItem: {
        id: '',
        subCategory: '',
        color: { r: 255, g: 255, b: 255 }
      }
    }
  },
  props: {
    markers: Array,
  },
  methods: {
    modalResponse(payload) {
      this.showModal = payload.message;
    },
    openEditor(e) {
        this.editItem.id = e
        this.showModal = !this.showModal
    },
    updateItem() {
      let colorToRgb = `rgb(${this.editItem.color.r}, ${this.editItem.color.g}, ${this.editItem.color.b})`
      const updateCursor = (cursor, indexColor = 0, indexSubCategory = 0) => {
        cursor.value.color.splice(indexColor, 1, colorToRgb)
        cursor.value.subCategory.splice(indexSubCategory, 1, this.editItem.subCategory)
        const request = cursor.update(cursor.value)
        request.onsuccess = () => {
          console.log('Data updated')
          this.$store.dispatch('loadMarkers')
        }
      }
      const updateDB = (e) => {
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
                if (cursor.value.subCategory.length > 1) {
                  // si multi sub category, update color and subcat en supprimant l'item du tableau
                  let indexColor = cursor.value.color.indexOf(e.color[0])
                  let indexSubCategory = cursor.value.subCategory.indexOf(
                    e.subCategory[0]
                  )
                  updateCursor(cursor, indexColor, indexSubCategory)
                } else {
                  updateCursor(cursor, )
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
      }
      updateDB(this.editItem.id)
      this.showModal = !this.showModal
    },
    removeDB(e) {
      const removeItem = (e) => {
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
                if (cursor.value.subCategory.length > 1) {
                  // si multi sub category, update color and subcat en supprimant l'item du tableau
                  let indexColor = cursor.value.color.indexOf(e.color[0])
                  let indexSubCategory = cursor.value.subCategory.indexOf(
                    e.subCategory[0]
                  )

                  cursor.value.color.splice(indexColor, 1)
                  cursor.value.subCategory.splice(indexSubCategory, 1)
                  const request = cursor.update(cursor.value)
                  request.onsuccess = () => {
                    console.log('Data updated')
                    this.$store.dispatch('loadMarkers')
                  }
                } else {
                  // si array sucategory is empty or have '' == remove item
                  let idQuery = store.delete(cursor.key)
                  idQuery.onsuccess = (event) => {
                    this.$store.dispatch('loadMarkers')
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
      }
      let confirm = window.confirm(`Remove the item ${e.category} ?`)
      if (confirm) {
        removeItem(e)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
</style>