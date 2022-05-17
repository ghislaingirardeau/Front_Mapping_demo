export default {
    data() {
        return {
            mixin: 'show mixin'
        }
    },
    methods: {
        signOut(refresh) {
            console.log('im from mixin');
            this.$fire.auth.signOut()
        }
    }
}