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
        },
        changeMixin() {
            this.mixin = !this.mixin
        }
    }
}