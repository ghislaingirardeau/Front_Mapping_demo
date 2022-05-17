<template>
  <v-app dark>
    <main v-if="showMap">
        <Nuxt />
    </main>
    <main v-else>
      <v-overlay :value="overlay">
        <v-progress-circular
          indeterminate
          size="64"
        ></v-progress-circular>
    </v-overlay>
    </main>
  </v-app>
</template>

<script>
import Vue from 'vue'
import sign from '~/mixins/sign.js';
Vue.mixin(sign)

export default {
  mixins: [sign],
  data () {
    return {
      showMap: false,
      overlay: true
    }
  },
  async created () {
    let response = await this.$store.dispatch('keepConnection')
    if (response) {
      this.overlay = false
      this.showMap = true
    }
  },

}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap');
main {
    height: 100%;
    width: 100vw;
    font-family: 'Architects Daughter', cursive;
}
</style>
