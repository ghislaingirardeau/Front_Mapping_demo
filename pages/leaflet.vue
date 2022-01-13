<template>
  <v-row>
    <v-col class="text-center">
      <h1>get my location</h1>
      <v-btn color='primary' @click="findMe">find me</v-btn>

      <p>{{message}}</p>
      <p>Ma position actuelle: {{myLocation}}</p>
      <a :href="toMap" v-if="toMap">look the map to see the position</a>


      <v-btn color='primary' @click="followMe">follow me</v-btn>
      <v-btn color='primary' @click="stopFollowMe">Stop follow me</v-btn>
      <p>Mes coordonnées de déplacement: {{watchPosition}}</p>


      <v-btn color='primary' @click="showStorage">showStorage</v-btn>
      <h2>{{localData}}</h2>
      <h2>{{localDataWatched}}</h2>

    <leafletMobile />

    </v-col>
  </v-row>
</template>

<script>
import leafletMobile from '~/components/leaflet/leafletMobile.vue'

export default {
  data() {
    return{
      myLocation: undefined,
      message: undefined,
      toMap: undefined,
      localData: undefined,
      localDataWatched: undefined,
      watchId: 0,
      watchPosition: []
    }
  },
  components: {
      leafletMobile
  },
  methods: {
    showStorage() {
      this.localData = localStorage.getItem('location')
      this.localDataWatched = localStorage.getItem('locationWatched')
    },
    findMe() {
      let success = (position) => {
        this.myLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        this.toMap = `https://www.openstreetmap.org/#map=18/${position.coords.latitude}/${position.coords.longitude}`
        this.message = ''
        localStorage.setItem('location', `accuracy: ${position.coords.accuracy}, lat: ${this.myLocation.latitude}, lng: ${this.myLocation.longitude}`)
      }

      let error = () => {
        this.message = 'Unable to retrieve your location';
      }

      if (navigator.geolocation) {
        this.message = 'Locating...'
        navigator.geolocation.getCurrentPosition(success, error, {
          enableHighAccuracy: true,
          maximumAge: 0
        })

      } else {
        this.message = 'Geolocation is not supported by your browser'
      }
    },
    followMe() {
      let success = (position) => {
        console.log(position.coords)
        this.watchPosition.push({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      }

      let error = () => {
        this.message = 'Unable to retrieve your location';
      }

      if (navigator.geolocation) {
        this.message = 'Locating...'
        this.watchId = navigator.geolocation.watchPosition(success, error, {
          enableHighAccuracy: true,
          maximumAge: 0
        })
      } else {
        this.message = 'Geolocation is not supported by your browser'
      }
    },
    stopFollowMe() {
        localStorage.setItem('locationWatched', JSON.stringify(this.watchPosition))
        navigator.geolocation.clearWatch(this.watchId);
    }
  },
}
</script>