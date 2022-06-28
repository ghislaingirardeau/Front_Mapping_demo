<template>
  <v-row>
    <v-col cols="12">
      <v-btn @click="animate">gsap</v-btn>
      <v-btn @click="control(true)">resume</v-btn>
      <v-btn @click="control(false)">pause</v-btn>
      <v-btn @click="controlStop()">stop</v-btn>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="motionPath"></div>
      <p class="textPlugin">xxxxxxxxxxxxxxxxxxxxxxx</p>
      <v-btn @click="textGsap">textGsap</v-btn>
      <v-btn @click="motionGsap">motionGsap</v-btn>
      <v-icon color="primary" @click="testAnim" class="rotateIcon">mdi-map-marker</v-icon>
      <v-icon color="secondary" @click="testAnim2" class="rotateIcon2">mdi-map-marker</v-icon>
      <v-btn @click="stopOrigin">stopOrigin</v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      tl: undefined,
      index: 1,
      interval: undefined,
      backToStart: false,
      animeBtnLocation: undefined,
    }
  },
  methods: {
    testAnim2() {
      this.animeBtnLocation = gsap.to(".rotateIcon2", {duration: 1, rotateZ: 360, repeat: -1, yoyo: true});
      
      this.index = 0
      this.interval = setInterval(() => {
        this.index++
        console.log(this.index);
        if (this.index == 6) {
          this.animeBtnLocation.pause();
          this.animeBtnLocation.invalidate(); 
          this.animeBtnLocation = gsap.to(".rotateIcon2", {duration: 1, rotateZ: 0, onComplete:function(){
            console.log(this.targets()[0])
          }});
        }
        if (this.index == 10) {
          this.animeBtnLocation = gsap.to(".rotateIcon2", {duration: 1, scale: 0.8, repeat: -1, yoyo: true});
        }
        
      }, 700); 
    },
    stopOrigin() {
      this.animeBtnLocation.pause()
      this.animeBtnLocation.invalidate();
      gsap.to(".rotateIcon2", {duration: 1, scale: 1});
      clearInterval(this.interval)
    },
    animate() {
      this.tl.to('.circle', {
        x: 300,
        duration: 1,
        backgroundColor: 'blue',
        ease: 'back.out(1.7)',
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
        duration: 2,
        ease: 'power1.inOut',
        repeat: 10,
        yoyo: true,
        onComplete: () => {
          console.log('complete')
        },
      })
    },
    async controlStop(backToStart) {
      this.backToStart = !this.backToStart
      console.log(this.backToStart);
      const stop = () => {
        return new Promise((resolve, reject) => {
          let repeats = Math.floor(this.tl.totalTime() / this.tl.duration());
            if (repeats % 2 === 0) { 
              repeats += 1;
            }
            this.tl.repeat(repeats)
          clearInterval(this.interval)
          resolve(true)
          
        });
      }
      let res = await stop()
      if(res && this.backToStart) {
        this.tl = gsap.timeline({ 
          repeat: -1, 
          yoyo: true 
        })
        this.tl.to('.rotateIcon', {
            scale: 0.8,
            duration: 1,
            delay: 0.5,
            ease: 'none',
        })
      }
      
    },
    testAnim($event) {
      this.tl = gsap.timeline({ 
        repeat: -1, 
        yoyo: true 
      })
      this.tl.to('.rotateIcon', {
          rotateZ: 280,
          duration: 1,
          ease: 'none',
      })
      this.index = 0
      this.interval = setInterval(() => {
        this.index++
        console.log(this.index);
        if (this.index == 6) {
          this.controlStop()     
        }
        
      }, 700); 
      
      
    }
  },
  mounted() {
    // if anim multiple element, timeline start when the other one stop
    /* this.tl = gsap.timeline({ repeat: -1, yoyo: true }) */
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
@keyframes rotate {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(360deg);
  }
}
@keyframes rotateBack {
  from {
    transform: rotateZ(180deg);
  }
  to {
    transform: rotateZ(0deg);
  }
}
/* .rotateIcon {
  animation: rotate 1s 1s ease infinite both;
}
.backToOrigin {
  animation: rotateBack 1s 1s ease forwards;
}
 */</style>