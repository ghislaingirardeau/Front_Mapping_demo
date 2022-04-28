<template>
    <modalCustom :showModal="showModal" @send-modal="modalResponse">
      <template v-slot:title> Build your marker </template>
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
              <v-form
                  ref="form"
                  v-model="valid"
                  lazy-validation
                >
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
                      label="Category name"
                      :rules="checkCatExist"
                      @keyup="checkCatExist"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="11" v-if="newIcon.type === 'Point'">
                    <v-text-field
                      v-model="newIcon.icon"
                      label="Icon name"
                      hint="Type the first letter to see the icon's list"
                      persistent-hint
                      prefix="mdi-"
                      class="mb-3"
                      :rules="checkIcon"
                      required
                      @keyup="showIconsList(newIcon.icon)"
                    >
                    </v-text-field>
                    
                    <v-dialog
                      v-model="dialog"
                      fullscreen
                      hide-overlay
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <span v-show="newIcon.icon.length > 0">{{iconSuggestList.length}} icons found</span>
                        <v-btn
                          color="teal"
                          v-bind="attrs"
                          v-on="on"
                          v-show="newIcon.icon.length > 0"
                          class="ml-3"
                        >
                          Show
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>
                          Click to select icon
                        </v-card-title>
                        <v-card-text class="ma-2">
                          <v-icon class="ma-2" v-for="(icon, i) in iconSuggestList" :key="i" x-large @click="pickIcon(icon)">mdi-{{icon}}</v-icon>  
                        </v-card-text>
                        <v-divider></v-divider>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn
                            color="primary"
                            outlined
                            @click="dialog = false"
                          >
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                  </v-col>
                  <v-col cols="11" class="mt-n-5">
                    <v-btn color="primary" @click="validate"> Continue </v-btn>
                    <v-icon class="ml-3" large v-if="newIcon.icon"> mdi-{{ newIcon.icon }} </v-icon>
                  </v-col>
                  
                </v-row>
              </v-form>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-row align="center" justify="center" class="my-2">
                <v-col cols="11">
                  <span>Add subcategories (Optionnal)</span>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="subCategorySelected"
                    :disabled="disableInputs"
                    label="Subcategories"
                  ></v-text-field>
                </v-col>
                <v-col cols="5" class="text-center">
                  <span class="mr-2">Add</span>
                  <v-icon
                    color="teal"
                    :style="{
                      border: `2px solid ${disableInputs ? 'grey' : 'teal'}`,
                    }"
                    class="iconAddColor"
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

                <v-col cols="5" class="mt-3">
                  <span class="mr-2">Add</span>
                  <v-icon
                    color="teal"
                    :class="{ animationShake: disableInputs }"
                    class="iconAddColor"
                    :style="{
                      border: `2px solid ${disableColor ? 'grey' : 'teal'}`,
                    }"
                    @click="addToArrayMarker"
                    :disabled="disableColor"
                    >mdi-plus-circle</v-icon
                  >
                </v-col>
                <v-col cols="6" class="text-center">
                  <span>Preview :</span>
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

let countArray = (a, b) => {
  return a - b
}

export default {
  data() {
    return {
      // stepper
      e1: 1,
      // control inside modal
      valid: true,
      disableInputs: false,
      disableColor: false,
      colorSelected: '#ffffff',
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
      subCategorySelected: undefined,
      rulesCategory: [(v) => v.length >= 2 || 'Mininum 2 characters'],
      typeSelection: ['Point', 'Polygon', 'MultiLineString'],
      newIcon: {
        type: 'Point',
        category: '',
        subCategory: [],
        icon: '',
        color: [],
      },
      // manage datas
      iconsListing: [],
      iconsSuggest: [],
      dialog: false,
    }
  },
  props: {
    markers: Array,
    showModal: Boolean,
  },
  computed: {
    checkCatExist() {
      let control
      let result = this.markers.map(a => a.category);
      let mySet = new Set(result)
      if (
        [...mySet].indexOf(this.newIcon.category) != -1 ||
        this.newIcon.category.length < 2
      ) {
        control = false
      } else {
        control = true
      }
      return [
        (v) => v.length >= 2 || 'Mininum 2 characters',
        (v) => control || 'this category already exist',
      ]
    },
    checkIcon() {
      let control
      if((this.iconsListing.find(element => element === this.newIcon.icon)) != undefined){
        control = true
      } else {
        control = false
      }
      return [
        (v) => control || 'this icon does not exist',
      ]

    },
    iconSuggestList: {
      // getter
      get: function () {
        return this.iconsSuggest
      },
      // setter
      set: function (newValue) {
        this.iconsSuggest = newValue
      }
    },
  },
  methods: {
    modalResponse(payload) {
        this.$emit('send-marker', {
            message: false,
        })
        this.resetMarker()
    },
    showIconsList(e) { // show icon inside the list
      let value = e.toLowerCase()
      if(value.length > 0) {
        const result = this.iconsListing.filter(word => word.startsWith(value));
        console.log(result);
        this.iconSuggestList = result
      }
    },
    validate() {
      console.log(this.$refs.form.validate());
      this.$refs.form.validate() ? this.e1 = 2 : ''
    },
    pickIcon(elt) {
      this.newIcon.icon = elt
      this.dialog = false
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
          this.$store.dispatch('loadMarkers')

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
.iconAddColor{
  padding: 8px;
  transition: transform 200ms;
  &::after {
    content: '';
    position: absolute;
    top: 10%;
    left: 10%;
    height: 80%;
    width: 80%;
    opacity: 0;
    transition: opacity 300;
  }
  &:hover::after{
    opacity: 0.3;
  }
}
.v-icon::after{
  border-radius: 0px;
}
.divider__block {
  border-top: 2px solid white;
}
@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

.animationShake {
  /* transform: scale(1.1);
  transition: transform 400ms; */
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

</style>