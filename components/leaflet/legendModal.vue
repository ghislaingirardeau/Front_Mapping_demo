<template>
  <v-col :cols="themeDarkColor ? '6' : undefined" :class="themeDarkColor ? 'legend__bloc' : ''">
    <v-row class="text-center">
      <v-col v-for="(i, l) in markers" :key="l" order="first">
        <span>{{i.category}}</span>
        <br>
        
        <v-icon v-if="i.icon.length > 0" :color="i.color"> mdi-{{i.icon}} </v-icon>
        <v-chip :color="i.color" small v-else>area</v-chip>
        <br>
        <span v-if="i.subCategory.length > 0">{{i.subCategory}}</span>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import exportCSV from "@/components/leaflet/exportCSV.vue";

export default {
  data: () => ({
    showContent: false,
    markers: [],
  }),
  props: {
    showLegend: Boolean,
    themeDarkColor: Boolean
  },
  components: {
    exportCSV,
  },
  methods: {
    legend() {
      this.showContent = !this.showContent;
    },
  },
  mounted () {
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
              class Marker {
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
                let formatedMarker = new Marker(
                  cursor.value.subCategory[index],
                  cursor.value.color[index]
                )
                this.markers.push(formatedMarker)
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
  }
};
</script>

<style lang="scss">
.legend__bloc {
  border: 2px solid grey;
}
.items--font {
  font-size: 12px;
}
.block__items {
  padding: 2px;
}
/* @media print { 
	.option__bloc{
		display: none;
	}
}
 */
</style>
