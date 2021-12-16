<template>
  <v-row>
    <v-col class="text-center">
      <h1>get my location</h1>
      <v-btn color='primary' @click="findMe">find me</v-btn>

      <p>{{message}}</p>
      <p>{{myLocation}}</p>

      <a :href="toMap" v-if="toMap">my position</a>

    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return{
      myLocation: undefined,
      message: undefined,
      toMap: undefined
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
    findMe() {
      let success = (position) => {
        this.myLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        this.toMap = `https://www.openstreetmap.org/#map=18/${position.coords.latitude}/${position.coords.longitude}`
        this.message = ''
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