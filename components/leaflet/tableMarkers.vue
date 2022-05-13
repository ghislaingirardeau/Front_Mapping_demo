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
import { mapState } from 'vuex'

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
  computed: {
    ...mapState(['markers', 'GeoJsonDatas']),
  },
  methods: {
    modalResponse(payload) {
      this.showModal = payload.message
    },
    openEditor(e) {
      if (e.subCategory.length > 0 && e.subCategory[0].length > 1) {
        // if there is subcat
        this.rulesEditSub = [(v) => v.length > 2 || 'minimum 2 characters']
        this.editItem.newSubCategory = e.subCategory // load the actual subcat
      } else {
        this.rulesEditSub = [true]
      }
      this.editItem.old = e
      this.showModal = !this.showModal
    },
    async updateItem() {
      // TO UPDATE GEOJSON
      let indice = {
        name: this.editItem.old.category,
        index: [],
      }
      if (this.GeoJsonDatas && this.GeoJsonDatas[this.editItem.old.category]) {
        let array = this.GeoJsonDatas[this.editItem.old.category]
        array.forEach((element, i) => {
          element.properties.subCategory === this.editItem.old.subCategory[0]
            ? indice.index.push(i)
            : ''
        })
      }

      if (this.$refs.form.validate()) {
        let dataStore = {
          id: this.editItem.old,
          update: {
            color: this.editItem.newColor,
            subCategory: this.editItem.newSubCategory,
            GeoJson: indice,
          },
        }
        let res = await this.$store.dispatch('updateMarker', dataStore)
        this.showModal = !this.showModal
        this.editItem.subCategory = ''
      }
    },
    async removeDB(e) {
      let confirm = window.confirm(`Remove the item ${e.category} ?`)
      if (confirm) {
        let dataStore = {
          id: e,
          update: false,
        }
        let res = await this.$store.dispatch('updateMarker', dataStore)
        console.log(res)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
</style>