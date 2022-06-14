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
        async saveDatas() {
            sessionStorage.setItem(
                'APIGeoMap',
                JSON.stringify({
                    GeoJsonDatas: this.GeoJsonDatas,
                    markers: this.markers,
                })
            )
            // SAVE IN FIREBASE IF USER
            if (this.userAuth) {
                const messageRef = this.$fire.database.ref('mapApp')
                await messageRef.child(this.userAuth.uid).update({
                    markers: this.markers,
                    GeoJsonDatas: this.GeoJsonDatas,
                })
            }
        },
        refreshMap() {
            this.$nuxt.$emit('refresh', {
                id: 'refresh',
            })
        },
        animationBtn (elt, a, z, reverse) {
            elt.animate([
                // keyframes
                { transform: `rotateZ(${a}deg)` },
                { transform: `rotateZ(${z}deg)` }
            ], {
                // timing options
                duration: 400,
                fill: 'both'
            });
            reverse ? elt.classList.remove('animationRotateBtn') : elt.classList.add('animationRotateBtn')
        }
     }
}