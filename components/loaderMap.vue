<template>
    <div class="my-4">
      <p class="textWelcome">Loading...</p>
      <div class="loaderPoint" v-for="(i, l) in colorsList" :key="l">
        <v-icon :color="i">{{ icons[l] }}</v-icon>
      </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      colors: ['red', 'blue', 'yellow'],
      icons: ['mdi-map-marker', 'mdi-map-marker-radius', 'mdi-map-marker'],
    }
  },
  computed: {
    colorsList: {
      // getter
      get: function () {
        return this.colors
      },
      // setter
      set: function (newValue) {
        this.colors = newValue
      },
    },
  },
  mounted() {
    let tl = gsap.timeline({
      repeat: -1,
      onRepeat: () => {
        let list = []
        for (let index = 0; index < 3; index++) {
          list[index] = '#' + Math.floor(Math.random() * 16777215).toString(16)
        }
        this.colorsList = list
      },
    })

      tl.from('.loaderPoint', {
        duration: 0.6,
        x: -100,
        opacity: 0,
        stagger: {
          from: 'end',
          amount: 0.2,
        },
        ease: 'power2.out',
      })
      tl.to('.loaderPoint', {
        duration: 0.6,
        x: 100,
        opacity: 0,
        stagger: {
          from: 'end',
          amount: 0.2,
        },
        ease: 'power2.out',
      })
  },
}
</script>

<style lang="scss" scoped>
.loaderPoint {
  display: inline-block;
  width: 35px;
  height: 35px;
}

</style>