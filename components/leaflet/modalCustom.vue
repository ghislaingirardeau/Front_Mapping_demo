<template>
  <v-row justify="center">
    <v-dialog
      v-model="showModal"
      persistent
      max-width="590"
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
        dialog: false,
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
.modal__content {
    font-family: "Architects Daughter", cursive;
    &--close{
        cursor: pointer;
        font-size: 42px;
    }
}
</style>