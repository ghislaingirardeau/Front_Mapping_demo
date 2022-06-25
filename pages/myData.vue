<template>
  <v-row justify="center">
    <theNavBar />

    <v-card min-width="90%" v-if="foldersName.length > 0">
      <v-card-title style="padding: 6px 6px 6px 16px">
        {{ userAuth ? `Your datas ${userAuth.displayName}` : 'My datas' }}
      </v-card-title>
      <v-card-subtitle
        class="d-flex flex-row align-center"
        style="padding: 6px 6px 6px 16px"
      >
        <span class="my-4">New project ?</span>
        <transition name="fade-rotate" mode="out-in">
          <v-icon
            size="30px"
            class="mx-4"
            color="secondary"
            :key="newFolder.create || newFolder.oldName"
            @click="showNewField(false)"
            >{{newFolder.create || newFolder.oldName ? 'mdi-close-box-outline' : 'mdi-folder-plus-outline'}}</v-icon
          >
        </transition>
        <transition name="fade-slideX">
          <v-form
            ref="form"
            v-model="validForm"
            lazy-validation
            v-if="newFolder.create || newFolder.oldName"
          >
            <v-text-field
              v-model="newFolder.name"
              dense
              :rules="nameRules"
              :counter="10"
              :label="newFolder.oldName ? 'Rename Project' : 'New Project Name'"
              required
            ></v-text-field>
          </v-form>
        </transition>
        <transition name="fade-slide-rotate">
          <v-icon
            v-if="newFolder.create || newFolder.oldName"
            size="30px"
            class="mx-4"
            color="primary"
            @click="editFolder"
            >mdi-checkbox-marked-circle-outline</v-icon
          >
        </transition>
      </v-card-subtitle>
      <v-card-actions
        class="d-flex flex-wrap justify-space-around btn-active-folder"
        style="padding: 4px 8px 4px 8px"
      >
        <v-menu
          offset-y
          v-for="(name, l) in foldersName"
          :key="l"
          min-width="120px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              :color="activeFolder(name)"
              class="ma-2"
              outlined
              dark
              v-bind="attrs"
              v-on="on"
              @click="folderTooltip(name)"
            >
              <transition name="fade-rotate" mode="out-in">
                <v-icon left :key="workOn">
                  {{
                    name === workOn
                      ? 'mdi-folder-open-outline'
                      : 'mdi-folder-outline'
                  }}
                </v-icon>
              </transition>
              {{ name }}
            </v-btn>
          </template>
          <v-list v-if="name != workOn">
            <v-list-item @click="actionFolder(name, false)">
              <v-list-item-title>Open</v-list-item-title>
              <v-icon color="secondary">mdi-folder-upload-outline</v-icon>
            </v-list-item>
            <v-list-item @click="actionFolder(name, true)">
              <v-list-item-title>Remove</v-list-item-title>
              <v-icon color="secondary">mdi-folder-remove-outline</v-icon>
            </v-list-item>
            <v-list-item @click="showNewField(name)">
              <v-list-item-title>Rename</v-list-item-title>
              <v-icon color="secondary">mdi-folder-edit-outline</v-icon>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-tooltip
          v-model="showTooltip"
          attach=".btn-active-folder"
          nudge-bottom="150"
          nudge-right="150"
        >
          <span>This folder is already open !</span>
        </v-tooltip>
      </v-card-actions>
    </v-card>

    <v-col cols="11" class="text-center" v-if="!userAuth">
      <p>Remember to login or register to save your data !</p>
    </v-col>
    <transition name="fade-slideY" mode="out-in">
      <tableGeoJson :allDatas="GeoJsonTable" :key="workOn" />
    </transition>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  transition: 'home',
  data() {
    return {
      isActive: false,
      objetData: {},
      newFolder: {
        name: '',
        rename: false,
        oldName: undefined,
        create: false,
      },
      validForm: true,
      showTooltip: false,
    }
  },
  computed: {
    ...mapState(['markers', 'GeoJsonDatas', 'userAuth']),
    ...mapGetters(['GeoJsonTable', 'foldersName', 'workOn']),
    nameRules() {
      return this.foldersName.indexOf(this.newFolder.name) === -1
        ? [true]
        : ['This name already exist']
    },
  },
  methods: {
    activeFolder(name) {
      return name === this.workOn ? 'secondary' : 'white'
    },
    linkMap() {
      this.$router.push('/')
    },
    actionFolder(name, remove) {
      if (name != this.workOn) {
        let confirm = window.confirm(
          remove
            ? `Are you sure you want to delete all datas inside ${name}`
            : 'Be sure to save your datas before to switch !'
        )
        if (confirm) {
          let folder = {
            name: name,
            remove: remove,
            new: false,
          }
          this.$store.dispatch('clickFolder', folder)
        }
      }
    },
    showNewField(name) {
      if (name) {
        this.newFolder.create = false
        this.newFolder.oldName ? this.newFolder.oldName = undefined : this.newFolder.oldName = name
      } else {
        this.newFolder.oldName ? this.newFolder.create = false : this.newFolder.create = !this.newFolder.create
        this.newFolder.oldName = undefined
      }
    },
    editFolder() {
      if (this.$refs.form.validate()) {
        let folder = {
          name: this.newFolder.name,
          remove: false,
          new: this.newFolder.create,
          rename: this.newFolder.oldName ? this.newFolder.oldName : false,
        }
        this.$store.dispatch('clickFolder', folder)
        this.refreshMap()
      }
    },
    folderTooltip(name) {
      if (name === this.workOn) {
        this.showTooltip = !this.showTooltip
        setTimeout(() => {
          this.showTooltip = !this.showTooltip
        }, 2000)
      }
    },
  },
  mounted() {
    this.$store.dispatch('appLoad') // because store does not detect add / delete on object key
  },
}
</script>

<style lang="scss">
.fade-slideX-enter-active,
.fade-slideX-leave-active {
  transition: all 0.5s ease;
}
.fade-slideX-enter,
.fade-slideX-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
.fade-slideY-enter-active,
.fade-slideY-leave-active {
  transition: all 0.3s ease;
}
.fade-slideY-enter,
.fade-slideY-leave-to {
  opacity: 0;
  transform: translateY(40px);
}

.fade-slide-rotate-enter-active,
.fade-slide-rotate-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-rotate-enter,
.fade-slide-rotate-leave-to {
  opacity: 0;
  transform: translateX(50px) rotateZ(120deg);
}

.fade-rotate-enter-active,
.fade-rotate-leave-active {
  transition: all 1s ease;
}

.fade-rotate-enter,
.fade-rotate-leave-to {
  opacity: 0;
  transform: rotateZ(90deg);
}
</style>
