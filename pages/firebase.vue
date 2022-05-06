<template>
  <div>
    <h1>Test realtime database</h1>
    <h2>value DB response : {{ RLvalue }}</h2>
    <v-btn @click="postRealTimeDB"> write DB </v-btn>
    <v-btn @click="getRealTimeDB"> read DB </v-btn>
    <v-btn @click="updateRealTimeDB"> update DB </v-btn>
    <v-btn @click="removeRealTimeDB"> remove DB </v-btn>

    <h2 v-if="user">The user log : {{ user.displayName }}</h2>

    <v-btn color="teal" @click="signType = !signType">{{signType ? 'Sign' : 'Login'}}</v-btn>

    <authForm :login="signType" :doThis="signType ? loginUser : createUser"/>
    <p v-if="errorMessage">{{errorMessage}}</p>

    <div class="mt-3" v-if="user">
      <v-btn @click="logoutUser" color="teal">logout</v-btn>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      RLvalue: undefined,
      signType: true,
      id: 'ID123444'
    }
  },
  computed: {
    ...mapState(['user', 'errorMessage']),
  },
  methods: {
    ...mapActions(['currentUser', 'createNewUser']),

    // NUXT FIREBASE AUTH
    async createUser(data) {
      this.createNewUser(data)
    },
    async loginUser(data) {
      this.currentUser(data)
    },
    async logoutUser() {
      try {
        this.$fire.auth.signOut()
        // action define inside the user listener
      } catch (error) {}
    },
    // NUXT FIREBASE REALTIME DB
    async getRealTimeDB() {
      const messageRef = this.$fire.database.ref('object')
      console.log(messageRef)
      try {
        messageRef.once('value', function (snapshot) {
          console.log(snapshot.val())
          snapshot.forEach(function (childSnapshot) {
            var key = childSnapshot.key
            var data = childSnapshot.val()
            console.log(key, data)
          })
        })
        /* const snapshot = await messageRef.get('value')
          this.RLvalue = snapshot.val() */
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
      const messageRef = this.$fire.database.ref('markers')
      try {
        // UPDATE ONLY ONE VALUE INSIDE THE OBJECT
        /* await messageRef.child('/update').update({
            name: 'i update only name',
          }) */
        // UPDATE A DATA / WILL CREATE ONE IF DOESN'T EXIST YET
        await messageRef.child(this.id).update({
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
        const snapshot = await messageRef.get('value')
        console.log(snapshot.val())
        this.RLvalue = snapshot.val()
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
</style>
