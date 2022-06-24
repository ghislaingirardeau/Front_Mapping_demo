<template>
  <v-row justify="center">
    <theNavBar />

    <v-card min-width="90%" v-if="foldersName.length > 0">
      <v-card-title>
        {{ userAuth ? `Your datas ${userAuth.displayName}` : 'My datas' }}
      </v-card-title>
      <v-card-subtitle class="d-flex flex-row align-center">
        <span class="my-4">Create a new project :</span>
        <v-icon size="30px" class="mx-4" color="secondary" @click="showNewField">mdi-folder-plus-outline</v-icon>
        <v-text-field
          v-if="newFolder.field"
          v-model="newFolder.name"
          dense
          :counter="10"
          label="Project Name"
          class="px-sm-8"
        ></v-text-field>
        <v-icon size="30px" v-if="newFolder.field" class="mx-4" color="primary" @click="createNewFolder">mdi-checkbox-marked-circle-outline</v-icon>
      </v-card-subtitle>
      <v-card-actions>
        <span>Select project to display :</span>
        <v-menu offset-y v-for="(name, l) in foldersName" :key="l">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              :color="activeFolder(name)"
              class="ma-2 btn-active-folder"
              outlined
              dark
              v-bind="attrs"
              v-on="on"
              @click="folderTooltip(name)"
            >
              <v-icon left>
                {{
                  name === workOn
                    ? 'mdi-folder-open-outline'
                    : 'mdi-folder-outline'
                }}
              </v-icon>
              {{ name }}
            </v-btn>
          </template>
          <v-list v-if="name != workOn">
            <v-list-item @click="editFolder(name, false)">
              <v-list-item-title>Open</v-list-item-title>
              <v-icon>mdi-folder-upload-outline</v-icon>
            </v-list-item>
            <v-list-item @click="editFolder(name, true)">
              <v-list-item-title>Remove</v-list-item-title>
              <v-icon>mdi-folder-remove-outline</v-icon>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-tooltip
          v-model="showTooltip"
          nudge-bottom="30"
          attach=".btn-active-folder"
        >
          <span>This folder is already open !</span>
        </v-tooltip>
      </v-card-actions>
    </v-card>

    <v-col cols="11" class="text-center" v-if="!userAuth">
      <p>Remember to login or register to save your data !</p>
    </v-col>
    <tableGeoJson :allDatas="GeoJsonTable" />
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  transition: 'home',
  data() {
    return {
      isActive: false,
      objetData: {},
      newFolder: {
        name: '',
        field: false
      },
      showTooltip: false,
    }
  },
  computed: {
    ...mapState(['markers', 'GeoJsonDatas', 'userAuth']),
    ...mapGetters(['GeoJsonTable', 'foldersName', 'workOn']),
  },
  methods: {
    activeFolder(name) {
      return name === this.workOn ? 'primary' : 'red'
    },
    linkMap() {
      this.$router.push('/')
    },
    editFolder(name, remove) {
      if (name != this.workOn) {
        let confirm = window.confirm(
          remove
            ? `Are you sure you want to delete all datas inside ${name}`
            : 'Be sure to save your datas before to switch !'
        )
        if (confirm) {
          let folder = {
            name: name,
            remove: remove,
            new: false
          }
          this.$store.dispatch('clickFolder', folder)
        }
      }
    },
    showNewField() {
      this.newFolder.field = !this.newFolder.field
    },
    createNewFolder() {
      let folder = {
            name: this.newFolder.name,
            remove: false,
            new: true
          }
      this.$store.dispatch('clickFolder', folder)
      this.refreshMap()
    },
    folderTooltip(name) {
      if (name === this.workOn) {
        this.showTooltip = !this.showTooltip
        setTimeout(() => {
          this.showTooltip = !this.showTooltip
        }, 2000)
      }
    },
    
  },
  mounted() {
    this.$store.dispatch('appLoad') // because store does not detect add / delete on object key
  },
}
</script>

<style lang="scss">
</style>
