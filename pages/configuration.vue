<template>
    <v-row>
        <v-col cols="12" >
            <h1>tutorial using IndexedDB</h1>
            <v-btn @click="activateIndexedDB">Create the database</v-btn>
            <v-btn @click="addToDB">add a data</v-btn>
            <v-btn @click="getDBid">get datas</v-btn>
            <v-btn @click="removeDB">remove data</v-btn>
            <v-btn @click="cursorDB">All data in a glance</v-btn>
            <v-btn @click="updateDB">update data</v-btn>
            {{markers}}{{sub}}
        </v-col>
        <v-col cols="12" >
            <v-card>
                <v-card-title>
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                ></v-text-field>
                </v-card-title>
                <v-data-table
                :headers="headers"
                :items="markers"
                :search="search"
                ></v-data-table>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
    export default {
        data() {
            return {
                search: '',
                markers: [],
                sub: [],
                headers: [
                    {
                        text: 'Type',
                        align: 'start',
                        filterable: false,
                        value: 'type',
                    },
                    { text: 'Category', value: 'category' },
                    { text: 'Sub Category', value: 'subCategory' },
                    { text: 'Icon', value: 'icon' },
                    { text: 'Color', value: 'color' },
                ],
            }
        },
        methods: {
            activateIndexedDB(){
                const IndexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                if (!IndexedDB) {
                    alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
                }
                const requestIndexedDB = window.indexedDB.open("Map_Database", 1);

                requestIndexedDB.onerror = event => {
                    console.log(event);
                };
                requestIndexedDB.onupgradeneeded = event => {
                // Save the IDBDatabase interface
                    var db = event.target.result;

                    // Create an objectStore for this database
                    var objectStore = db.createObjectStore("markers", { autoIncrement : true });
                    objectStore.createIndex("markers_category", ["category"], { unique: false }); // créer les index de recherche
                    console.log('database created');
                };            
            },
            addToDB() {
                const requestIndexedDB = window.indexedDB.open("Map_Database", 1);
                requestIndexedDB.onsuccess = event => {
                    var db = event.target.result;

                    var transaction = db.transaction("markers", "readwrite")
                    const store = transaction.objectStore('markers') // store = table in sql
                    // insert data  in the store
                    store.add({type: 'Point', category: "house", subCategory: ["indebted", "interview"], icon: "home", color: ["green", "red"] })
                    store.add({type: 'Point', category: "bath", subCategory: [], icon: "water", color: "blue" })
                    store.add({type: 'Point', category: "grave", subCategory: [], icon: "grave-stone", color: "blue" })
                    store.add({type: 'Point', category: "worship", subCategory: [], icon: "hands-pray", color: "blue" })
                    store.add({type: 'Point', category: "communal", subCategory: [], icon: "hoop-house", color: "blue" })
                    store.add({type: 'Point', category: "well", subCategory: ["private", "public"], icon: "water-pump", color: ["pink", "yellow"] })
                    store.add({type: 'Polygon', category: "rice", subCategory: [], icon: "", color: "blue" })
                    store.add({type: 'MultiLineString', category: "trace", subCategory: [], icon: "", color: "purple" })
                    
                    console.log('markers added to the store');
                    transaction.oncomplete = () => {
                        db.close()
                    }
                };
            },
            getDBid() {
                // ouvre la db
                const requestIndexedDB = window.indexedDB.open("Map_Database", 1);
                requestIndexedDB.onerror = event => {
                    console.log(event);
                };

                // la requete
                requestIndexedDB.onsuccess = event => {
                    let db = event.target.result;

                    let transaction = db.transaction("markers", "readwrite")
                    let store = transaction.objectStore('markers') // store = table in sql

                    let allDatas = store.getAll() // renvoie tous les modeles qui sont vert
                    allDatas.onsuccess = () => {
                        this.markers = allDatas.result
                    }

                   // close db at the end of transaction
                    transaction.oncomplete = () => {
                        db.close()
                    }
                    transaction.onerror = event => { // si il y a une erreur dans la requete
                        console.log(event);
                    };
                };
            },
            updateDB(){
                // ouvre la db
                const requestIndexedDB = window.indexedDB.open("Map_Database", 1);
                requestIndexedDB.onerror = event => {
                    console.log(event);
                };

                // la requete
                requestIndexedDB.onsuccess = event => {
                    let db = event.target.result;

                    let transaction = db.transaction("markers", "readwrite")
                    let store = transaction.objectStore('markers') // store = table in sql

                    store.openCursor().onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            if (cursor.value.category === 'basket') {
                                const updateData = cursor.value;
                                
                                updateData.size = "large";
                                const request = cursor.update(updateData);
                                request.onsuccess = () => {
                                    console.log('Data updated');
                                };
                            };
                            cursor.continue();

                        } else {
                            console.log('Entries displayed.');
                        }
                    };
                };
            },
            cursorDB(){
                const requestIndexedDB = window.indexedDB.open("Map_Database", 1);
                requestIndexedDB.onerror = event => {
                    console.log(event);
                };

                // la requete
                requestIndexedDB.onsuccess = event => {
                    let db = event.target.result;

                    let transaction = db.transaction("markers", "readwrite")
                    let store = transaction.objectStore('markers') // store = table in sql
                    let idQuery = store.openCursor() // recherche sur l'id
                    idQuery.onsuccess = event => {
                        var cursor = event.target.result;
                        if (cursor) {
                            this.markers.push(cursor.value)
                            cursor.continue();
                        }
                        else {
                            console.log("No more entries!");
                        }
                    }

                   // close db at the end of transaction
                    transaction.oncomplete = () => {
                        db.close()
                    }
                };
            },
            removeDB() {
                const requestIndexedDB = window.indexedDB.open("Map_Database", 1);
                requestIndexedDB.onerror = event => {
                    console.log(event);
                };

                // la requete
                requestIndexedDB.onsuccess = event => {
                    let db = event.target.result;

                    let transaction = db.transaction("markers", "readwrite")
                    let store = transaction.objectStore('markers') // store = table in sql

                    let idQuery = store.delete(3) // recherche sur l'id
                    idQuery.onsuccess = event => {
                        console.log("data deleted successfully", event);
                    }

                   // close db at the end of transaction
                    transaction.oncomplete = () => {
                        db.close()
                    }
                    transaction.onerror = event => { // si il y a une erreur dans la requete
                        console.log(event);
                    };
                };
            }
        },
        mounted () {
        },
    }
</script>

<style lang="scss" scoped>

</style>