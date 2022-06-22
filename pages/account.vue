<template>
  <v-row class="text-center" justify="center">
    <theNavBar />
    <v-col cols="11">
      <h1>{{userAuth ? 'Edit my profile' : 'Sign to your account'}}</h1>
    </v-col>
    <authForm v-if="!userAuth"/>
    <p v-if="errorMessage" class="info__message--alert">{{ errorMessage }}</p>

    <myProfile :userAuth="userAuth" v-if="userAuth"/>
    <v-col cols="11" v-if="userAuth">
      <v-btn color="primary" outlined @click="signOut()">Log Out</v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'

export default {
  transition: 'home',

  data() {
    return {
    }
  },
  computed: {
    ...mapState(['userAuth', 'errorMessage', 'markers']),
  },
  methods: {

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
