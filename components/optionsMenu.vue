<template>
  <div>
    <!-- reset otions -->
    <div v-if="removeBtn">
      <p>
        All you coordinates added will be erase. The markers data will be remain
      </p>
      <v-btn @click="removeGeoJson" color="warning">
        Confirm remove data
      </v-btn>
      <p>Coordinates and Markers will be delete</p>
      <v-btn @click="resetApp" color="error"> Reset All </v-btn>
    </div>
    <p v-else>{{ message }}</p>
    <!-- CSV options -->
    <exportCSV v-if="modalExport" />
    <!-- CSV options -->
    <importCSV v-if="modalImport" />
    <!-- Menu -->
    <v-list v-if="showMenu">
      <h2>Settings</h2>
      <v-list-item
        v-for="(item, i) in settings"
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

      <h2>Actions</h2>
      <v-list-item
        v-for="item in actions"
        :key="item.title"
        @click="doThisFunction(item.id)"
      >
        <v-list-item-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title v-text="item.title" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      modalExport: false,
      modalImport: false,
      removeBtn: false,
      message: undefined,
      showMenu: true,
    }
  },
  props: {
    map: Object,
  },
  computed: {
    ...mapState(['userAuth', 'markers']),
    settings() {
      let menu = [
        {
          icon: 'mdi-login',
          title: 'login / Sign-in',
          to: '/account',
        },
        {
          icon: 'mdi-database-eye',
          title: 'Manage My Datas',
          to: '/myData',
        },
        {
          icon: 'mdi-database-marker',
          title: 'Manage My Markers',
          to: '/myConfig',
        },
      ]
      this.userAuth
        ? menu.splice(0, 1, {
            icon: 'mdi-account',
            title: 'My Profil',
            to: '/account',
          })
        : ''
      return menu
    },
    actions() {
      let menu = [
        {
          id: '1',
          icon: 'mdi-file-send-outline',
          title: 'Export Datas to CSV',
        },
        {
          id: '2',
          icon: 'mdi-file-table',
          title: 'Import CSV File',
        },
        {
          id: '3',
          icon: 'mdi-eraser',
          title: 'Reset Options',
        },
        {
          id: '4',
          icon: 'mdi-ruler',
          title: 'Show measure',
        },
      ]
      this.userAuth
        ? menu.push({
            id: '5',
            icon: 'mdi-logout',
            title: 'Logout',
          })
        : ''
      return menu
    },
  },
  methods: {
    ...mapActions(['appReset', 'geoJsonReset']),

    resetApp() {
      let confirm = window.confirm('This action will reset the app')
      if (confirm) {
        this.appReset()
        this.$nuxt.$emit('refresh', {
          id: Math.floor(Math.random()*1000),
        })
      } else {
        console.log('Cancel')
      }
    },
    removeGeoJson() {
      let confirm = window.confirm('This action will delete only your datas')
      if (confirm) {
        this.geoJsonReset()
        this.message = 'datas have been removed successfully'
        this.showMenu = false
        this.removeBtn = false
      } else {
        console.log('Cancel')
      }
    },
    doThisFunction(e) {
      switch (e) {
        case '1':
          this.modalExport = true
          this.showMenu = false
          break
        case '2':
          this.modalImport = true
          this.showMenu = false
          break
        case '3':
          this.removeBtn = true
          this.showMenu = false
          break
        case '4':
          this.showMeasure()
          break
        case '5':
          this.signOut()
          break
      }
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
            this.actions[3].title = 'Show measure'
            this.$emit('send-measure', {
              measure: false,
            })
          } else {
            layer.showMeasurements()
            this.actions[3].title = 'Hide measure'
            this.$emit('send-measure', {
              measure: true,
            })
          }
        }
      })
    },
  },
  mounted() {
    this.map.eachLayer((layer) => {
      if (
        layer instanceof L.Polygon ||
        (layer instanceof L.Path && layer.feature)
      ) {
        // layer feature not undefined ex: L.circleMarker is a layer = show an error. but layer L.circleMarker doesn't have a feature
        if (layer._measurementLayer) {
          this.actions[3].title = 'Hide measure'
        } else {
          this.actions[3].title = 'Show measure'
        }
      }
    })
  },
}
</script>

<style lang="scss" scoped>
h2 {
  border-bottom: 2px solid white;
  padding-bottom: 5px;
}
</style>