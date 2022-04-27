export function createIndexedDB() {
    const IndexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB
    if (!IndexedDB) {
        alert(
            "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available."
        )
    }

    return new Promise((resolve, reject) => {
        const requestIndexedDB = window.indexedDB.open('Map_Database', 1)

        requestIndexedDB.onerror = (event) => {
            console.log(event)
        }
        requestIndexedDB.onupgradeneeded = (event) => {
            // Save the IDBDatabase interface
            var db = event.target.result

            // Create an objectStore for this database
            var objectStore = db.createObjectStore('markers', {
                autoIncrement: true,
            })
            objectStore.createIndex('markers_category', ['category'], {
                unique: false,
            }) // créer les index de recherche
        }

        resolve({ response: true, message: 'database created' });
    });
}