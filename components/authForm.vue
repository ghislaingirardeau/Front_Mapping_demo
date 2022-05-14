<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-text-field
      v-if="!login"
      v-model="formData.displayName"
      label="name"
      required
    ></v-text-field>
    <v-text-field
      v-model="formData.email"
      :rules="ruleEmail"
      label="email"
      required
    ></v-text-field>
    <v-text-field
      v-model="formData.password"
      type="password"
      label="email"
      required
    ></v-text-field>
    <v-btn color="teal" @click="sendDataForm">
      {{ login ? 'Login' : 'Register' }}
    </v-btn>
  </v-form>
</template>

<script>
export default {
  data() {
    return {
      valid: true,
      ruleEmail: [(v) => v.length > 4 || 'email too short'],
      formData: {
        email: 'toto@mail.com',
        password: 'qwerty1',
        displayName: 'Ghislain',
      },
    }
  },
  props: {
    login: Boolean,
    doThis: Function,
  },
  methods: {
      sendDataForm() {
          this.$refs.form.validate() ? this.doThis(this.formData) : console.log('email too short');
      }
  },
}
</script>

<style lang="scss" scoped>
</style>