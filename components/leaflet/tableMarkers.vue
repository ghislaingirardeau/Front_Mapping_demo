<template>
  <v-col cols="12" md="11">
    <!-- dialog for the data editing -->
    <modalCustom :showModal="showModal" @send-modal="modalResponse">
      <template v-slot:title> Edit Item</template>
      <template v-slot:content>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="editItem.newCategory"
            label="Category name"
            :rules="rulesEditSub"
          >
          </v-text-field>
          <v-text-field
            v-model="editItem.newIcon"
            label="Icon name"
            hint="Type the first letter to see the icon's list"
            persistent-hint
            prefix="mdi-"
            class="mb-3"
            :rules="checkIcon"
            required
            @keyup="showIconsList(editItem.newIcon)"
          >
          </v-text-field>
          <v-icon class="ml-3" :color="editItem.newColor" large v-if="editItem.newIcon">
            mdi-{{ editItem.newIcon }}
          </v-icon>

          <v-dialog v-model="dialog" fullscreen hide-overlay>
            <template v-slot:activator="{ on, attrs }">
              <span v-show="editItem.newIcon.length > 0"
                >{{ iconSuggestList.length }} icons found</span
              >
              <v-icon
                color="teal"
                v-bind="attrs"
                v-on="on"
                v-show="editItem.newIcon.length > 0"
                class="mr-3 iconAddColor"
                size="24px"
                >mdi-eye-settings-outline</v-icon
              >
            </template>
            <v-card>
              <v-card-title> Click to select icon </v-card-title>
              <v-card-text class="ma-2">
                <v-icon
                  class="ma-2"
                  v-for="(icon, i) in iconSuggestList"
                  :key="i"
                  x-large
                  @click="pickIcon(icon)"
                  >mdi-{{ icon }}</v-icon
                >
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="teal" outlined @click="dialog = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-text-field
            v-model="editItem.newSubCategory"
            label="Change SubCategory"
            :rules="rulesEditSub"
          >
          </v-text-field>

          <v-spacer></v-spacer>
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
          <v-icon v-if="item.type === 'Point'" :color="item.color" size="28px">
            mdi-{{ item.icon }}</v-icon
          >
          <v-icon
            v-else-if="item.type === 'MultiLineString'"
            :color="item.color"
            size="28px"
          >
            mdi-vector-polyline
          </v-icon>
          <v-icon
            v-else-if="item.type === 'Polygon'"
            :color="item.color"
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
      dialog: false,
      iconsSuggest: [],
      valid: true,
      rulesEditSub: [(v) => v.length > 0 || 'minimum 2 characters'],
      editItem: {
        old: '',
        newCategory: '',
        newSubCategory: '',
        newIcon: '',
        newColor: '',
      },
    }
  },
  computed: {
    ...mapState(['markers', 'GeoJsonDatas', 'iconsList']),
    checkIcon() {
      let control = this.iconsList.find(
        (element) => element === this.editItem.newIcon
      )
        ? true
        : false
      return [(v) => control || 'this icon does not exist']
    },
    iconSuggestList: {
      // getter
      get: function () {
        return this.iconsSuggest
      },
      // setter
      set: function (newValue) {
        this.iconsSuggest = newValue
      },
    },
  },
  methods: {
    showIconsList(e) {
      // show icon inside the list
      let value = e.toLowerCase()
      if (value.length > 0) {
        const result = this.iconsList.filter((word) => word.startsWith(value))
        this.iconSuggestList = result
      }
    },
    pickIcon(elt) {
      this.editItem.newIcon = elt
      this.dialog = false
    },
    modalResponse(payload) {
      this.showModal = payload.message
    },
    openEditor(e) {
      if (e.subCategory.length > 0) {
        // if there is subcat
        this.rulesEditSub = [(v) => v.length > 2 || 'minimum 2 characters']
        this.editItem.newSubCategory = e.subCategory // load the actual subcat
      } else {
        this.rulesEditSub = [true]
      }
      this.editItem.old = e
      console.log(e)
      this.editItem.newCategory = e.category
      this.editItem.newIcon = e.icon
      this.editItem.newColor = e.color
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
          element.properties.subCategory === this.editItem.old.subCategory
            ? indice.index.push(i)
            : ''
        })
      }

      if (this.$refs.form.validate()) {
        let dataStore = {
          id: this.editItem.old,
          update: {
            color: this.editItem.newColor,
            icon: this.editItem.newIcon,
            category: this.editItem.newCategory,
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
      }
    },
  },
}
</script>

<style lang="scss" scoped>
</style>