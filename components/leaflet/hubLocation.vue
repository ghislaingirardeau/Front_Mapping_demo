<template>
    <div>
        <div id="hub" class="hub__target--btn">
            <v-btn color="black" class="mx-3" @click="saveTarget(false)">
                Cancel
            </v-btn>
            <v-btn color="black" class="mx-3" @click="saveTarget(true)"> OK </v-btn>
        </div>

        <p id="hubTuto" class="hub__target--tuto">Click inside</p>

        <i
        id="hubTarget"
        @click="locationTarget"
        aria-hidden="true"
        class="hub__target--icon mdi mdi-target"
        ></i>
    </div>
</template>

<script>
    export default {
        props: {
            saveTarget: Function,
            locationTarget: Function
        },
        
    }
</script>

<style lang="scss" scoped>

</style>