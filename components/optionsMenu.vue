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

export default {
  data() {
    return {
      modalExport: false,
      modalImport: false,
      removeBtn: false,
      message: undefined,
      showMenu: true,
      settings: [
        {
          icon: 'mdi-database-eye',
          title: 'Manage My Datas',
          to: '/myData',
        },
        {
          icon: 'mdi-database-marker',
          title: 'Manage My Markers',
          to: '/configuration',
        },
      ],
      actions: [
        {
          id: '1',
          icon: 'mdi-export',
          title: 'Export Datas to CSV',
        },
        {
          id: '2',
          icon: 'mdi-import',
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
      ],
    }
  },
  props: {
    map: Object,
  },
  methods: {
    async resetApp() {
      this.resetDB()
      localStorage.removeItem('APIGeoMap')
      location.reload()
    },
    removeGeoJson() {
      localStorage.removeItem('APIGeoMap')
      this.message = 'datas have been removed successfully'
      this.showMenu = false
      this.removeBtn = false
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
          } else {
            layer.showMeasurements()
            this.actions[3].title = 'Hide measure'
          }
        }
      })
    },
  },
  mounted () {
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