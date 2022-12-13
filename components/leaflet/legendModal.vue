<template>
  <v-row class="text-center" v-if="markers && markers.length > 0">
    <edit-menu :showModal="showModal" @send-modal="modalMarker">
      <template v-slot:title>
        <span> Edit my data </span>
      </template>
      <template v-slot:content>
        <edit-marker
          :rulesEditSub="rulesEditSub"
          :editItem="editItem"
          :oldItem="oldItem"
        ></edit-marker>
      </template>
    </edit-menu>

    <v-col v-for="(i, l) in markers" :key="l" order="first">
      <span style="font-size: 15px">{{ i.category }}</span>
      <br />
      <v-icon v-if="i.icon.length > 0" :color="i.color" :size="IconSize">
        mdi-{{ i.icon }}
      </v-icon>
      <v-icon
        v-else-if="i.type === 'Polygon'"
        :color="i.color"
        :size="IconSize"
      >
        mdi-square-outline
      </v-icon>
      <v-icon v-else :color="i.color" :size="IconSize">
        mdi-vector-polyline
      </v-icon>
      <br v-if="i.subCategory && i.subCategory.length > 0" />
      <span
        v-if="i.subCategory && i.subCategory.length > 0"
        style="font-size: 15px"
        >{{ i.subCategory }}</span
      >
      <br />
      <v-icon
        v-show="!showPrintMap"
        color="primary"
        style="padding: 3px"
        @click="removeIcon(i)"
        >mdi-delete-forever-outline</v-icon
      >
      <v-icon
        v-show="!showPrintMap"
        color="primary"
        style="padding: 3px"
        @click="openEditor(i)"
      >
        mdi-pencil-circle-outline
      </v-icon>
    </v-col>
    <v-col cols="12" v-show="!showPrintMap" class="text-left">
      <h3 class="pb-2 my-3">Options</h3>
      <v-slider
        v-model="size"
        color="secondary"
        max="42"
        min="10"
        step="4"
        label="Size of Icons :"
        @change="newSize"
        hide-details
      ></v-slider>
      <v-checkbox
        @change="showMeasure"
        v-model="measureCheckBox"
        :label="`: Show measure`"
        color="secondary"
        hide-details
      ></v-checkbox>
    </v-col>
  </v-row>
  <v-row v-else>
    <v-col>
      <p>You have to create a marker first !</p>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data: () => ({
    showContent: false,
    size: 20,
    showModal: false,
    rulesEditSub: [(v) => v.length > 1 || 'minimum 2 characters'],
    editItem: {},
    oldItem: {},
    measureCheckBox: false,
  }),
  props: {
    showLegend: Boolean,
    showPrintMap: Boolean,
    markers: Array,
    map: Object,
    measureActive: Boolean,
  },
  computed: {
    IconSize() {
      return this.markers.length > 8 ? '20px' : '25px'
    },
  },
  methods: {
    newSize() {
      let elt = document.getElementsByClassName('icon__layer--update--size')
      for (let i of elt) {
        i.style.fontSize = `${this.size}px`
      }
    },
    legend() {
      this.showContent = !this.showContent
    },
    async removeIcon(e) {
      let confirm = window.confirm(`Remove the item ${e.category} ?`)
      if (confirm) {
        let dataStore = {
          old: { id: e.id },
          new: false,
        }
        let res = await this.$store.dispatch('updateMarker', dataStore)
      }
    },
    modalMarker(payload) {
      this.showModal = false
    },

    openEditor(e) {
      if (e.subCategory.length > 0) {
        // if there is subcat
        this.rulesEditSub = [(v) => v.length > 1 || 'minimum 2 characters']
      } else {
        this.rulesEditSub = [true]
      }
      this.editItem = { ...e }
      this.oldItem = { ...e }

      this.showModal = !this.showModal
    },
    showMeasure() {
      this.map.eachLayer((layer) => {
        if (
          layer instanceof L.Polygon ||
          (layer instanceof L.Path && layer.feature)
        ) {
          // layer feature not undefined ex: L.circleMarker is a layer = show an error. but layer L.circleMarker doesn't have a feature
          if (layer._measurementLayer) {
            layer.hideMeasurements()
          } else {
            layer.showMeasurements()
          }
        }
        this.$emit('send-measure', {
          measure: !this.measureActive,
        })
      })
    },
  },
  mounted() {
    this.measureCheckBox = this.measureActive
  },
}
</script>

<style lang="scss">
.items--font {
  font-size: 12px;
}
.block__items {
  padding: 2px;
}
</style>
