<template>
  <v-row justify="center">
    <v-dialog
      v-model="showModal"
      persistent
      max-width="590"
      origin="center top"
    >
      <v-card class="modal__content">
        <v-card-title >
            <slot name="title"></slot>        
            <v-spacer></v-spacer>  
            <span @click="close" class="modal__content--close">&times;</span>
        </v-card-title>
        <v-card-text>
            <slot name="content"></slot>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
  export default {
    data () {
      return {
      }
    },
    props: {
        showModal: {
            type: Boolean,
        },
    },
    methods: {
        close() {
            this.$emit("send-modal", {
                message: false,
            });
        },
    },
  }
</script>

<style lang="scss" scoped>

</style>