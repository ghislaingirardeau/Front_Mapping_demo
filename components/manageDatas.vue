<template>
    <div>
        <h1 v-if="message">{{message}}</h1>
        <exportCSV v-if="modalExport" />
        <v-list v-if="showMenu">
            <h2>setting</h2>
        <v-list-item
            v-for="(item, i) in settings"
            :key="i"
            :to="item.to"
            router
            exact
        >
            <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
            <v-list-item-title v-text="item.title" />
            </v-list-item-content>
        </v-list-item>

            <h2>actions</h2>
        <v-list-item
            v-for="item in actions"
            :key="item.title"
            @click="doThisFunction(item.id)"
        >
            <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
            <v-list-item-title v-text="item.title" />
            </v-list-item-content>
        </v-list-item>
        </v-list>
    </div>
</template>

<script>
import exportCSV from '@/components/leaflet/exportCSV.vue';
    export default {
        data() {
            return {
                modalExport: false,
                message: undefined,
                showMenu: true,
                settings: [
                    {
                    icon: 'mdi-apps',
                    title: 'Manage Datas',
                    to: '/myData'
                    },
                    {
                    icon: 'mdi-apps',
                    title: 'Manage Markers',
                    to: '/configuration'
                    }
                ],
                actions: [
                    {
                    id: '1',
                    icon: 'mdi-apps',
                    title: 'Export',
                    },
                    {
                    id: '2',
                    icon: 'mdi-apps',
                    title: 'remove temporaly',
                    },
                    {
                    id: '3',
                    icon: 'mdi-printer',
                    title: 'print',
                    }
                ],                
            }
        },
        components: {
            exportCSV,
        },
        methods: {
            removeGeoJson() {
                localStorage.removeItem("APIGeoMap");
                this.message = 'datas removed'
                this.showMenu = false
            },
            doThisFunction(e) {
                switch (e) {
                    case '1':
                        this.modalExport = true
                        this.showMenu = false
                        break;
                    case '2':
                        this.removeGeoJson();
                        break;
                    case '3':
                        this.$router.push({name: 'print'})
                        break;
                }
            }
        },
    }
</script>

<style lang="scss" scoped>
h2{
    border-bottom: 2px solid white;
    padding-bottom: 5px;
}
</style>