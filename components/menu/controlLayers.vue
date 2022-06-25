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
        // to alternate the animation of the icon
        let elt = document.querySelectorAll('.animationRotateBtn')
        elt.length === 2 && !this.closeOnClick //if
          ? this.animationBtn(elt[1], 180, 0, true)
          : elt.length === 2 && this.closeOnClick // else if
          ? this.animationBtn(elt[0], 180, 0, true)
          : elt.length === 1 // else if
          ? this.animationBtn(elt[0], 180, 0, true)
          : ''
      }
    },
  },
  props: {
    icon: String,
    disableAction: Boolean,
    closeOnClick: Boolean,
  },
  methods: {
    animate($elt) {
      this.show ? '' : this.animationBtn($elt.target, 0, 180, false)
    },
  },
}
</script>

<style lang="scss" scoped>
</style>