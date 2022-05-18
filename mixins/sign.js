export default {
    data() {
        return {
            mixin: false
        }
    },
    methods: {
        signOut() {
            console.log('im from mixin');
            this.$fire.auth.signOut()
            this.$store.dispatch('appReset')
            location.reload()
        },
        changeMixin() {
            this.mixin = !this.mixin
        }
    }
}