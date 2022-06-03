<template>
  <v-col cols="12" md="11">
    <!-- dialog for the data editing -->
    <edit-menu :showModal="showModal" @send-modal="modalMarker">
      <template v-slot:title> 
        <span>
          Edit my data
        </span>  
      </template>
      <template v-slot:content>
        <edit-marker
          :rulesEditSub="rulesEditSub"
          :editItem="editItem"
          :oldItem="oldItem"
        ></edit-marker>
      </template>
    </edit-menu>

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
            color="primary"
            style="border: 2px solid teal; padding: 3px"
            @click="openEditor(item)"
          >
            mdi-brush
          </v-icon>
        </template>
        <template v-slot:[`item.remove`]="{ item }">
          <v-icon
            color="primary"
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
      rulesEditSub: [(v) => v.length > 1 || 'minimum 2 characters'],
      editItem: {},
      oldItem: {},
    }
  },
  computed: {
    ...mapState(['markers']),
  },
  methods: {
    modalMarker(payload) {
      this.showModal = false
    },
    openEditor(e) {
      console.log(e);
      if (e.subCategory.length > 0) {
        // if there is subcat
        this.rulesEditSub = [(v) => v.length > 1 || 'minimum 2 characters']
      } else {
        this.rulesEditSub = [true]
      }
      this.editItem = { ...e }
      this.oldItem = { ...e }

      this.showModal = !this.showModal
    },
    async removeDB(e) {
      console.log(e);
      /* let confirm = window.confirm(`Remove the item ${e.category} ?`)
      if (confirm) {
        let dataStore = {
          old: { id: e.id },
          new: false,
        }
        let res = await this.$store.dispatch('updateMarker', dataStore)
      } */
    },
  },
}
</script>

<style lang="scss" scoped>
</style>