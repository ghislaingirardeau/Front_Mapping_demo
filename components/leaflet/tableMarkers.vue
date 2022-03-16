<template>
    <v-col cols="12">
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
        <v-data-table :headers="headers" :items="markers" :search="search">
          <template v-slot:[`item.remove`]="{ item }">
            <v-icon @click="removeDB(item)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
</template>

<script>
    export default {
        data() {
            return {
                search: '',
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
                    { text: 'Remove', value: 'remove' },
                ],
            }
        },
        props: {
            markers: Array
        },
        methods: {
            removeDB(e) {
                const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
                requestIndexedDB.onerror = (event) => {
                    console.log(event)
                }

                // la requete
                requestIndexedDB.onsuccess = (event) => {
                    let db = event.target.result

                    let transaction = db.transaction('markers', 'readwrite')
                    let store = transaction.objectStore('markers') // store = table in sql

                    store.openCursor().onsuccess = (event) => {
                    const cursor = event.target.result
                    if (cursor) {
                        if (cursor.value.category === e.category) {
                        if (cursor.value.subCategory.length > 0) {
                            console.log('mutliple')
                        } else {
                            let idQuery = store.delete(cursor.key)
                            idQuery.onsuccess = (event) => {
                            this.showCursorDB()
                            alert('this marker has been removed')
                            }
                        }
                        }
                        cursor.continue()
                    } else {
                        console.log('Entries displayed.')
                    }
                    }

                    transaction.oncomplete = () => {
                    db.close()
                    }
                    transaction.onerror = (event) => {
                    console.log(event)
                    }
                }
            },
        },
    }
</script>

<style lang="scss" scoped>

</style>