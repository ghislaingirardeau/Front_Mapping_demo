<template>
  <v-col :cols="themeDarkColor ? '6' : undefined" :class="themeDarkColor ? 'legend__bloc' : ''">
    <v-row class="text-center">
      <v-col v-for="(i, l) in markers" :key="l" order="first">
        <span>{{i.category}}</span>
        <br>
        <v-icon v-if="i.icon.length > 0" :color="i.color[0]"> mdi-{{i.icon}} </v-icon>
        <v-chip :color="i.color[0]" small label outlined v-else-if="i.type === 'Polygon'">area</v-chip>
        <v-icon v-else :color="i.color[0]"> mdi-vector-polyline </v-icon>
        <br>
        <span v-if="i.subCategory.length > 0">{{i.subCategory[0]}}</span>
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: () => ({
    showContent: false,
  }),
  props: {
    showLegend: Boolean,
    themeDarkColor: Boolean
  },
  computed: {
    ...mapState(['markers'])
  },
  methods: {
    legend() {
      this.showContent = !this.showContent;
    },
  },
  mounted () {
    this.$store.dispatch('loadMarkers')
  }
};
</script>

<style lang="scss">
.legend__bloc {
  border: 2px solid grey;
}
.items--font {
  font-size: 12px;
}
.block__items {
  padding: 2px;
}
</style>
