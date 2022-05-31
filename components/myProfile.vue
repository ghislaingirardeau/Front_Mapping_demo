<template>
  <v-col cols="11" sm="6">
    <p v-if="!userAuth.emailVerified">
      Remember to verify your email account !
    </p>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field
        v-model="formEdit.displayName"
        label="name"
        :rules="ruleName"
        required
      ></v-text-field>
      <v-text-field
        v-model="formEdit.email"
        label="email"
        readonly
      ></v-text-field>
      <v-btn color="primary" @click="saveChanges"> Save change </v-btn>
    </v-form>
  </v-col>
</template>

<script>
export default {
  data() {
    return {
      valid: true,
      ruleName: [(v) => v.length > 2 || 'Your name is too short'],
      formEdit: {
        displayName: this.userAuth.displayName,
        email: this.userAuth.email,
        photoURL: 'here is my avatar'
      },
    }
  },
  props: {
    userAuth: Object,
  },
  methods: {
    saveChanges() {
      console.log(this.formEdit)
      this.$store.dispatch('updateUser', this.formEdit)
    },
  },
}
</script>

<style lang="scss" scoped>
</style>