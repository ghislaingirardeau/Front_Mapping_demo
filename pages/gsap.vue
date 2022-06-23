<template>
  <v-row>
    <v-col cols="12">
      <v-btn @click="animate">gsap</v-btn>
      <v-btn @click="control(true)">resume</v-btn>
      <v-btn @click="control(false)">pause</v-btn>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="motionPath"></div>
      <p class="textPlugin">xxxxxxxxxxxxxxxxxxxxxxx</p>
      <v-btn @click="textGsap">textGsap</v-btn>
      <v-btn @click="motionGsap">motionGsap</v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      tl: undefined,
    }
  },
  methods: {
    animate() {
      this.tl.to('.circle', {
        x: 300,
        duration: 4,
        stagger: 0.5,
        backgroundColor: 'blue',
        ease: 'back.out(1.7)',
      })
      this.tl.to('.motionPath', {
        motionPath: {
          path: [
            { x: 100, y: 50 },
            { x: 200, y: 0 },
            { x: 300, y: 100 },
          ],
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
          end: 1.5,
        },
        transformOrigin: '50% 50%',
        duration: 5,
        ease: 'power1.inOut',
        onComplete: () => {
          console.log('complete')
        },
      })
    },
    control(e) {
      e ? this.tl.resume() : this.tl.pause()
    },
    textGsap() {
      gsap.to('.textPlugin', {
        duration: 2,
        text: { value: 'This is my text animation' },
        ease: 'none',
      })
    },
    motionGsap() {
      gsap.to('.motionPath', {
        motionPath: {
          path: "M 0 0 C 2 1 39 -15 65 -3 C 104 -4 57 -25 95 -70",
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
          end: 1,
        },
        transformOrigin: '50% 50%',
        duration: 5,
        ease: 'power1.inOut',
        repeat: 2,
        yoyo: true,
        onComplete: () => {
          console.log('complete')
        },
      })
    },
  },
  mounted() {
    // if anim multiple element, timeline start when the other one stop
    this.tl = gsap.timeline({ repeat: 2, yoyo: true })
    // observer plugin on scroll or touch
    Observer.create({
      target: window,
      type: 'wheel,touch',
      onUp: () => this.control(false),
      onDown: () => this.control(true),
    })
  },
}
</script>

<style lang="scss" scoped>
.circle {
  width: 80px;
  height: 80px;
  border: 2px solid red;
  border-radius: 100%;
}
.motionPath{
  width: 20px;
  height: 20px;
  background-color: blue;
}

</style>