<template>
  <v-row>
    <v-col cols="12" class="text-center">
      <h1>My datas</h1>
    </v-col>
    <v-col cols="12" class="text-center">
      <p :class="{ active: isActive }">
        You have collected {{ allDatas ? allDatas.length : '' }} datas
      </p>
    </v-col>
    <tableGeoJson
      v-if="allDatas"
      :allDatas="allDatas"
      @data-update="tableUpdate"
    />
    <v-col v-else cols="12">
      <p>No data save yet</p>
    </v-col>
  </v-row>
</template>

<script>

export default {
  layout: 'datasLayout',
  data() {
    return {
      allDatas: [],
      isActive: false,
      objetData: {}
    }
  },
  methods: {
    linkMap() {
      this.$router.push('/')
    },
    async tableUpdate(playload) {
      if(playload.action) {
        this.allDatas.splice(playload.index, 1)
      } else {
        // get the update and refresh alldatas
        let {name, index, popupContent} = playload.itemToSave
        this.allDatas[index].properties.name = name
        this.allDatas[index].properties.popupContent = popupContent
      }
      // FUNCTION TO UPDATE JSON IN LOCALSTORAGE
      let countCategories = []
      this.allDatas.reverse()

      await this.allDatas.forEach((element) => {
        // recupere le nombre de category differentes créées
        if (countCategories.indexOf(element.properties.category) === -1) {
          countCategories.push(element.properties.category)
        }
      })   
      await countCategories.forEach((element) => {
        // pour chaque category, je lui crée un nouveau tableau
        let name = element
        this.objetData[element] = new Array()
        this.allDatas.forEach((index) => {
          // j'envoie le tableau de geosjon dans la categorie correspondante
          if (index.properties.category === name) {
            this.objetData[element].push(index)
          }
        })
      })
      localStorage.setItem('APIGeoMap', JSON.stringify({GeoJsonDatas: this.objetData}))
    }
  },
  mounted() {
    try {
      /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
      let geoFromLocal = JSON.parse(localStorage.getItem('APIGeoMap'))

      for (let property in geoFromLocal.GeoJsonDatas) {
        this.allDatas.push(...geoFromLocal.GeoJsonDatas[property])
        this.allDatas.reverse()
      }
    } catch (error) {}
  },
}
</script>

<style lang="scss">
</style>
