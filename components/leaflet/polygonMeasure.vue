<template>
    <div>
        <v-btn 
            class="my-5" 
            color="primary" 
            outlined 
            @click="showMeasure"
        >
            {{btnMeasure ? 'show measure' : 'hide measure'}}
        </v-btn>      
    </div>
</template>

<script>
export default {
    data: () => ({
        btnMeasure: true
    }),
    props: ['map'],
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