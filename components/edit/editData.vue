<template>
  <v-row justify="center" v-if="showModal">
    <v-dialog
      v-model="showModal"
      persistent
      max-width="590"
      origin="center top"
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
          <v-btn color="teal" @click="updateItem"> Save </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
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
    updateItem() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch('updateGeoJson', {
          action: false,
          index: this.editItem, // send the change
        })
        this.close()
        this.$nuxt.$emit('refresh', {
          id: 'refresh'
        })
      }
    },
    close() {
      this.$emit('send-modal', {
        message: false,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
</style>