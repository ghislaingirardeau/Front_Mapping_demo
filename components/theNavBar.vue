<template>
  <v-col cols="12" md="11">
    <v-app-bar dark class="px-4">
      <v-btn color="primary" @click="linkMap" class="mr-3">
        <v-icon>mdi-map-outline</v-icon>
      </v-btn>

      <v-spacer></v-spacer>
      <v-tooltip bottom v-for="(link, i) in navItems" :key="i">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            color="primary"
            v-bind="attrs"
            v-on="on"
            class="mx-7"
            size="38px"
            @click="$router.push(link.to)"
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
        to: '/myData',
      },
      {
        icon: 'mdi-database-marker',
        title: 'My Markers',
        to: '/myConfig',
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