<template>
  <v-row class="text-center" justify="center">
    <theNavBar />

    <v-col cols="11">
      <h1>{{ userAuth ? 'My account' : 'Sign to the app' }}</h1>
    </v-col>

    <authForm v-if="!userAuth" />

    <v-col cols="11">
      <p v-if="errorMessage" class="info__message--alert">{{ errorMessage }}</p>
    </v-col>

    <myProfile :userAuth="userAuth" v-if="userAuth" />

    <v-col cols="11" v-if="userAuth">
      <v-btn color="secondary" outlined @click="signOut()">Log Out</v-btn>
    </v-col>

    <v-col cols="11">
      <v-btn color="secondary" outlined @click="touchTest">touch</v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'

export default {
  transition: 'home',

  data() {
    return {}
  },
  computed: {
    ...mapState(['userAuth', 'errorMessage', 'markers']),
  },
  methods: {
    touchTest(e) {
      e.target.addEventListener('touchstart', (event) => {
        console.log('touchstart')
      })
      e.target.addEventListener('touchend', (event) => {
        console.log('touchend')
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.info__message {
  font-size: 0.8rem;
  &--alert {
    color: rgb(245, 105, 105);
  }
  &--success {
    color: rgb(105, 245, 168);
  }
}
</style>
