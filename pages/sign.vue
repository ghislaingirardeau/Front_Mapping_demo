<template>
  <v-row class="text-center" justify="space-around">
    <theNavBar />
    <v-col cols="11">
      <h1>My account</h1>
      {{ userAuth }}
    </v-col>
    <authForm v-if="!userAuth"/>
    <p v-if="errorMessage" class="info__message--alert">{{ errorMessage }}</p>

    <myProfile :userAuth="userAuth" v-if="userAuth"/>
    <v-col cols="11" v-if="userAuth">
      <v-btn color="teal" outlined @click="signOut(false)">Log Out</v-btn>
    </v-col>
    <!-- <v-btn @click="postRealTimeDB"> write DB </v-btn>
    <v-btn @click="getRealTimeDB"> read DB </v-btn>
    <v-btn @click="updateRealTimeDB"> update DB </v-btn>
    <v-btn @click="removeRealTimeDB"> remove DB </v-btn>
    <v-btn @click="forgotPassword"> reset password </v-btn>
    <v-btn @click="tokenLog"> log by token </v-btn>

    <h2 v-if="userAuth">The userAuth log : {{ userAuth.displayName }}</h2> -->
  </v-row>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  /* middleware: 'route-guards', */
  transition: 'home',

  data() {
    return {
      RLvalue: undefined,
      id: 'ID123444',
    }
  },
  computed: {
    ...mapState(['userAuth', 'errorMessage', 'markers']),
  },
  methods: {


    // NUXT FIREBASE REALTIME DB
    async getRealTimeDB() {
      console.log(this.$fire.auth.currentUser)
      const messageRef = this.$fire.database.ref('mapApp')
      console.log(messageRef)
      try {
        messageRef
          .child('HlmEVZJvEoPa7yianlEbhZ5OL0J2')
          .once('value', function (snapshot) {
            console.log(snapshot.val())
          })
      } catch (e) {
        alert(e)
      }
    },
    async postRealTimeDB() {
      // CREATE A NEW DATA
      const messageRef = this.$fire.database.ref('markers')
      try {
        await messageRef.child(this.id).set({
          id: '1',
          name: 'my first object',
          content: 'object description',
        })
        console.log('success')
      } catch (e) {
        return
      }
    },
    async updateRealTimeDB() {
      const messageRef = this.$fire.database.ref('object')
      try {
        // UPDATE ONLY ONE VALUE INSIDE THE OBJECT
        /* await messageRef.child('/update').update({
            name: 'i update only name',
          }) */
        // UPDATE A DATA / WILL CREATE ONE IF DOESN'T EXIST YET
        await messageRef
          .child(this.id)
          .child('new folder')
          .update({
            id: '4',
            name: 'MY NEW UPDATE',
            content: 'update description',
            postID: ['a', 'b', 'c'],
          })
        // INSERT A NEW NODE WITH AUTO ID
        /* await messageRef.push({
            text: 'new text add'
          }) */
        console.log('success')
        /* const snapshot = await messageRef.get('value')
        console.log(snapshot.val())
        this.RLvalue = snapshot.val() */
      } catch (e) {
        console.log(e)
        return
      }
    },
    async removeRealTimeDB() {
      const messageRef = this.$fire.database.ref('object')
      try {
        await messageRef.child('id').remove()
        console.log('success')
        const snapshot = await messageRef.get('value')
        console.log(snapshot.val())
        this.RLvalue = snapshot.val()
      } catch (e) {
        console.log(e)
        return
      }
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
