<template>
  <v-col cols="12">
    <!-- dialog for the data editing -->
    <modalCustom :showModal="showModal" @send-modal="modalResponse">
      <template v-slot:title> Edit Item</template>
      <template v-slot:content>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="editItem.newSubCategory"
            label="Change SubCategory"
            :rules="rulesEditSub"
          >
          </v-text-field>
          <v-color-picker
            v-model="editItem.newColor"
            dot-size="25"
            hide-inputs
          ></v-color-picker>
          <v-spacer></v-spacer>
          <v-btn color="teal" outlined @click="updateItem"> Save </v-btn>
        </v-form>
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

        </template>
        <template v-slot:[`item.edit`]="{ item }">
          <v-icon
            color="teal"
            style="border: 2px solid teal; padding: 3px"
            @click="openEditor(item)"
          >
            mdi-brush
          </v-icon>
        </template>
        <template v-slot:[`item.remove`]="{ item }">
          <v-icon
            color="teal"
            style="border: 2px solid teal; padding: 3px"
            @click="removeDB(item)"
          >
            mdi-delete
          </v-icon>
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
      rulesEditSub: [(v) => v.length > 0 || 'minimum 2 characters'],
      editItem: {
        old: '',
        newSubCategory: '',
        newColor: '',
      },
    }
  },
  props: {
    markers: Array,
  },
  methods: {
    modalResponse(payload) {
      this.showModal = payload.message
    },
    openEditor(e) {
      if (e.subCategory.length > 0 && e.subCategory[0].length > 1) { // if there is subcat
        this.rulesEditSub = [(v) => v.length > 2 || 'minimum 2 characters']
        this.editItem.newSubCategory = e.subCategory // load the actual subcat
      } else {
        this.rulesEditSub = [true]
      }
      this.editItem.old = e
      this.showModal = !this.showModal
    },
    async updateItem() {
      let dataLs = JSON.parse(localStorage.getItem('APIGeoMap'))
      let updateMarker = {...this.editItem.old}

      // UPDATE MARKER FROM LOCALSTORAGE
      const setMarker = () => {
        return new Promise((resolve, reject) => {
          let index = dataLs.markers.findIndex(elt => (elt.category === this.editItem.old.category && elt.subCategory[0] === this.editItem.old.subCategory[0]))
          updateMarker.color = [this.editItem.newColor]
          updateMarker.subCategory = this.editItem.newSubCategory.length > 1 ? [this.editItem.newSubCategory] : []
          dataLs.markers.splice(index, 1, updateMarker)
          resolve(true)
        });
      }
      // UPDATE GEOJSON FROM LOCALSTORAGE
      const setGeoJson = () => {
        return new Promise((resolve, reject) => {
          if(dataLs.GeoJsonDatas[updateMarker.category]) { // if undefined = there is no data with this marker yet
            dataLs.GeoJsonDatas[updateMarker.category].forEach(element => {
              if(element.properties.subCategory === this.editItem.old.subCategory[0]) {
                element.icon.color = [this.editItem.newColor]
                element.properties.subCategory = this.editItem.newSubCategory.length > 1 ? this.editItem.newSubCategory : ''
              }
              if(element.properties.subCategory.length === 0 || element.properties.subCategory[0].length === 0) {
                element.icon.color = [this.editItem.newColor]
              }
            });
          }
          resolve(true)
        });
      }
      
      if (this.$refs.form.validate()) {
        let resMarker = await setMarker()
        if (resMarker) {
          let resGeoJson = await setGeoJson()
          if (resGeoJson) {
            localStorage.setItem('APIGeoMap', JSON.stringify(dataLs)) // UPDATE LOCAL STORAGE
            this.$store.dispatch('markersLoad') // RELOAD MARKERS
            this.showModal = !this.showModal
            this.editItem.subCategory = ''
          }
        }
      }
    },
    async removeDB(e) {

      const updateLs = () => {
        return new Promise((resolve, reject) => {
          let dataLs = JSON.parse(localStorage.getItem('APIGeoMap'))
          let index = dataLs.markers.findIndex(elt => (elt.category === e.category && elt.subCategory[0] === e.subCategory[0]))
          dataLs.markers.splice(index, 1)
          localStorage.setItem('APIGeoMap', JSON.stringify(dataLs))
          resolve(true)
        });
      }
      
      let confirm = window.confirm(`Remove the item ${e.category} ?`)
      if (confirm) {
        let result = await updateLs()
        result ? this.$store.dispatch('markersLoad') : alert('erreur lors de la suppression')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
</style>