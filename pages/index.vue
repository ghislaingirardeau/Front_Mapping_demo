<template>
  <v-row>
    <v-col class="text-center">
      <h1>get my location</h1>
      <v-btn color='primary' @click="findMe">find me</v-btn>

      <p>{{message}}</p>
      <p>{{myLocation}}</p>
      <a :href="toMap" v-if="toMap">my position</a>


      <v-btn color='primary' @click="showStorage">showStorage</v-btn>
      <h2>{{localData}}</h2>


    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return{
      myLocation: undefined,
      message: undefined,
      toMap: undefined,
      localData: undefined
    }
  },
  computed: {
    /* myposition() {
      navigator.geolocation.watchPosition((position) => {
          this.myLocation.push(position.coords.latitude)
          this.myLocation.push(position.coords.longitude)      
      })
      return this.myLocation
      `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`
    } */
  },
  methods: {
    showStorage() {
      this.localData = localStorage.getItem('location')
    },
    findMe() {
      let success = (position) => {
        this.myLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        this.toMap = `https://www.openstreetmap.org/#map=18/${position.coords.latitude}/${position.coords.longitude}`
        this.message = ''
        localStorage.setItem('location', `lat: ${this.myLocation.latitude}, lng: ${this.myLocation.longitude}`)
      }

      let error = () => {
        this.message = 'Unable to retrieve your location';
      }

      if (navigator.geolocation) {
        this.message = 'Locating...'
        navigator.geolocation.getCurrentPosition(success, error)

      } else {
        this.message = 'Geolocation is not supported by your browser'
      }
    }
  },
}
</script>