<template>
  <modalCustom :showModal="showModal" @send-modal="modalResponse">
    <template v-slot:title> Build your marker</template>  
    <template v-slot:content>
      <v-stepper v-model="e1">
        <v-stepper-header>
          <v-stepper-step :complete="e1 > 1" step="1"> Marker </v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step :complete="e1 > 2" step="2"> Options </v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step step="3"> Color </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-form ref="form" v-model="valid" lazy-validation>
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

                  <v-dialog v-model="dialog" fullscreen hide-overlay>
                    <template v-slot:activator="{ on, attrs }">
                      <span v-show="newIcon.icon.length > 0"
                        >{{ iconSuggestList.length }} icons found</span
                      >
                      <v-icon 
                        color="primary"
                        v-bind="attrs"
                        v-on="on"
                        v-show="newIcon.icon.length > 0"
                        class="mr-3 iconAddColor"
                        size="24px"
                      >mdi-eye-settings-outline</v-icon>
                    </template>
                    <v-card>
                      <v-card-title> Click to select icon </v-card-title>
                      <v-card-text class="ma-2">
                        <v-icon
                          class="ma-2"
                          v-for="(icon, i) in iconSuggestList"
                          :key="i"
                          x-large
                          @click="pickIcon(icon)"
                          >mdi-{{ icon }}</v-icon
                        >
                      </v-card-text>
                      <v-divider></v-divider>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" outlined @click="dialog = false">
                          Close
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
                <v-col cols="11" class="mt-n-5">
                  <v-btn color="primary" @click="validate"> Next </v-btn>
                  <v-icon class="ml-3" large v-if="newIcon.icon">
                    mdi-{{ newIcon.icon }}
                  </v-icon>
                </v-col>
              </v-row>
            </v-form>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-row align="center" justify="center" class="my-2">
              <v-col cols="11">
                <span>Add subcategories (Optionnal) ?</span>
                <v-form ref="formSub" v-model="validSub" lazy-validation>
                  <v-text-field
                    v-model="subCategory.selected"
                    :rules="checkSubCatExist"
                    @keyup="checkSubCatExist"
                    @keydown.enter.prevent="addToArraySubCat"
                    label="Subcategories"
                  ></v-text-field>
                  <span class="mr-2">Add</span>
                  <v-icon
                    color="primary"
                    class="iconAddColor"
                    @click="addToArraySubCat"
                    >mdi-plus-circle</v-icon
                  >
                </v-form>
                <span v-if="subMessage" class="subMessage">{{subMessage}}</span>
              </v-col>
                <v-row align="center" no-gutters justify="space-around" v-if="newIcon.subCategory.length > 0 && newIcon.subCategory[0].length > 1">
                  <v-col cols="11" class="pa-3">
                    My sub categories:
                  </v-col>
                  <v-col
                    v-for="(item, l) in newIcon.subCategory"
                    :key="l"
                    cols="4"
                    class="text-center pa-2"
                  >
                    <v-icon color="white" size="16px">
                      mdi-{{
                        newIcon.icon.length > 0 ? newIcon.icon : 'vector-polyline'
                      }}
                    </v-icon>
                    <span>{{
                      newIcon.subCategory[l]
                        ? newIcon.subCategory[l]
                        : newIcon.category
                    }}</span>
                    <v-icon color="primary" size="22px" @click="removeSubCategory(l)">
                      mdi-delete-forever
                    </v-icon>
                  </v-col>
                </v-row>
              

              <v-col cols="11">
                <v-btn color="primary" @click="validSubOption"> Pick colors </v-btn>
                <v-btn text @click="e1 = 1" outlined color="secondary">
                  back
                </v-btn>
              </v-col>
            </v-row>
          </v-stepper-content>

          <v-stepper-content step="3">
              <v-row class="my-1" v-if="newIcon.subCategory.length > 0">
                <v-col
                  cols="6"
                  class="text-center"
                  v-for="(item, l) in newIcon.subCategory"
                  :key="l"
                >
                  <v-icon
                    :color="newIcon.color[l]"
                    size="20px"
                    @click="iterateOfColorArray = l"
                  >
                    mdi-{{
                      newIcon.icon.length > 0 ? newIcon.icon : 'vector-polyline'
                    }}
                  </v-icon>
                  <span>{{
                    newIcon.subCategory[l]
                      ? newIcon.subCategory[l]
                      : newIcon.category
                  }}</span>
                  <v-icon 
                    color="primary" 
                    class="iconAddColor iconAnimation" 
                    size="25px" 
                    style="padding: 4px;"
                    @click="editColor(l, $event)"
                  >
                    mdi-brush
                  </v-icon>
                </v-col>
              </v-row>
              
              <v-row class="px-5 mt-2 text-center" v-else>
                <v-col cols="3" sm="3">
                  <v-icon :color="newIcon.color[0]" size="28px">
                    mdi-{{
                      newIcon.icon.length > 0 ? newIcon.icon : 'vector-polyline'
                    }}
                  </v-icon>
                  <span>{{ newIcon.category }}</span>
                </v-col>
              </v-row>
            
            <v-row justify="center" class="my-2">
              <v-col cols="11" class="divider__block">
                <span>Pick the color</span>
              </v-col>

              <v-col cols="11">
                <v-color-picker
                  v-model="colorSelected"
                  dot-size="25"
                  hide-inputs
                  @input="applyColor"
                ></v-color-picker>
              </v-col>


              <v-col cols="11" sm="7" class="mt-sm-2">
                <v-btn color="primary" @click="addNewMarker">Valid</v-btn>
                <v-btn color="secondary" outlined @click="resetMarker">Reset</v-btn>
              </v-col>
              <v-col cols="11" sm="4" class="mt-sm-2">
                <v-btn text @click="e1 = 2" outlined color="warning">
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
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      // stepper
      e1: 1,
      // control inside modal
      valid: true,
      validSub: true,
      iterateOfColorArray: 0,
      // item for text fields
      subCategory: {
        selected: '',
      },
      rulesCategory: [(v) => v.length >= 2 || 'Mininum 2 characters'],
      typeSelection: ['Point', 'Area', 'Line'],
      colorSelected: '',
      newIcon: {
        type: 'Point',
        category: 'plus',
        subCategory: [''],
        icon: 'plus',
        color: [],
      },
      // manage datas
      iconsListing: [],
      iconsSuggest: [],
      dialog: false,
      subMessage: undefined
    }
  },
  props: {
    markers: Array,
    showModal: Boolean,
  },
  computed: {
    ...mapState(['iconsList']),
    checkCatExist() {
      let result = this.markers.map((a) => a.category)
      let mySet = new Set(result)
      let control = [...mySet].find(
        (element) => element === this.newIcon.category
      )
        ? false
        : true
      return [
        (v) => v.length >= 2 || 'Mininum 2 characters',
        (v) => control || 'this category already exist',
      ]
    },
    checkSubCatExist() {
      let control = this.newIcon.subCategory.find(
        (element) => element === this.subCategory.selected
      )
        ? false
        : true
      return [
        (v) => v.length >= 2 || 'Mininum 2 characters',
        (v) => v.length <= 10 || 'Max 10 characters',
        (v) => control || 'this subcategory already exist',
      ]
    },
    checkIcon() {
      let control = this.iconsList.find(
        (element) => element === this.newIcon.icon
      )
        ? true
        : false
      return [(v) => control || 'this icon does not exist']
    },
    iconSuggestList: {
      // getter
      get: function () {
        return this.iconsSuggest
      },
      // setter
      set: function (newValue) {
        this.iconsSuggest = newValue
      },
    },
  },
  methods: {
    ...mapActions(['markersOnCreate', 'getMarkersIcons']),

    modalResponse(payload) {
      this.$emit('send-marker', {
        message: false,
      })
      this.resetMarker()
    },
    showIconsList(e) {
      // show icon inside the list
      let value = e.toLowerCase()
      if (value.length > 0) {
        const result = this.iconsList.filter((word) =>
          word.startsWith(value)
        )
        this.iconSuggestList = result
      }
    },
    validate() {
      this.$refs.form.validate() ? (this.e1 = 2) : ''
    },
    pickIcon(elt) {
      this.newIcon.icon = elt
      this.dialog = false
    },
    // RESET THE FORM AND ENABLE ALL BUTTON
    resetMarker() {
      this.newIcon = {
        type: 'Point',
        category: '',
        subCategory: [''],
        icon: '',
        color: ['white'],
      }
      this.subCategory.selected = ''
      this.e1 = 1
      this.rulesCategory = [(v) => v.length >= 2 || 'Mininum 2 characters']
    },
    addToArraySubCat() {
      if (this.$refs.formSub.validate()) {
        if (this.newIcon.subCategory[0].length < 1) {
          this.newIcon.subCategory[0] = this.subCategory.selected
          this.newIcon.color[0] = 'white'
        } else {
          this.newIcon.subCategory.push(this.subCategory.selected)
          this.newIcon.color.push('white')
        }
        this.subCategory.selected = 'One more ?'
      }
    },
    validSubOption() {
      if (this.newIcon.subCategory.length > 1 || this.newIcon.subCategory[0].length === 0) {
        this.e1 = 3
        this.subMessage = undefined
      } else {
        console.log('reject');
        this.subMessage = "Need a minimum of 2 sub categories"
      }
    },
    removeSubCategory (i) {
      if (this.newIcon.subCategory.length === 1 && this.newIcon.color.length === 1) {
        this.newIcon.subCategory = [""]
        this.newIcon.color = ['white']
      } else {
        this.newIcon.subCategory.splice(i, 1)
        this.newIcon.color.splice(i, 1)
      }
    },
    editColor(l, $event) {
      let elt = document.getElementsByClassName('iconAnimation')
      for (let index of elt) {
        index.classList.contains('animationRotate') ? index.classList.remove('animationRotate') : console.log('no')
      }
      $event.target.classList.add('animationRotate')      
      this.iterateOfColorArray = l
    },
    applyColor() {
      this.newIcon.color.splice(this.iterateOfColorArray, 1, this.colorSelected)
    },
    addNewMarker() {
      try {
        switch (this.newIcon.type) {
          case 'Area':
            this.newIcon.type = 'Polygon'
            break
          case 'Line':
            this.newIcon.type = 'MultiLineString'
            break
        }
        // STORE ACTIONS
        this.markersOnCreate(this.newIcon)
        this.$emit('send-marker', {
            message: false,
        })
        this.resetMarker()
      } catch (error) {
        console.log(error)
      }
    },
  },
  mounted() {
    // LOAD ALL THE ICON FROM ICONDESIGN
    this.getMarkersIcons()
  },
}
</script>

<style lang="scss" scoped>
.subMessage{
  color: $color-third;
}
.iconAddColor {
  padding: 8px;
  transition: transform 200ms;
  border: 2px solid $color-secondary;
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
  &:hover::after {
    opacity: 0.3;
  }
}
.v-icon::after {
  border-radius: 0px;
}
.divider__block {
  border-top: 2px solid white;
}

@keyframes rotate {
  0% {
    transform: rotateZ(0);
  }
  100% {
    transform: rotateZ(180deg);
  }
}
.animationRotate {
animation: rotate 0.5s ease both;
}

</style>