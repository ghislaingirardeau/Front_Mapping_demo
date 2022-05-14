<template>
  <v-col cols="12">
    <!-- dialog for the data editing -->
    <modalCustom :showModal="showModal" @send-modal="modalResponse">
      <template v-slot:title> Edit Item </template>
      <template v-slot:content>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="editItem.name"
            label="name"
            :rules="rulesName"
            required
          >
          </v-text-field>
          <v-text-field v-model="editItem.popupContent" label="details">
          </v-text-field>
        </v-form>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="updateItem"> Save </v-btn>
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
      <v-data-table :headers="headers" :items="allDatas" :search="search">
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon
            class="mr-10"
            color="teal"
            style="border: 2px solid teal; padding: 3px"
            @click="itemAction(item, false)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            color="teal"
            style="border: 2px solid teal; padding: 3px"
            @click="itemAction(item, true)"
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
          text: 'Name',
          align: 'start',
          filterable: false,
          value: 'name',
        },
        { text: 'Popup', value: 'popupContent' },
        { text: 'Category', value: 'category' },
        { text: 'ID', value: 'id' },
        { text: 'Actions', value: 'actions' },
      ],
      showModal: false,
      valid: true,
      editItem: {},
      rulesName: [(v) => v.length >= 2 || 'Mininum 2 characters'],
    }
  },
  props: {
    allDatas: Array,
  },
  methods: {
    itemAction(item, remove) {
      if (!remove) {
        this.showModal = true
        this.editItem = { ...item }
      } else {
        this.$store.dispatch('updateGeoJson', {
          action: remove,
          index: item,
        })
      }
    },
    updateItem() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch('updateGeoJson', {
          action: false,
          index: this.editItem, // send the change
        })
        this.showModal = false
      }
    },
    modalResponse(payload) {
      this.showModal = payload.message
    },
  },
}
</script>