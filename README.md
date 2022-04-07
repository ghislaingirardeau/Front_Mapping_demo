# map_Demo

to do :
check the layer auto on added

<v-row justify="center">
    <v-dialog
      v-model="showModal"
      persistent
      max-width="590"
      origin="center top"
    >
      <v-card class="modal__content">
        <v-card-title>
          Build your marker
          <v-spacer></v-spacer>
          <span @click="close" class="modal__content--close">&times;</span>
        </v-card-title>
        <v-card-text>
          <v-stepper v-model="e1">
            <v-stepper-header>
              <v-stepper-step :complete="e1 > 1" step="1">
                Marker
              </v-stepper-step>

              <v-divider></v-divider>

              <v-stepper-step :complete="e1 > 2" step="2">
                Color
              </v-stepper-step>

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
                    <v-btn
                      color="primary"
                      :disabled="!nameExist"
                      @click="e1 = 2"
                    >
                      Continue
                    </v-btn>
                    <v-icon class="ml-3" large v-if="newIcon.icon">
                      mdi-{{ newIcon.icon }}
                    </v-icon>
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
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Special Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `assets`

The assets directory contains your uncompiled assets such as Stylus or Sass files, images, or fonts.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/assets).

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/components).

### `layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).


### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).
