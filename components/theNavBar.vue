<template>
  <v-col cols="12" md="11">
    <v-app-bar dark class="px-4">
      <v-btn color=" third" @click="linkMap" class="mr-3" aria-label="To map" role="img" aria-hidden="false">
        <v-icon>mdi-map-outline</v-icon>
      </v-btn>

      <v-spacer></v-spacer>
      <v-tooltip bottom v-for="(link, i) in navItems" :key="i">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            color="third"
            v-bind="attrs"
            v-on="on"
            class="mx-7"
            size="38px"
            @click="$router.push(link.to)"
            :aria-label="link.to" role="img" aria-hidden="false"
            >{{ link.icon }}</v-icon
          >
        </template>
        <span>{{ link.title }}</span>
      </v-tooltip>
    </v-app-bar>
  </v-col>
</template>

<script>
export default {
  data: () => ({
    items: [
      {
        icon: 'mdi-database-eye',
        title: 'My Datas',
        to: '/datas',
      },
      {
        icon: 'mdi-database-marker',
        title: 'My Markers',
        to: '/configuration',
      },
      {
        icon: 'mdi-account-box-outline',
        title: 'Sign',
        to: '/account',
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