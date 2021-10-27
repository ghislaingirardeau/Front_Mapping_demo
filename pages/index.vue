<template>
  <v-row>
    <v-col class="text-center">
      <h1>get my location</h1>
      <v-btn color='primary' @click="findMe">find me</v-btn>
      <p>my actual position {{myLocation}}</p>

    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return{
      myLocation: [],
      message: ''
    }
  },
  computed: {
    /* myposition() {
      navigator.geolocation.watchPosition((position) => {
          this.myLocation.push(position.coords.latitude)
          this.myLocation.push(position.coords.longitude)      
      })
      return this.myLocation
    } */
  },
  methods: {
    findMe() {
      if ("geolocation" in navigator) {
        console.log('location is active')
        navigator.geolocation.getCurrentPosition((position) => {
          this.myLocation.push({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        })

      } else {
        console.log('location is disable')
      }
    }
  },
}
</script>