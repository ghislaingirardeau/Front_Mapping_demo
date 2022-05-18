export default {
    data() {
        return {
            mixin: false
        }
    },
    methods: {
        signOut(refresh) {
            console.log('im from mixin');
            this.$fire.auth.signOut()
            this.$store.dispatch('appReset')
            refresh ? this.$router.push('/sign') : this.$router.push('/')
        },
        changeMixin() {
            this.mixin = !this.mixin
        }
    }
}