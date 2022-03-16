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
      <v-data-table
        :headers="headers"
        :items="geoItems"
        :search="search"
      ></v-data-table>
    </v-card>
  </v-col>
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
          { text: 'Details', value: 'popupContent' },
          { text: 'Type', value: 'category' },
          { text: 'Coordonates', value: 'coordinates' },
        ],
      }
    },
    props: {
        geoJsonFeature: Array
    },
    computed: {
        // RECUPERER LES DONNEES SOUS FORME ARRAY OBJET POUR LES ENVOYE DANS LE TABLEAU DE DATA
        geoItems() {
          let dataArray = []
          this.geoJsonFeature.forEach(element => {
            dataArray.push({
              ...element.properties,
              ...element.geometry
            })
          });
            return dataArray
        }
    },
  }
</script>