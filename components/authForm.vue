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
      label="email"
      required
    ></v-text-field>
    <v-text-field
      v-model="formData.password"
      type="password"
      label="email"
      required
    ></v-text-field>
    <v-btn color="teal" @click="doThis">
      {{ login ? 'Login' : 'Register' }}
    </v-btn>
  </v-form>
</template>

<script>
export default {
  data() {
    return {
      valid: true,
      formData: {
        email: 'ghislain@mail.com',
        password: 'qwerty1',
        displayName: 'Ghislain',
      },
    }
  },
  props: {
    login: Boolean,
    doThis: Function,
  },
}
</script>

<style lang="scss" scoped>
</style>