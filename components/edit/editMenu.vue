<template>
  <v-row justify="center" v-if="showModal">
    <v-bottom-sheet
      v-model="showModal"
      inset
      persistent
      :scrollable="true"
    >
      <v-card class="modal__content">
        <v-card-title>
            <slot name="title"></slot>
          <v-spacer></v-spacer>
          <span @click="close" class="modal__content--close">&times;</span>
        </v-card-title>
        <v-card-text>
            <slot name="content"></slot>
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
  },
  methods: {
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