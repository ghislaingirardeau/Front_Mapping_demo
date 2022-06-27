<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-text-field
      v-model="editItem.category"
      label="Category name"
      :rules="rulesEditCat"
    >
    </v-text-field>
    <v-text-field
      v-model="editItem.icon"
      v-if="oldItem.icon"
      label="Icon name"
      hint="Type the first letter to see the icon's list"
      persistent-hint
      prefix="mdi-"
      class="mb-3"
      :rules="checkIcon"
      required
      @keyup="showIconsList(editItem.icon)"
    >
    </v-text-field>
    <v-icon
      class="ml-3"
      :color="editItem.color"
      large
      v-if="oldItem.icon"
    >
      mdi-{{ editItem.icon }}
    </v-icon>

    <v-dialog v-model="dialog" fullscreen hide-overlay>
      <template v-slot:activator="{ on, attrs }">
        <span v-show="oldItem.icon.length > 0"
          >{{ iconSuggestList.length }} icons found</span
        >
        <v-icon
          color="primary"
          v-bind="attrs"
          v-on="on"
          v-show="oldItem.icon.length > 0"
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
          <v-btn color="primary" outlined @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-text-field
      v-model="editItem.subCategory"
      v-if="oldItem.subCategory"
      label="Change SubCategory"
      :rules="rulesEditSub"
    >
    </v-text-field>

    <v-spacer></v-spacer>
    <v-color-picker
      v-model="editItem.color"
      dot-size="25"
      hide-inputs
      class="mt-3"
    ></v-color-picker>
    <v-spacer></v-spacer>
    <v-btn color="primary" outlined @click="updateItem"> Save </v-btn>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      dialog: false,
      iconsSuggest: [],
      valid: true,
      /* rulesEditCat: [(v) => v.length > 1 || 'minimum 2 characters'], */
    }
  },
  props: {
    editItem: Object,
    oldItem: Object,
    showModal: Boolean,
    rulesEditSub: Array,
  },
  computed: {
    ...mapState(['markers', 'GeoJsonDatas', 'iconsList']),
    rulesEditCat() {
      // if cat new is different cat old
      const categoryExist = this.markers.map(e => e.category != this.oldItem.category ? e.category : null).includes(this.editItem.category)
      if (categoryExist) return [false || 'Category already exist']
      return [(v) => v.length > 1 || 'minimum 2 characters']
    },
    checkIcon() {
      let control = this.iconsList.find(
        (element) => element === this.editItem.icon
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
      this.editItem.icon = elt
      this.dialog = false
    },
    async updateItem() {
      // TO UPDATE GEOJSON
      let listIndex = []
      if (this.GeoJsonDatas && this.GeoJsonDatas[this.oldItem.category]) {
        let array = this.GeoJsonDatas[this.oldItem.category]
        array.forEach((element, i) => {
          element.properties.subCategory === this.oldItem.subCategory
            ? listIndex.push(i)
            : ''
        })
      }
      // DEBUG IF EDIT CAT AND ICON OF SUB CAT
      if (this.$refs.form.validate()) {
        let dataStore = {
          old: this.oldItem,
          new: this.editItem,
          geosIndex: listIndex,
        }
        let res = await this.$store.dispatch('updateMarker', dataStore)
        this.refreshMap()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
</style>