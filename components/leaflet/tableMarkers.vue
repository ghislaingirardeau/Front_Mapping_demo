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
          <template v-slot:[`item.icon`]="{ item }">
            <v-icon v-if="item.icon.length > 0" :color="item.color"> mdi-{{item.icon}} </v-icon>
            <v-chip :color="item.color" small v-else>area</v-chip>
          </template>
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
                    text: 'Category',
                    align: 'start',
                    filterable: false,
                    value: 'category',
                    },
                    { text: 'Sub Category', value: 'subCategory' },
                    { text: 'Icon', value: 'icon' },
                    { text: 'Remove', value: 'remove' },
                ],
            }
        },
        props: {
            markers: Array,
            showCursorDB: Function
        },
        methods: {
            removeDB(e) {
                const removeItem = (e) => {
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
                                console.log('mutliple category, has to be fix')
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
                }
                
                if (e.subCategory.length > 0) {
                    let confirm = window.confirm(`This action will remove all sub category of the ${e.category} ?`)
                    if(confirm) {
                        removeItem(e)
                    }
                } else {
                    let confirm = window.confirm(`Remove the item ${e.category} ?`)
                    if(confirm) {
                        removeItem(e)
                    }
                }
            },
        },
    }
</script>

<style lang="scss" scoped>

</style>