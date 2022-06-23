<template>
  <v-row justify="center">
    <theNavBar />
    <v-col cols="11" class="text-center mt-3">
      <h1>
        {{ userAuth ? `My datas : ${userAuth.displayName}` : 'My datas' }}
      </h1>
    </v-col>
    <v-col cols="11" class="text-center mt-3" v-if="foldersName.length > 0">
      <h2>Select your folder to display</h2>
      <v-btn
        v-for="(name, l) in foldersName"
        :key="l"
        id="testBtn"
        outlined
        class="ma-2 btn-active-folder"
        :color="activeFolder(name)"
        @click="changeFolder(name)"
      >
        <v-icon left>
          {{
            name === workOn
              ? 'mdi-folder-open-outline'
              : 'mdi-folder-upload-outline'
          }}
        </v-icon>
        {{ name }}
      </v-btn>
      <v-tooltip v-model="showTooltip" nudge-bottom="30" attach=".btn-active-folder">

        <span>This folder is already open !</span>
      </v-tooltip>
    </v-col>

    <v-col cols="11" class="text-center">
      <p :class="{ active: isActive }">
        You have collected {{ GeoJsonTable ? GeoJsonTable.length : '' }} datas
      </p>
      <p v-if="!userAuth">Remember to login or register to save your data !</p>
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
    changeFolder(name) {
      if (name != this.workOn) {
        let confirm = window.confirm(
          'Be sure to save your datas before to switch !'
        )
        confirm ? this.$store.dispatch('switchFolder', name) : ''
      } else {
        this.showTooltip = !this.showTooltip
      }
      // show which folder is on work
      // confirm the change of folder and save your work before change
      // save function: save in the correct folder and update the update time
      // create a new folder
    },
  },
  mounted() {
    this.$store.dispatch('appLoad') // because store does not detect add / delete on object key
  },
}
</script>

<style lang="scss">
</style>
