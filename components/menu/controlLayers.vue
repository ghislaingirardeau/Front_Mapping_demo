<template>
  <v-menu
    bottom
    :offset-x="true"
    :close-on-content-click="closeOnClick"
    v-model="show"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-icon
        dark
        v-bind="attrs"
        v-on="on"
        :id="'layerBtn' + id"
        @click="animate"
        size="30px"
        :disabled="disableAction"
        color="secondary"
        class="pa-2"
      >
        {{ icon }}
      </v-icon>
    </template>

    <v-list>
      <slot name="content"></slot>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data() {
    return {
      show: false,
    }
  },
  watch: {
    show(newValue, oldValue) {
      if (!newValue) {
        let elt = document.querySelector(`#layerBtn${this.id}`)
        this.animationBtn(elt, 180, 0, true)
      }
    },
  },
  props: {
    icon: String,
    disableAction: Boolean,
    closeOnClick: Boolean,
    id: String
  },
  methods: {
    animate($elt) {
      let elt = document.querySelectorAll('.animationRotateBtn')
        elt.forEach(e => {
          this.animationBtn(e, 180, 0, true)
        })
      this.show ? '' : this.animationBtn($elt.target, 0, 180, false)
    },
  },
}
</script>

<style lang="scss" scoped>
</style>