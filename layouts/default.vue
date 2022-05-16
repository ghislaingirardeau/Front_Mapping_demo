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
import resetDB from '@/mixins/resetDB.js';
Vue.mixin(resetDB)

export default {
  mixins: [resetDB],
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
main {
    height: 100%;
    width: 100vw;
}
</style>
