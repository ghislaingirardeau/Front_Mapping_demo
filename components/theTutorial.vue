<template>
    <div id="helpModal" class="modal_help">
      <div class="modal_action">
        <span class="modal_action-close">&times;</span>
        <button
          class="modal_action-btn"
          @click="changeTuto"
        >
          {{ tutoPage === 5 ? 'End' : 'Next' }}
        </button>
      </div>


      <div class="modal_tuto">
        <div
          class="modal_tuto-marker"
          v-if="tutoPage === 1"
        >
          <h2>&#60-- Create a marker</h2>
          <p>The marker will also be your layer name, you can add sub category to your layer</p>
        </div>
        <div
          class="modal_tuto-options"
          v-show="tutoPage === 2"
        >
          <h2>&#60-- Settings & Options</h2>
          <p>Manage your datas, markers. Export/Import to CSV file. Options : Reset and show measure</p>
        </div>

        <div
          class="modal_tuto-actions"
          v-if="tutoPage === 3"
        >
          <div v-for="(item, l) in tutorialsAction" :key="l">
            <span class="modal_tuto-actions-title">
              {{item.title}}
            </span>
            <p>
              {{item.text}}
            </p>
          </div>
        </div>
        <div
          class="modal_tuto-data"
          v-if="tutoPage === 4"
        >
          <div v-for="(item, l) in tutorialData" :key="l" :style="{ 'margin-bottom': item.margin }">
            <span class="modal_tuto-data-title">
              {{item.title}}
            </span>
            <p>
              {{item.text}}
            </p>
          </div>
        </div>
        <div
          class="modal_tuto-edit"
          v-show="tutoPage === 5"
        >
          <v-icon size="46px" id="anim-tuto-marker" class="mb-3">mdi-map-marker-radius-outline</v-icon>
          <arrow-tuto/>
          <span class="modal_tuto-data-title">Click on any marker, to edit it :</span>
          <p>Move location, change name, edit icon, color...</p>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      tutorialsAction: [
        {
          title: 'My location -->',
          text: 'Find my position',
        },
        {
          title: 'Track me -->',
          text: 'Track my position',
        },
        {
          title: 'Add manualy -->',
          text: 'Add one or multiple point',
        },
      ],
      tutoPage: 1,
    }
  },
  props: {
    showTutorial: Boolean,
  },
  watch: {
    showTutorial(newValue) {
      newValue ? this.helpModal() : ''
    },
    tutoPage(newValue) {
      if (newValue === 5) {
        gsap.from("#anim-tuto-marker", {
          duration: 1.4,
          y: -80,
          opacity: 0,
          ease: 'elastic.out(1, 0.3)',
        })
      } 
    }
  },
  computed: {
    tutorialData() {
      let items = [
        {
          title: '<-- Show legend',
          text: 'Edit marker and size',
          margin: '3px',
        },
        {
          title: '<-- Save datas',
          margin: '60px',
        },
        {
          title: '<-- Layers map',
          text: 'Change the map layer',
          margin: '10px',
        },
      ]
      if (this.$vuetify.breakpoint.width > 990) {
        items.splice(1, 0, {
          title: '<-- Print or save as PDF',
          margin: '3px',
        })
      }
      if (Object.keys(this.$store.state.GeoJsonDatas).length > 0) {
        let index = items.length
        items.splice(index, 0, {
          title: '<-- layers views',
          margin: '3px',
        })
      }
      return items
    },
  },
  methods: {
    helpModal() {
      // affiche un message lors du click
      var modal = document.getElementById('helpModal')
      var span = document.getElementsByClassName('modal_action-close')[0]

      const resetModal = (display, span, reverse) => {
        display.animate(
          [
            { opacity: `${reverse ? 1 : 0}` },
            { opacity: `${reverse ? 0 : 1}` },
          ],
          {
            duration: 400,
            fill: 'both',
          }
        )
        span.animate(
          [
            { transform: `rotateZ(${reverse ? 0 : -90}deg)` },
            { transform: `rotateZ(${reverse ? -90 : 0}deg)` },
          ],
          {
            duration: 400,
            fill: 'both',
          }
        )
        window.setTimeout(
          () => {
            display.style.display = reverse ? 'none' : 'block'
          },
          reverse ? 350 : 0
        )
      }

      resetModal(modal, span, false)

      let element = document.getElementsByClassName('animationOpacityBtn')
      span.onclick = () => {
        resetModal(modal, span, true)
        this.$emit('send-tuto', {
          message: false,
        })
        this.animTutoBtn(element[0], true)
      }
      window.onclick = (event) => {
        if (event.target == modal) {
          resetModal(modal, span, true)
          this.animTutoBtn(element[0], true)
        }
        this.$emit('send-tuto', {
          message: false,
        })
      }
    },
    changeTuto() {
      this.tutoPage === 5 ? (this.tutoPage = 1) : this.tutoPage++
    },
  },
}
</script>

<style lang="scss" scoped>
// STYLE THE MODAL
/* The Modal (background) */
.modal_help {
  display: none; /* Hidden by default */
  opacity: 0;
  position: fixed; /* Stay in place */
  z-index: 3; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.6); /* Black w/ opacity */
  font-family: 'Architects Daughter', cursive;
}

/* Modal Content/Box */

.modal_tuto {
  z-index: 4;
  position: relative;
  &-title {
    position: absolute;
    text-align: left;
    left: 80px;
    top: 400px;
    color: rgb(255, 255, 255);
    width: 40%; /* Could be more or less, depending on screen size */
  }
  &-marker {
    position: absolute;
    text-align: left;
    left: 80px;
    top: 200px;
    color: rgb(255, 255, 255);
    width: 65%; /* Could be more or less, depending on screen size */
  }
  &-options {
    position: absolute;
    text-align: left;
    left: 80px;
    top: 65px;
    color: rgb(255, 255, 255);
    width: 65%; /* Could be more or less, depending on screen size */
  }
  &-actions {
    position: absolute;
    text-align: right;
    right: 70px;
    top: 15px;
    color: rgb(255, 255, 255);
    width: 50%; /* Could be more or less, depending on screen size */
    &-title {
      font-size: 20px;
      font-weight: bold;
    }
  }
  &-data {
    position: absolute;
    text-align: left;
    left: 80px;
    top: 100px;
    color: rgb(255, 255, 255);
    font-size: 14px;
    width: 50%; /* Could be more or less, depending on screen size */
    &-title {
      font-size: 16px;
      font-weight: bold;
    }
  }
  &-edit {
    position: absolute;
    left: 30%;
    top: 200px;
    width: 55%;
    & > i {
      display: block;
    }
  }
}

/* The Close Button */
.modal_action {
  &-close {
    z-index: 4;
    position: absolute;
    left: 3px;
    top: -17px;
    width: 60px;
    color: rgb(255, 255, 255);
    text-align: center;
    font-size: 62px;
    font-weight: bold;
    &:hover,
    &:focus {
      color: rgb(151, 151, 151);
      text-decoration: none;
      cursor: pointer;
    }
  }
  &-btn {
    z-index: 4;
    position: absolute;
    left: 60px;
    top: 10px;
    font-size: 20px;
    padding: 6px 8px;
    border: 2px white solid;
    border-radius: 4px 4px;
  }
}
@media screen and (min-width: 990px) {
  .modal_tuto {
    &-actions {
      right: 160px;
    }
    &-title {
      left: 170px;
    }
    &-marker {
      left: 170px;
      top: 250px;
    }
    &-options {
      left: 170px;
    }
    &-data {
      left: 170px;
    }
  }
  .modal_action {
    padding-left: 100px;
  }
}

@media screen and (min-width: 1400px) {
  .modal_tuto {
    &-actions {
      right: 280px;
    }
    &-title {
      left: 280px;
    }
    &-marker {
      left: 280px;
    }
    &-options {
      left: 280px;
    }
    &-data {
      left: 280px;
    }
  }
}
</style>