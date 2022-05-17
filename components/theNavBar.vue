<template>
  <v-container class="mt-3">
    <v-row>
      <v-app-bar dark class="px-4 ma-3">
        <v-btn color="teal" @click="linkMap" class="mr-3">
          <v-icon>mdi-map-outline</v-icon>
        </v-btn>

        <v-spacer></v-spacer>
        <v-icon
          v-for="(link, i) in navItems"
          :key="i"
          color="teal"
          class="mx-5"
          size="38px"
          @click="$router.push(link.to)"
          >{{ link.icon }}</v-icon
        >
      </v-app-bar>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    items: [
      {
        icon: 'mdi-database-eye',
        title: 'My Datas',
        to: '/myData',
      },
      {
        icon: 'mdi-database-marker',
        title: 'My Markers',
        to: '/myConfig',
      },
      {
        icon: 'mdi-account-box-outline',
        title: 'Log / sign Up',
        to: '/sign',
      },
    ],
  }),
  computed: {
    navItems() {
      return this.items.filter((elt) => elt.to != this.$route.path)
    },
  },
  methods: {
    linkMap() {
      this.$router.push('/')
    },
  },
}
</script>

<style lang="scss" scoped>
</style>