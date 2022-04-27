<template>
  <v-col cols="12">
    <!-- dialog for the data editing -->
    <modalCustom :showModal="showModal" @send-modal="modalResponse"> 
      <template v-slot:title>
        Edit Item
      </template>
      <template v-slot:content>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field
            v-model="editItem.name"
            label="name"
            :rules="rulesName"
            required
          >
          </v-text-field>
          <v-text-field
            v-model="editItem.popupContent"
            label="details"
          >
          </v-text-field>
        </v-form>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="updateItem">
          Save
        </v-btn>
      </template>
    </modalCustom>

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
        :items="geoItems"
        :search="search"
      >
        <template v-slot:[`item.actions`]="{ item }">
              <v-icon
                class="mr-15"
                @click="itemAction(item, false)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                @click="itemAction(item, true)"
              >
                mdi-delete
              </v-icon>
            </template>      
      </v-data-table>
    </v-card>
  </v-col>
</template>

<script>
  export default {
    data () {
      return {
        search: '',
        headers: [
          {
            text: 'Name',
            align: 'start',
            filterable: false,
            value: 'name',
          },
          { text: 'Details', value: 'popupContent' },
          { text: 'Type', value: 'category' },
          { text: 'Actions', value: 'actions' },
        ],
        showModal: false,
        valid: true,
        editItem: {},
        rulesName: [(v) => v.length >= 2 || 'Mininum 2 characters']
      }
    },
    props: {
        allDatas: Array
    },
    computed: {
        // RECUPERER LES DONNEES SOUS FORME ARRAY OBJET POUR LES ENVOYE DANS LE TABLEAU DE DATA
        geoItems() {
          let dataArray = []
          this.allDatas.forEach(element => {
            dataArray.push({
              ...element.properties,
              ...element.geometry
            })
          });
            return dataArray
        }
    },
    methods: {
      itemAction(item, remove) {
        let indexItem = this.geoItems.indexOf(item) // get the index same as alldatas props
        if(!remove) {
          this.showModal = true
          this.editItem = {...item, index: indexItem}
        } else {
          this.$emit('data-update', {
            action: remove,
            index: indexItem
          })
        }
      },
      updateItem() {
        if(this.$refs.form.validate()) {
          this.$emit('data-update', {
            action: false,
            itemToSave: this.editItem // send the change
          })
          this.showModal = false
        }
      },
      modalResponse(payload) {
        this.showModal = payload.message;
      }
    },
  }
</script>