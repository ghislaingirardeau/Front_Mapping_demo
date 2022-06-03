<template>
  <v-row class="text-center" v-if="markers.length > 0">
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
      <span>{{ i.category }}</span>
      <br />
      <v-icon v-if="i.icon.length > 0" :color="i.color">
        mdi-{{ i.icon }}
      </v-icon>
      <v-chip
        :color="i.color"
        small
        label
        outlined
        v-else-if="i.type === 'Polygon'"
        >area</v-chip
      >
      <v-icon v-else :color="i.color"> mdi-vector-polyline </v-icon>
      <br />
      <span v-if="i.subCategory && i.subCategory.length > 0">{{
        i.subCategory
      }}</span>
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
        style="border: 2px solid teal; padding: 3px"
        @click="openEditor(i)"
      >
        mdi-brush
      </v-icon>
    </v-col>
    <v-col cols="12" v-show="!showPrintMap">
      <v-slider
        v-model="size"
        max="42"
        min="10"
        step="4"
        label="Size"
        @change="newSize"
      ></v-slider>
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
  }),
  props: {
    showLegend: Boolean,
    showPrintMap: Boolean,
    markers: Array,
  },
  computed: {},
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
      console.log(e)
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
      console.log(e)
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
  },
  mounted() {},
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
