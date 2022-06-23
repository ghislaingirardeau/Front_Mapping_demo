<template>
  <v-row justify="center">
    <theNavBar />
    
    <v-card width="100%" v-if="foldersName.length > 0">
      <v-card-title>
        {{ userAuth ? `Your datas ${userAuth.displayName}` : 'My datas' }}
      </v-card-title>
      <v-card-subtitle> 
        Select your folder to display : 
        <v-btn icon color="secondary">
          <v-icon>mdi-folder-plus-outline</v-icon>
        </v-btn>
      </v-card-subtitle>
      <v-card-actions>
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
      <p >Remember to login or register to save your data !</p>
    </v-col>
    <tableGeoJson v-if="GeoJsonTable" :allDatas="GeoJsonTable" />
    <v-col v-else cols="12">
      <p>No data save yet</p>
    </v-col>
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
          remove
            ? console.log('function to create')
            : this.$store.dispatch('switchFolder', name)
        }
      }
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
