<template>
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
        <template v-slot:[`item.remove`]="{ item }">
          <v-icon @click="removeDB(item)"> mdi-delete </v-icon>
        </template>
        <template v-slot:[`item.edit`]="{ item }">
          <v-icon @click="updateDB(item)"> mdi-brush </v-icon>
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
          filterable: false,
          value: 'category',
        },
        { text: 'Sub Category', value: 'subCategory' },
        { text: 'Icon', value: 'icon' },
        { text: 'Remove', value: 'remove' },
        { text: 'Edit', value: 'edit' },
      ],
    }
  },
  props: {
    markers: Array,
  },
  methods: {
    updateDB(e) {
      const updateCursor = (cursor, indexColor = 0, indexSubCategory = 0) => {
        cursor.value.color.splice(indexColor, 1, 'red')
        cursor.value.subCategory.splice(indexSubCategory, 1, 'sub update')
        const request = cursor.update(cursor.value)
        request.onsuccess = () => {
          console.log('Data updated')
          this.$store.dispatch('loadMarkers')
        }
      }
      const updateItem = (e) => {
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
                  // faire une fonction + change dynamic sub and color
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
      updateItem(e)
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