<template>
    <modalCustom :showModal="showModal" @send-modal="modalResponse">
      <template v-slot:title> Build your marker</template>
      <template v-slot:content>
        <v-stepper v-model="e1">
          <v-stepper-header>
            <v-stepper-step :complete="e1 > 1" step="1">
              Marker
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="e1 > 2" step="2"> Color </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="3"> Summary </v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-row align="center" justify="center" class="my-2">
                <v-col cols="11" sm="5">
                  <v-select
                    v-model="newIcon.type"
                    :items="typeSelection"
                    label="Type"
                    required
                    @focus="resetMarker"
                  ></v-select>
                </v-col>
                <v-col cols="11" sm="6">
                  <v-text-field
                    v-model="newIcon.category"
                    label="category"
                    :rules="checkCatExist"
                    @keyup="checkCatExist"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="11" v-if="newIcon.type === 'Point'">
                  <v-text-field
                    v-model="newIcon.icon"
                    label="Search Icons"
                    persistent-hint
                    prefix="mdi-"
                    required
                    @keyup="showIconsList(newIcon.icon)"
                  >
                    <template v-slot:append>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-icon v-on="on" @click="linkToIcon">
                            mdi-help-circle-outline
                          </v-icon>
                        </template>
                        Click to get the name of all icons available
                      </v-tooltip>
                    </template>
                  </v-text-field>
                  <v-select
                    v-model="newIcon.icon"
                    :items="iconsSuggest"
                    label="List suggest icons"
                    outlined
                    class="mt-4"
                  >
                  </v-select>
                </v-col>
                <v-col cols="11" class="mt-n-5">
                  <v-btn color="primary" :disabled="!nameExist" @click="e1 = 2"> Continue </v-btn>
                  <v-icon class="ml-3" large v-if="newIcon.icon"> mdi-{{ newIcon.icon }} </v-icon>
                </v-col>
              </v-row>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-row align="center" justify="center" class="my-2">
                <v-col cols="11">
                  <span>Add subcategories (Optionnal)</span>
                </v-col>
                <v-col cols="8">
                  <v-text-field
                    v-model="subCategorySelected"
                    :disabled="disableInputs"
                    label="Subcategories"
                  ></v-text-field>
                </v-col>
                <v-col cols="3" class="text-center">
                  <v-icon
                    color="teal"
                    :style="{
                      border: `2px solid ${disableInputs ? 'grey' : 'teal'}`,
                      padding: `5px`,
                    }"
                    :disabled="disableInputs"
                    @click="addToArraySubCat"
                    >mdi-plus-circle</v-icon
                  >
                </v-col>

                <v-col cols="11" class="divider__block">
                  <span>Pick the color</span>
                </v-col>

                <v-row class="px-5">
                  <v-col
                    cols="1"
                    class="mx-1"
                    v-for="(i, l) in swatches"
                    :key="l"
                  >
                    <v-chip :color="i" label @click="colorSelected = i">
                    </v-chip>
                  </v-col>
                </v-row>

                <v-col cols="4" sm="3" class="text-center">
                  <v-icon
                    color="teal"
                    :class="{ animationShake: disableInputs }"
                    :style="{
                      border: `2px solid ${disableColor ? 'grey' : 'teal'}`,
                      padding: `5px`,
                    }"
                    @click="addToArrayMarker"
                    :disabled="disableColor"
                    >mdi-plus-circle</v-icon
                  >
                </v-col>
                <v-col cols="7" sm="3" class="text-center">
                  <span class="float-left">Preview :</span>
                  <v-icon
                    v-if="newIcon.type === 'Point'"
                    :color="colorSelected"
                    size="28px"
                    >mdi-{{ newIcon.icon }}</v-icon
                  >
                  <v-icon
                    v-else-if="newIcon.type === 'MultiLineString'"
                    :color="colorSelected"
                    size="28px"
                  >
                    mdi-vector-polyline
                  </v-icon>
                  <v-icon
                    v-else-if="newIcon.type === 'Polygon'"
                    :color="colorSelected"
                    size="28px"
                  >
                    mdi-triangle
                  </v-icon>
                </v-col>
                <v-col cols="11">
                  <v-btn
                    color="primary"
                    @click="e1 = 3"
                    v-if="newIcon.color.length > 0"
                    :disabled="disableInputs"
                  >
                    Continue
                  </v-btn>
                  <v-btn
                    text
                    @click="e1 = 1"
                    :disabled="disableInputs"
                    outlined
                    color="secondary"
                  >
                    back
                  </v-btn>
                </v-col>
              </v-row>
            </v-stepper-content>

            <v-stepper-content step="3">
              <!-- Fait apparaitre le résumé de la sélection -->
              <v-row
                v-if="newIcon.color.length > 0"
                justify="center"
                class="my-2"
              >
                <v-col cols="11">
                  <h4>My markers selected : {{ newIcon.category }}</h4>
                </v-col>
                <v-col
                  cols="5"
                  sm="4"
                  v-for="(item, l) in newIcon.color"
                  :key="l"
                >
                  <span>{{
                    newIcon.subCategory[l]
                      ? newIcon.subCategory[l]
                      : newIcon.category
                  }}</span>
                  <v-icon
                    v-if="newIcon.type === 'Point'"
                    :color="newIcon.color[l]"
                    size="36px"
                    >mdi-{{ newIcon.icon }}</v-icon
                  >
                  <v-icon
                    v-else-if="newIcon.type === 'MultiLineString'"
                    :color="newIcon.color[l]"
                    size="28px"
                  >
                    mdi-vector-polyline
                  </v-icon>
                  <v-icon
                    v-else-if="newIcon.type === 'Polygon'"
                    :color="newIcon.color[l]"
                    size="28px"
                  >
                    mdi-triangle
                  </v-icon>
                </v-col>
                <v-col cols="11" sm="7">
                  <v-btn color="primary" @click="addNewMarker">Confirm</v-btn>
                  <v-btn color="warning" @click="resetMarker">Reset</v-btn>
                </v-col>
                <v-col cols="11" sm="4">
                  <v-btn
                    text
                    @click="e1 = 2"
                    :disabled="disableInputs"
                    outlined
                    color="secondary"
                  >
                    back
                  </v-btn>
                </v-col>
              </v-row>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </template>
    </modalCustom>
  
</template>

<script>
import modalCustom from '@/components/leaflet/modalCustom.vue'

let countArray = (a, b) => {
  return a - b
}

export default {
  components: {
    modalCustom,
  },
  data() {
    return {
      // stepper
      e1: 1,
      // control inside modal
      disableInputs: false,
      disableColor: false,
      colorSelected: '',
      swatches: [
        '#FF0000',
        '#AA0000',
        '#550000',
        '#FFFF00',
        '#AAAA00',
        '#555500',
        '#00FF00',
        '#00AA00',
        '#005500',
        '#00FFFF',
        '#00AAAA',
        '#005555',
        '#0000FF',
        '#0000AA',
        '#000055',
      ],
      // item for text fields
      nameExist: true,
      subCategorySelected: undefined,
      rulesCategory: [(v) => v.length >= 2 || 'Mininum 2 characters'],
      typeSelection: ['Point', 'Polygon', 'MultiLineString'],
      newIcon: {
        type: 'Point',
        category: 'test',
        subCategory: [],
        icon: '',
        color: [],
      },
      // manage datas
      iconsListing: [],
      iconsSuggest: [],
    }
  },
  props: {
    markers: Array,
    showCursorDB: Function,
    showModal: Boolean,
  },
  computed: {
    checkCatExist() {
      let array = []
      this.markers.forEach((element) => {
        if (array.indexOf(element.category) === -1) {
          array.push(element.category)
        }
      })
      if (
        array.indexOf(this.newIcon.category) != -1 ||
        this.newIcon.category.length < 2
      ) {
        this.nameExist = false
      } else {
        this.nameExist = true
      }
      return [
        (v) => v.length >= 2 || 'Mininum 2 characters',
        (v) => this.nameExist || 'this category already exist',
      ]
    },
  },
  methods: {
    modalResponse(payload) {
        this.$emit('send-marker', {
            message: false,
        })
        this.resetMarker()
    },
    showIconsList(e) {
      this.iconsSuggest = []
      this.iconsListing.forEach((element) => {
        if (element.startsWith(e)) {
          this.iconsSuggest.push(element)
        }
      })
    },
    linkToIcon() {
      window.open('https://pictogrammers.github.io/@mdi/font/6.5.95/', '_blank')
    },
    // RESET THE FORM AND ENABLE ALL BUTTON
    resetMarker() {
      this.newIcon = {
        type: 'Point',
        category: 'test',
        subCategory: [],
        icon: '',
        color: [],
      }
      this.subCategorySelected = undefined
      this.disableInputs = false
      this.disableColor = false
      this.e1 = 1
      this.rulesCategory = [(v) => v.length >= 2 || 'Mininum 2 characters']
    },
    addToArraySubCat() {
      this.newIcon.subCategory.push(this.subCategorySelected)

      if (
        countArray(
          this.newIcon.color.length,
          this.newIcon.subCategory.length
        ) === -1
      ) {
        this.disableColor = false // active icon add color de toute facon
        this.disableInputs = true // desactive tous les autres
      } else if (
        countArray(
          this.newIcon.color.length,
          this.newIcon.subCategory.length
        ) === 0
      ) {
        this.disableInputs = false
      }
    },
    addToArrayMarker() {
      this.newIcon.color.push(this.colorSelected)
      this.disableInputs = false
      let countSubCategory = this.newIcon.subCategory.length

      if (
        countSubCategory > 0 ||
        countArray(this.newIcon.color.length, this.newIcon.subCategory.length) >
          0
      ) {
        // if already add one subcategory, disabled it after executing code above
        this.disableColor = true
      }
    },
    addNewMarker() {
      try {
        const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
        requestIndexedDB.onsuccess = (event) => {
          var db = event.target.result

          var transaction = db.transaction('markers', 'readwrite')
          const store = transaction.objectStore('markers') // store = table in sql
          // insert data  in the store
          store.add(this.newIcon)
          this.showCursorDB()

          console.log('markers added to the store')
          transaction.oncomplete = () => {
            db.close()
          }
          this.$emit('send-marker', {
            message: false,
          })
          this.resetMarker()
        }
        requestIndexedDB.onerror = (event) => {
          this.DBmessage = event
        }
      } catch (error) {
        console.log(error)
      }
    },
  },
  mounted() {
    // LOAD ALL THE ICON AVAILABLE
    const iconList = async () => {
      let result = await this.$axios.$get(
        'https://pictogrammers.github.io/@mdi/font/6.5.95/css/materialdesignicons.min.css'
      )
      if (result) {
        let listing = result.split('.mdi-')
        listing.forEach((element, i) => {
          let index = element.indexOf(':')
          let icons = element.slice(0, index)
          this.iconsListing.push(icons)
        })
      }
    }
    iconList()
  },
}
</script>

<style lang="scss" scoped>
</style>