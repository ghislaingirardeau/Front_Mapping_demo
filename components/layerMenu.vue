<template>
    <v-menu bottom :offset-x="true">
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
          <v-list-item-group color="rgb(33, 150, 243)">
            <v-list-item
              v-for="(item, i) in layers"
              :key="i"
            >
              <v-list-item-content @click="switchLayer(item)">
                <v-list-item-title v-text="item"></v-list-item-title>
              </v-list-item-content>

            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>

</template>

<script>
    export default {
        props: {
            layers: Array,
            switchLayer: Function,
            icon: String,
            disableAction: Boolean
        },
    }
</script>

<style lang="scss" scoped>

</style>