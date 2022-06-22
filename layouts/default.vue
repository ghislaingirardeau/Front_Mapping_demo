<template>
  <v-app dark>
    <main v-if="showMap" class="animOnShow" :key="refresh">
      <Nuxt />
    </main>
    <main v-else class="text-center">
      <v-overlay :value="true">
        <loader-map />
      </v-overlay>
    </main>
  </v-app>
</template>

<script>
import Vue from 'vue'
import globalMixins from '~/mixins/globalFunctions.js'
import mapMixins from '~/mixins/mapMixins.js'
import loaderMap from '~/components/loaderMap.vue'
Vue.mixin(globalMixins)
Vue.mixin(mapMixins)

export default {
  components: { loaderMap },
  mixins: [globalMixins, mapMixins],
  data() {
    return {
      showMap: false,
      userName: undefined,
      refresh: 1,
    }
  },
  async created() { //loaderText
    let response = await this.$store.dispatch('keepConnection')
    if (response.user) {
      this.userName = response.user.displayName
    }
    gsap.to('.textWelcome', {
      duration: 1,
      text: { value: this.userName ? `Welcome ${this.userName}` : 'Welcome !' },
      ease: 'none',
      onComplete: () => {
        setTimeout(() => {
          this.showMap = true
        }, 600)
      },
    })

    this.$nuxt.$on('refresh', (payload) => {
      this.refresh++
    })
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
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.animOnShow {
  animation: fadeIn 0.5s ease-in both;
}
.home-enter-active,
.home-leave-active {
  transition: opacity 0.3s;
}
.home-enter,
.home-leave-active {
  opacity: 0;
}
</style>
