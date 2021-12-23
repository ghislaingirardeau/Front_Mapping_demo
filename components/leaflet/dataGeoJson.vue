<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >

    <v-select
      v-model="geojsonFeature[geojsonFeature.length - 1].properties.category"
      :items="items"
      :rules="[v => !!v || 'Item is required']"
      label="Item"
      required
    ></v-select>

    <v-text-field
      v-model="geojsonFeature[geojsonFeature.length - 1].properties.name"
      :counter="10"
      :rules="nameRules"
      label="Name"
      required
    ></v-text-field>

    <v-text-field
      v-model="geojsonFeature[geojsonFeature.length - 1].properties.amenity"
      :counter="10"
      :rules="amenityRules"
      label="Amenity"
      required
    ></v-text-field>

    <v-text-field
      v-model="geojsonFeature[geojsonFeature.length - 1].properties.popupContent"
      :counter="20"
      :rules="popupContentRules"
      label="Content"
      required
    ></v-text-field>

    <v-btn
      :disabled="!valid"
      color="success"
      class="mr-4"
      @click="validate"
    >
      Validate
    </v-btn>

    <v-btn
      color="error"
      class="mr-4"
      @click="reset"
    >
      Reset Form
    </v-btn>

    <v-btn
      color="error"
      class="mr-4"
      @click="cancel"
    >
      Cancel
    </v-btn>

  </v-form>
</template>

<script>
  export default {
    data: () => ({
      valid: true,
      name: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 10) || 'Name must be less than 10 characters',
      ],
      amenityRules: [
        v => !!v || 'Anemity is required',
        v => (v && v.length <= 10) || 'Name must be less than 10 characters',
      ],
      popupContentRules: [
        v => !!v || 'Popup content is required',
        v => (v && v.length <= 20) || 'Name must be less than 20 characters',
      ],
      items: [
        'nature',
        'monument',
      ],    
    }),

    props: {
        geojsonFeature: Array
    },

    methods: {
      validate () {
        if(this.$refs.form.validate()) {
            this.$emit('send-data', {
                show: false,
                message: 'données enregistrer dans le geojson',
                disabled: false
            })
        }
      },
      reset () {
        this.$refs.form.reset()
      },
      cancel() {
        this.geojsonFeature.pop()
        this.$emit('send-data', {
            show: false,
            message: 'suppression de la coordonnée'
        })
      }
    },
  }
</script>