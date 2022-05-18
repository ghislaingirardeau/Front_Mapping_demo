<template>
  <v-col cols="11" sm="6">
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field
        v-if="!signType"
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
        {{ signType ? 'Login' : 'Register' }}
      </v-btn>
    </v-form>
    <span class="info__message">You forgot your password ? </span>
    <v-btn small text color="teal" @click="forgotPassword">reset here</v-btn>
    <p v-if="resetMessage" class="info__message--success">
      {{ resetMessage }}
    </p>
    <p>
      {{
        signType
          ? "If you don't have connection ID ? Please click 'Sign Up'"
          : 'Back to the login'
      }}
    </p>
    <v-btn class="mb-3" color="teal" outlined @click="signType = !signType">{{
      signType ? 'Sign Up' : 'Login'
    }}</v-btn>
  </v-col>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      signType: true,
      overlay: false,
      resetMessage: undefined,
      valid: true,
      ruleEmail: [(v) => v.length > 4 || 'email too short'],
      formData: {
        email: 'tototest@mail.com',
        password: 'qwerty1',
        displayName: 'Ghislain',
      },
    }
  },
  methods: {
    ...mapActions(['login', 'signUp']),

    async sendDataForm() {
      if (this.$refs.form.validate()) {
        if (this.signType) { // if want to log
          this.overlay = true
          await this.login(this.formData).then(() => {
            this.overlay = false
            this.$router.push('/myData')
          })
        } else { // if want to signup
          this.signUp(this.formData)
        }
      }
    },

    // NUXT FIREBASE AUTH
    async forgotPassword() {
      await this.$fire.auth
        .sendPasswordResetEmail(this.userAuth.email)
        .then(() => {
          console.log('Email to reset the password send')
          this.resetMessage =
            'An email sent, follow the link to reset your password !'
        })
        .catch((error) => {
          console.log(error, 'fail to send the email')
          this.resetMessage = 'Fail to send the email !'
        })
    },
  },
  mounted() {
    this.resetMessage = undefined
  },
}
</script>

<style lang="scss" scoped>
</style>