<template>
  <v-card>{{dataItems}}
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :search="search"
    ></v-data-table>
  </v-card>
</template>

<script>
  export default {
    data () {
      return {
        search: '',
        headers: [
          {
            text: 'Name',
            align: 'start',
            filterable: false,
            value: 'name',
          },
          { text: 'Amenity', value: 'amenity' },
          { text: 'Details', value: 'popupContent' },
          { text: 'Type', value: 'type' },
          { text: 'Coordonates', value: 'coordinates' },
        ],
      }
    },
    props: {
        geojsonFeature: Array
    },
    computed: {
        // RECUPERER LES DONNEES SOUS FORME ARRAY OBJET POUR LES ENVOYE DANS LE TABLEAU DE DATA
        dataItems() {
            console.log(typeof(this.geojsonFeature))
            return this.geojsonFeature
        }
    }

  }
</script>