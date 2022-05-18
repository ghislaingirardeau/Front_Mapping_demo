export default {
    data() {
        return {
            mixin: false
        }
    },
    methods: {
        signOut() {
            let confirm = window.confirm(
                'Save your datas before log out !'
            )
            if (confirm) {
                this.$fire.auth.signOut()
                this.$store.dispatch('appReset')
                location.reload()
            }
        },
        changeMixin() {
            this.mixin = !this.mixin
        }
    }
}