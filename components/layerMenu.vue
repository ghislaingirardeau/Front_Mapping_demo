<template>
    <v-menu bottom :offset-x="true" :close-on-content-click="closeOnClick">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            dark
            v-bind="attrs"
            v-on="on"
            size="30px"
            :disabled="disableAction"
            color="rgb(33, 150, 243)"
            class="pa-2 border"
          >
            {{icon}}
          </v-icon>
        </template>

        <v-list>
            <slot name="content"></slot>
        </v-list>
      </v-menu>

</template>

<script>
    export default {
        props: {
            layers: Array,
            switchLayer: Function,
            icon: String,
            disableAction: Boolean,
            closeOnClick: Boolean
        },
    }
</script>

<style lang="scss" scoped>

</style>