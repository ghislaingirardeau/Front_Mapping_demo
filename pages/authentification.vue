<template>
  <v-container>
    <v-row>
      <v-col cols="11" sm="6">
        <v-overlay :value="overlay">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>

        <authForm
          :login="signType"
          :doThis="signType ? loginUser : createUser"
        />
        <p v-if="errorMessage">{{ errorMessage }}</p>
        <v-btn
          v-if="userAuth"
          class="mb-3"
          color="teal"
          outlined
          @click="signOut"
          >Log Out</v-btn
        >

        <p class="mt-3">
          {{
            signType
              ? "If you don't have connection ID ? Please click 'Sign Up'"
              : 'Back to the login'
          }}
        </p>
        <v-btn
          class="mb-3"
          color="teal"
          outlined
          @click="signType = !signType"
          >{{ signType ? 'Sign Up' : 'Login' }}</v-btn
        >
      </v-col>
    </v-row>
    <v-btn @click="postRealTimeDB"> write DB </v-btn>
    <v-btn @click="getRealTimeDB"> read DB </v-btn>
    <v-btn @click="updateRealTimeDB"> update DB </v-btn>
    <v-btn @click="removeRealTimeDB"> remove DB </v-btn>
    <v-btn @click="forgotPassword"> reset password </v-btn>
    <v-btn @click="tokenLog"> log by token </v-btn>

    <h2 v-if="userAuth">The userAuth log : {{ userAuth.displayName }}</h2>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  layout: 'datasLayout',
  middleware: 'route-guards',

  data() {
    return {
      overlay: false,
      RLvalue: undefined,
      signType: true,
      id: 'ID123444',
    }
  },
  computed: {
    ...mapState(['userAuth', 'errorMessage', 'markers']),
  },
  methods: {
    ...mapActions(['login', 'signUp']),

    // NUXT FIREBASE AUTH
    async createUser(data) {
      this.signUp(data)
    },
    async loginUser(data) {
      this.overlay = true
      await this.login(data).then(() => {
        this.overlay = false
        /* this.$router.push('/myData') */
      })
    },
    signOut() {
      this.$fire.auth.signOut()
    },
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
    async forgotPassword() {
      await this.$fire.auth
        .sendPasswordResetEmail(this.userAuth.email)
        .then(() => {
          console.log('Email to reset the password send')
        })
        .catch((error) => {
          console.log(error, 'fail to send the email')
        })
    },
    async tokenLog() {
      /* const token = sessionStorage.getItem('TokenGeoMap')
      console.log(token);
      await this.$fire.auth.verifyIdToken(token)
      .then((decodedToken) => {
        console.log(decodedToken);
      })
      .catch(error => {
        console.log(error, 'fail to send the email');
      }) */
      console.log(this.$fire.auth)
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
