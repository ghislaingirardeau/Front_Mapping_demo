<template>
  <v-col cols="12" md="11">
    <!-- dialog for the data editing -->
    <edit-menu :showModal="showModal" @send-modal="modalResponse">
      <template v-slot:title>
        <span> Edit my data </span>
      </template>
      <template v-slot:content>
        <edit-data :editItem="editItem" />
      </template>
    </edit-menu>

    <v-card>
      <v-card-title>
        <span class="pt-5 mr-4 mr-sm-15">{{allDatas.length}} datas</span>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          class="px-sm-5"
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
            color="primary"
            style="border: 2px solid teal; padding: 3px"
            @click="openEditor(item)"
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
    openEditor(item) {
      this.editItem.properties = { ...item }
      this.showModal = true
    },
    modalResponse(payload) {
      this.showModal = false
    },
  },
}
</script>