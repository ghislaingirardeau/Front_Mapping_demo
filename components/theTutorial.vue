<template>
    <div id="helpModal" class="modal_help">
      <div class="modal_action">
        <span class="modal_action-close">&times;</span>
        <button
          class="modal_action-btn"
          @click="changeTuto"
        >
          {{ tutoPage === 4 ? 'End' : 'Next' }}
        </button>
      </div>
      <div class="modal_tuto">
        <h1 class="modal_tuto-title">Steps {{tutoPage}}</h1>
        <div
          class="modal_tuto-marker"
          v-if="tutoPage === 1"
        >
          <h2>&#60-- Create a marker</h2>
          <p>The marker will also be your layer name, you can add sub category to your layer</p>
        </div>
        <div
          class="modal_tuto-options"
          v-if="tutoPage === 2"
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
          <p
            v-for="item in tutorialData"
            :key="item.message"
            :style="{ 'margin-bottom': item.margin }"
          >
            {{ item.message }}
          </p>
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
          text: 'Wait and find my position',
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
  },
  computed: {
    tutorialData() {
      let items = [
        {
          message: '<-- Show legend',
          margin: '22px',
        },
        {
          message: '<-- Save datas',
          margin: '40px',
        },
      ]
      if (this.$vuetify.breakpoint.width > 990) {
        items.splice(1, 0, {
          message: '<-- Print or save as PDF',
          margin: '22px',
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
      modal.style.display = 'block'
      const resetModal = (display) => {
        display.style.display = 'none'
      }
      span.onclick = () => {
        resetModal(modal)
        this.$emit('send-tuto', {
          message: false,
        })
      }
      window.onclick = (event) => {
        if (event.target == modal) {
          resetModal(modal)
        }
        this.$emit('send-tuto', {
          message: false,
        })
      }
    },
    changeTuto() {
      this.tutoPage === 4 ? (this.tutoPage = 1) : this.tutoPage++
    },
  },
}
</script>

<style lang="scss" scoped>
// STYLE THE MODAL
/* The Modal (background) */
.modal_help {
  display: none; /* Hidden by default */
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
  position: relative;
  &-title {
    position: absolute;
    text-align: left;
    left: 80px;
    top: 10px;
    color: rgb(255, 255, 255);
    width: 40%; /* Could be more or less, depending on screen size */
  }
  &-marker {
    position: absolute;
    text-align: left;
    left: 80px;
    top: 200px;
    color: rgb(255, 255, 255);
    width: 75%; /* Could be more or less, depending on screen size */
  }
  &-options {
    position: absolute;
    text-align: left;
    left: 80px;
    top: 65px;
    color: rgb(255, 255, 255);
    width: 75%; /* Could be more or less, depending on screen size */
  }
  &-actions {
    position: absolute;
    text-align: right;
    right: 80px;
    top: 85px;
    color: rgb(255, 255, 255);
    width: 60%; /* Could be more or less, depending on screen size */
    &-title {
      font-size: 20px;
      font-weight: bold;
    }
  }
  &-data {
    position: absolute;
    text-align: left;
    left: 80px;
    top: 110px;
    color: rgb(255, 255, 255);
    width: 60%; /* Could be more or less, depending on screen size */
  }
}

/* The Close Button */
.modal_action {
  &-close {
    position: absolute;
    left: 20px;
    top: -10px;
    width: 90%;
    color: rgb(255, 255, 255);
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
    position: absolute;
    right: 5%;
    top: 10px;
    font-size: 24px;
    padding: 8px 10px;
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