<template>
  <v-col cols="12" md="11">
    <!-- dialog for the data editing -->
    <edit-data
      :editItem="editItem"
      :showModal="showModal"
      @send-modal="modalResponse"
    />

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
        :items="allDatas"
        :search="search"
        :sort-by="['id']"
        :sort-desc="[true]"
        :loading="allDatas.length === 0"
        loading-text="Loading... Please wait"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon
            class="mr-10"
            color="teal"
            style="border: 2px solid teal; padding: 3px"
            @click="itemAction(item, false)"
          >
            mdi-pencil
          </v-icon>
        </template>
        <template v-slot:[`item.time`]="{ item }">
          <span>{{ item.time.replaceAll(/[A-z]/g, ' ') }}</span>
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
      showModal: false,
      editItem: {
        geometry: {
          type: false,
        },
      },
      headers: [
        {
          text: 'Name',
          align: 'start',
          filterable: false,
          value: 'name',
        },
        { text: 'Popup', value: 'popupContent' },
        { text: 'Category', value: 'category' },
        { text: 'Time', value: 'time' },
        { text: 'Actions', value: 'actions' },
      ],
    }
  },
  props: {
    allDatas: Array,
  },
  methods: {
    itemAction(item, remove) {
      if (!remove) {
        this.editItem.properties = { ...item }
        this.showModal = true
      } else {
        this.$store.dispatch('updateGeoJson', {
          action: remove,
          index: item,
        })
      }
    },
    modalResponse(payload) {
      this.showModal = false
    },
  },
}
</script>