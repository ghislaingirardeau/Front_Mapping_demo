<template>
  <div>
    <v-overlay :value="overlay">
      <loader-map />
    </v-overlay>
    <v-form ref="form" v-model="valid" lazy-validation class="mb-3">
      <v-text-field
        v-model="editItem.properties.name"
        label="name"
        :rules="rulesName"
        required
      >
      </v-text-field>
      <v-text-field v-model="editItem.properties.popupContent" label="details">
      </v-text-field>
      <v-switch
        v-if="folderList.length > 0"
        v-model="showFolderSelection"
        color="secondary"
        label="Transfer to folder"
      ></v-switch>
      <v-select
        v-if="showFolderSelection"
        v-model="folderSelected"
        :items="folderList"
        color="secondary"
        label="Select"
      ></v-select>
      <span>
        Created the {{ editItem.properties.time.replaceAll(/[A-z]/g, ' ') }} in
        the layer name : {{ editItem.properties.category }}, in {{workOn}}
      </span>
    </v-form>
    <v-spacer></v-spacer>
    <v-row justify="space-between" class="text-center">
      <v-col cols="3">
        <v-btn outlined fab color="primary" @click="updateItem(true)">
          <v-icon>mdi-content-save-check-outline </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="3" v-if="editItem.geometry.type">
        <v-btn outlined fab color="secondary" @click="moveItem">
          <v-icon>mdi-arrow-all </v-icon>
        </v-btn>
      </v-col>
      <v-col
        cols="3"
        v-if="editItem.geometry.type && editItem.geometry.type != 'Point'"
      >
        <v-btn outlined fab color="secondary" @click="addItem">
          <v-icon>mdi-map-marker-plus-outline </v-icon>
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn outlined fab color="third" @click="updateItem(false)">
          <v-icon>mdi-delete-forever-outline </v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      overlay: false,
      valid: true,
      rulesName: [(v) => v.length >= 2 || 'Mininum 2 characters'],
      folderSelected: undefined,
      showFolderSelection: false,
    }
  },
  props: {
    editItem: Object,
  },
  computed: {
    ...mapGetters(['workOn', 'foldersName']),
    folderList() {
      const otherFolders = this.foldersName.filter((e) => e != this.workOn)
      this.folderSelected = otherFolders[0]
      return otherFolders
    },
  },
  methods: {
    async updateItem(action) {
      if (this.$refs.form.validate() && action) {
        this.overlay = true
        const result = await this.$store.dispatch('updateGeoJson', {
          action: false,
          data: this.editItem.properties,
          from: this.workOn,
          to: this.folderSelected,
          switch: this.showFolderSelection
        })
        result ? this.refreshMap() : ''
        
      } else if (!action) {
        // click on remove
        let confirm = window.confirm('Remove this item ?')
        if (confirm) {
          this.$store.dispatch('updateGeoJson', {
            action: !action,
            data: this.editItem.properties,
          })
        }
        this.refreshMap()
      }
    },
    moveItem() {
      this.$emit('send-modal', {
        message: 'move',
      })
    },
    addItem() {
      this.$emit('send-modal', {
        message: 'add',
        id: this.editItem.properties.id,
      })
    },
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
</style>