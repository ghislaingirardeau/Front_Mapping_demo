<template>
  <v-row justify="center" v-if="showModal">
    <v-bottom-sheet
      v-model="showModal"
      inset
      persistent
    >
      <v-card class="modal__content">
        <v-card-title>
          Edit Item
          <v-spacer></v-spacer>
          <span @click="close" class="modal__content--close">&times;</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="editItem.properties.name"
              label="name"
              :rules="rulesName"
              required
            >
            </v-text-field>
            <v-text-field v-model="editItem.properties.popupContent" label="details">
            </v-text-field>
          </v-form>
          <v-spacer></v-spacer>
          <v-btn outlined color="primary" @click="updateItem(true)"> Save </v-btn>
          <v-btn outlined v-if="editItem.geometry.type" color="secondary" @click="moveItem"> Move </v-btn>
          <v-btn outlined v-if="editItem.geometry.type && editItem.geometry.type != 'Point'" color="secondary" @click="addItem"> add </v-btn>
          <v-btn outlined color="rgb(243, 129, 129)" @click="updateItem(false)"> Remove </v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      valid: true,
      rulesName: [(v) => v.length >= 2 || 'Mininum 2 characters'],
    }
  },
  props: {
    showModal: Boolean,
    editItem: Object
  },
  methods: {
    updateItem(action) {
      const refresh = () => {
        this.close()
        this.$nuxt.$emit('refresh', {
          id: 'refresh'
        })
      }

      if (this.$refs.form.validate() && action) {
        this.$store.dispatch('updateGeoJson', {
          action: false,
          index: this.editItem.properties,
        })
        refresh()
        
      } else if(!action) {
        this.$store.dispatch('updateGeoJson', {
          action: !action,
          index: this.editItem.properties,
        })
        refresh()
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
        id: this.editItem.properties.id
      })
    },
    close() {
      this.$emit('send-modal', {
        message: 'close',
      })
    },
  },
  mounted () {
  },
}
</script>

<style lang="scss" scoped>
</style>