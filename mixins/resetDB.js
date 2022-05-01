export default {
    data() {
        return {
            mixin: 'show mixin'
        }
    },
    methods: {
        resetDB() {
            return new Promise((resolve, reject) => {
                let confirm = window.confirm(
                    'This action will delete all markers previously created'
                )
                if (confirm) {
                    var requestIndexedDB = window.indexedDB.open('Map_Database', 1)
                    requestIndexedDB.onsuccess = (event) => {
                        var db = event.target.result
                        var transaction = db.transaction('markers', 'readwrite')
                        const store = transaction.objectStore('markers')
                        store.clear()
                        this.$store.commit('RESET_MARKERS')
                    }
                    resolve(true)
                } else {
                    reject(false)
                }
            });
        },
    }
}