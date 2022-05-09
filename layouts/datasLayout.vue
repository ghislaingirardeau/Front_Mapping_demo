<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :clipped="clipped"
      temporary
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
          
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-row align="center" justify="space-between">
        <v-col cols="2">
          <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        </v-col>
        <v-col cols="5" class="text-sm-center">
          <v-btn color="primary" @click="linkMap">
            <v-icon>mdi-map-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>

    </v-app-bar>
    
    <v-main>
      <v-container>
        <Nuxt keep-alive />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-database-eye',
          title: 'Manage My Datas',
          to: '/myData'
        },
        {
          icon: 'mdi-database-marker',
          title: 'Manage My Markers',
          to: '/configuration'
        },
        {
          icon: 'mdi-database-marker',
          title: 'Authentification',
          to: '/authentification'
        }

      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js'
    }
  },
  methods: {
    linkMap() {
      this.$router.push('/')
    },
  },
}
</script>

<style lang="scss">
</style>
