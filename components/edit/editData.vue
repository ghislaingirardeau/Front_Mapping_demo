<template>
  <div>
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
      <span>
        Created the {{ editItem.properties.time.replaceAll(/[A-z]/g, ' ') }} in
        the layer name : {{ editItem.properties.category }}
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
        <v-btn
          outlined
          fab
          color="third"
          @click="updateItem(false)"
        >
          <v-icon>mdi-delete-forever-outline </v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
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
    editItem: Object,
  },
  methods: {
    updateItem(action) {
      const refresh = () => {
        this.refreshMap()
      }

      if (this.$refs.form.validate() && action) {
        this.$store.dispatch('updateGeoJson', {
          action: false,
          index: this.editItem.properties,
        })
        refresh()
      } else if (!action) {
        let confirm = window.confirm('Remove this item ?')
        if (confirm) {
          this.$store.dispatch('updateGeoJson', {
            action: !action,
            index: this.editItem.properties,
          })
        }
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
        id: this.editItem.properties.id,
      })
    },
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
</style>