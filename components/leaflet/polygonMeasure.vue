<template>
    <v-col cols="1" offset="1">
        <v-btn 
            :icon="buttonIcon"
            :color="colorTest"
            outlined 
            @click="showMeasure"
        >
            <v-icon v-if="buttonIcon">mdi-ruler</v-icon>
            <span v-else>Measure</span>        
        </v-btn>     
    </v-col>
</template>

<script>
export default {
    data: () => ({
        btnMeasure: true,
    }),
    props: ['map', 'buttonIcon'],
    computed: {
        colorTest() {
            return this.btnMeasure ? 'secondary' : 'info'
        }
    },
    methods: {
        showMeasure() {
            // show measure on click
            // HIDE MEASURE ON SECOND CLICK + BUTTON DYNAMIC
            // DEBUG ON PRINT = NOT SHOWING MEASURE
            if(this.btnMeasure === true){
                this.map.eachLayer(function(layer){
                    if(layer instanceof L.Polygon && !(layer instanceof L.Rectangle) ){
                        layer.showMeasurements()
                    }
                })
            } else {
                this.map.eachLayer(function(layer){
                    if(layer instanceof L.Polygon && !(layer instanceof L.Rectangle) ){
                        layer.hideMeasurements()
                    }
                })
            }
            this.btnMeasure = !this.btnMeasure
        }
    },
}
</script>