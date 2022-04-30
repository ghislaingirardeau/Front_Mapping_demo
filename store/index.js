// holds your root state
export const state = () => ({
    markers: [],
})

// contains your actions
export const actions = {
    loadMarkers(context) {
        let results = []
        const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
        requestIndexedDB.onerror = (event) => {
            console.log(event)
        }
        requestIndexedDB.onsuccess = (event) => {
            let db = event.target.result

            let transaction = db.transaction('markers', 'readwrite')
            let store = transaction.objectStore('markers') // store = table in sql
            let idQuery = store.openCursor() // recherche sur l'id
            idQuery.onsuccess = (event) => {
                var cursor = event.target.result

                if (cursor) {
                    // if a get an array of sub category, i create a new object to send in this.markers array
                    if (cursor.value.subCategory.length > 0) {
                        for (
                            let index = 0;
                            index < cursor.value.subCategory.length;
                            index++
                        ) {
                            let multiMarker = {
                                type: cursor.value.type,
                                category: cursor.value.category,
                                subCategory: [],
                                icon: cursor.value.icon,
                                color: [],
                            }
                            multiMarker.subCategory.push(cursor.value.subCategory[index])
                            multiMarker.color.push(cursor.value.color[index])
                            results.push(multiMarker)
                        }
                    } else {
                        results.push(cursor.value)
                    }
                    cursor.continue()
                } else {
                    context.commit('SAVE_MARKERS', results);
                    console.log('No more entries!')
                    
                }
            }
            transaction.oncomplete = () => {
                db.close()
            }
        }
        
    },
}
// contains your mutations
export const mutations = {
    SAVE_MARKERS(state, data) {
        state.markers = data;
    },
    RESET_MARKERS(state) {
        state.markers = [];
    },
}
