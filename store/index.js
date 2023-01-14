import Vue from 'vue'

// holds your root state
export const state = () => ({
  userAuth: undefined,
  errorMessage: undefined,
  foldersDatas: {},
  markers: [],
  GeoJsonDatas: {},
  iconsList: [],
})

const setStorage = (markers, GeoJsonDatas) => {
  sessionStorage.setItem(
    'APIGeoMap',
    JSON.stringify({
      markers: markers,
      GeoJsonDatas: GeoJsonDatas,
    })
  )
}

// contains your actions
export const actions = {
  // FIREBASE PAGE
  async signUp({ commit, state }, formData) {
    try {
      const newUser = await this.$fire.auth.createUserWithEmailAndPassword(
        formData.email,
        formData.password
      )
      if (newUser) {
        console.log('add name')
        await this.$fire.auth.currentUser.updateProfile({
          displayName: formData.displayName,
        })
        const authListener = await this.$fire.auth.onAuthStateChanged(
          (user) => {
            if (user) {
              const uid = user.uid
            } else {
              console.log('User is signed out')
              commit('USER_SIGNOUT')
            }
          }
        )
        if (authListener) {
          console.log('ecouteur ok')
          return new Promise((resolve, reject) => {
            commit('USER_FECTH', newUser.user)

            const firebaseProject = this.$fire.database.ref('mapApp')
            firebaseProject.child(newUser.user.uid).child('myProject').set({
              markers: state.markers,
              GeoJsonDatas: state.GeoJsonDatas,
              lastUpdate: Date.now(),
            })
            resolve(true)
          })
          // EMAIL VERIFICATION
          /* console.log('email')
                    const userEmail = this.$fire.auth.currentUser
                    console.log(userEmail);
                    const sendEmail = userEmail.sendEmailVerification()
                    console.log(sendEmail); */
        }
      }
    } catch (error) {
      commit('ERROR_REPONSE', error.message)
    }
  },
  async login({ commit, state }, formData) {
    try {
      const userLog = await this.$fire.auth.signInWithEmailAndPassword(
        formData.email,
        formData.password
      )

      if (userLog) {
        console.log('log ok')
        return new Promise((resolve, reject) => {
          commit('USER_FECTH', userLog.user)
          resolve(true)
        })
      }
      // LISTENER TO THE AUTH CHANGED IF STILL LOG OR NOT
    } catch (error) {
      console.log("This email or password doesn't exist")
      commit('ERROR_REPONSE', error.message)
    }
  },
  async keepConnection({ commit, dispatch }) {
    return new Promise((resolve, reject) => {
      this.$fire.auth.onAuthStateChanged((user) => {
        if (user) {
          const firebaseProject = this.$fire.database.ref('mapApp')
          try {
            firebaseProject.child(user.uid).once('value', (snapshot) => {
              // RETRIEVE DATA HERE WITH uid
              let FBjson = snapshot.val()
              // sort the last folder updated to show
              let lastFolderUpdate = Object.values(snapshot.val()).sort(
                (a, b) => {
                  return a.lastUpdate - b.lastUpdate
                }
              )
              // get the key name of the folder load
              for (const [key, value] of Object.entries(FBjson)) {
                if (
                  value.lastUpdate ===
                  lastFolderUpdate[lastFolderUpdate.length - 1].lastUpdate
                ) {
                  FBjson.on = key
                }
              }
              let datas = {
                GeoJsonDatas: lastFolderUpdate[lastFolderUpdate.length - 1]
                  .GeoJsonDatas
                  ? lastFolderUpdate[lastFolderUpdate.length - 1].GeoJsonDatas
                  : {},
                markers: lastFolderUpdate[lastFolderUpdate.length - 1].markers,
              }
              commit('SAVE_FBJSON', FBjson)
              commit('SAVE_MARKERS', datas)
              commit('USER_FECTH', user)
              resolve({ user: user })
            })
          } catch (e) {
            alert(e)
            reject(e)
          }
        } else {
          dispatch('appLoad')
          resolve({ user: undefined })
        }
      })
    })
  },
  async updateUser({ commit }, datas) {
    console.log(datas)
    await this.$fire.auth.currentUser
      .updateProfile({
        displayName: datas.displayName,
        photoURL: datas.photoURL,
      })
      .then(() => {
        commit('UPDATE_USER', datas)
      })
      .catch((e) => {
        console.log(e)
      })
  },
  deleteUserAccount({ commit, state }) {
    const firebaseProject = this.$fire.database.ref('mapApp')
    firebaseProject.child(state.userAuth.uid).remove()
    return new Promise((resolve, reject) => {
      this.$fire.auth.currentUser
        .delete()
        .then(() => {
          sessionStorage.removeItem('APIGeoMap')
          commit('USER_SIGNOUT')
          resolve(true)
        })
        .catch((error) => {
          console.log(error)
          resolve(false)
        })
    })
  },
  appLoad({ commit }, datas) {
    if (datas) {
      commit('SAVE_MARKERS', datas)
    } else {
      let datasLocalStorage = JSON.parse(sessionStorage.getItem('APIGeoMap'))
      if (datasLocalStorage) {
        commit('SAVE_MARKERS', datasLocalStorage)
      }
    }
  },
  appReset({ commit }) {
    commit('RESET_MARKERS')
    sessionStorage.removeItem('APIGeoMap')
  },
  // LOAD ALL THE ICON FROM ICONDESIGN
  async getMarkersIcons({ commit }) {
    let result = await this.$axios.$get(
      'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
      { crossdomain: true }
    )
    if (result) {
      let listFormated = []
      let listingRaw = result.split('.mdi-')
      listingRaw.forEach((element, i) => {
        let index = element.indexOf(':')
        let icons = element.slice(0, index)
        listFormated.push(icons)
      })
      commit('SAVE_ICONS', listFormated)
    }
  },
  markersOnCreate({ commit, state }, newMarker) {
    let flatMarkers = []
    // converti array en string
    for (let index = 0; index < newMarker.subCategory.length; index++) {
      let multiMarker = {
        id: `IM${index}${Date.now()}`,
        type: newMarker.type,
        category: newMarker.category,
        subCategory: newMarker.subCategory[index],
        icon: newMarker.icon,
        color: newMarker.color[index],
      }
      flatMarkers.push(multiMarker)
    }
    let addedMarker = [...state.markers, ...flatMarkers]
    let datas = {
      GeoJsonDatas: state.GeoJsonDatas,
      markers: addedMarker,
    }
    commit('SAVE_MARKERS', datas)
  },
  updateMarker({ commit, state }, markerToUpdate) {
    return new Promise((resolve, reject) => {
      const index = state.markers.findIndex(
        (elt) => elt.id === markerToUpdate.old.id
      )
      if (markerToUpdate.new) {
        markerToUpdate.index = index
        commit('UPDATE_MARKER', markerToUpdate) // envoie objet avec new color et new sub
      } else {
        commit('UPDATE_MARKER', index) // envoie juste index a supprimer
      }
      resolve(true)
    })
  },
  geoJsonOnCreate({ commit }, newGeoJson) {
    commit('SAVE_GEOJSON', newGeoJson)
  },
  async updateGeoJson({ commit, dispatch }, dataToUpdate) {
    const update = () => {
      return new Promise((resolve, reject) => {
        commit('UPDATE_GEOJSON', dataToUpdate)
        resolve(true)
      })
    }
    const result = await update()
    if (result && dataToUpdate.switch) {
      return dispatch('transferFolder', dataToUpdate)
    } else {
      return result
    }
  },
  async transferFolder({ commit, state }, dataToTransfer) {
    const updateStateFolder = () => {
      return new Promise((resolve, reject) => {
        commit('TRANSFER_GEOJSON', dataToTransfer)
        resolve(true)
      })
    }
    const result = await updateStateFolder()
    if (result) {
      const firebaseProject = this.$fire.database.ref('mapApp')
      await firebaseProject
        .child(state.userAuth.uid)
        .child(dataToTransfer.from)
        .update(state.foldersDatas[dataToTransfer.from])
      await firebaseProject
        .child(state.userAuth.uid)
        .child(dataToTransfer.to)
        .update(state.foldersDatas[dataToTransfer.to])
      return new Promise((resolve, reject) => {
        commit('FOLDER_ACTION', { name: dataToTransfer.to })
        resolve(true)
      })
    }
  },
  geoJsonReset({ commit, state }) {
    commit('RESET_GEOJSON')
  },
  updateMarkCoordinates({ commit }, data) {
    commit('DRAG_MARKER', data)
  },
  addPointLine({ commit }, data) {
    commit('ADD_POINT', data)
  },
  async clickFolder({ commit, state, dispatch }, folder) {
    const firebaseProject = this.$fire.database.ref('mapApp')
    try {
      if (folder.remove) {
        await firebaseProject
          .child(state.userAuth.uid)
          .child(folder.name)
          .remove()
      } else if (folder.new) {
        await firebaseProject
          .child(state.userAuth.uid)
          .child(folder.name)
          .update({
            lastUpdate: Date.now(),
          })
      } else if (folder.rename) {
        await firebaseProject
          .child(state.userAuth.uid)
          .child(folder.name)
          .update(state.foldersDatas[folder.rename])
        await firebaseProject
          .child(state.userAuth.uid)
          .child(folder.rename)
          .remove()
      }
      commit('FOLDER_ACTION', folder)
    } catch (e) {
      console.log(e)
    }
  },
}
// contains your mutations
export const mutations = {
  SAVE_FBJSON(state, FBjson) {
    state.foldersDatas = FBjson
  },
  SAVE_ICONS(state, data) {
    state.iconsList = data
  },
  SAVE_MARKERS(state, data) {
    if (data.merge === true) {
      // REMOVE DUPLICATE MARKERS
      let allMarkersMerge = [...state.markers, ...data.markers]
      let removeDuplicateMarks = allMarkersMerge.filter(
        (value, index, array) =>
          index ===
          array.findIndex(
            (t) =>
              t.category === value.category &&
              t.subCategory === value.subCategory
          )
      )
      state.markers = removeDuplicateMarks
      // MERGE DATAS IF KEY ALREADY EXIST
      let keys = Object.keys(data.GeoJsonDatas)
      keys.forEach((element) => {
        if (state.GeoJsonDatas.hasOwnProperty(element)) {
          // if already exist
          state.GeoJsonDatas[element].push(...data.GeoJsonDatas[element])
        } else {
          state.GeoJsonDatas[element] = data.GeoJsonDatas[element]
        }
      })
    } else {
      state.markers = data.markers ? data.markers : []
      data.GeoJsonDatas ? (state.GeoJsonDatas = data.GeoJsonDatas) : ''
    }
    setStorage(state.markers, state.GeoJsonDatas)
  },
  RESET_MARKERS(state) {
    state.markers = []
    state.GeoJsonDatas = {}
  },
  UPDATE_MARKER(state, update) {
    if (typeof update === 'number') {
      state.markers.splice(update, 1)
    } else {
      //MARKERS
      state.markers.splice(update.index, 1, update.new)
      // IF IT'S A SUB CAT, CHECK THE OTHER MARKERS
      let checkOtherMark = state.markers.filter(
        (e) =>
          (e.category === update.old.category || e.icon === update.old.icon) &&
          e.subCategory.length > 0
      )
      if (checkOtherMark.length > 0) {
        checkOtherMark.forEach((e) => {
          e.icon = update.new.icon
          e.category = update.new.category
        })
      }

      // GEOJSON
      // IF CATEGORY NAME CHANGE = COPY OLD NAME TO THE NEW KEY AND DELETE IT
      // if geojson with old category exist = avoid to create a new one empty
      if (
        state.GeoJsonDatas[update.old.category] &&
        update.new.category != update.old.category
      ) {
        state.GeoJsonDatas[update.new.category] =
          state.GeoJsonDatas[update.old.category]
        delete state.GeoJsonDatas[update.old.category]
      }
      let geoJsonCategorie = state.GeoJsonDatas[update.new.category]
      if (geoJsonCategorie) {
        // if i have not an empty geojson
        update.geosIndex.forEach((element) => {
          geoJsonCategorie[element].icon.color = update.new.color
          geoJsonCategorie[element].icon.type = update.new.icon
          geoJsonCategorie[element].properties.subCategory =
            update.new.subCategory
          geoJsonCategorie[element].properties.category = update.new.category
        })
        // IF IT'S A SUB CAT, CHECK THE OTHER DATAS TO CHANGE
        let checkOtherData = geoJsonCategorie.filter(
          (e) =>
            e.properties.category === update.old.category ||
            e.icon.type === update.old.icon
        )
        if (checkOtherData.length > 0) {
          checkOtherData.forEach((e) => {
            e.icon.type = update.new.icon
            e.properties.category = update.new.category
          })
        }
      }
    }
    setStorage(state.markers, state.GeoJsonDatas)
  },
  UPDATE_GEOJSON(state, update) {
    const geoJsonCategorie = state.GeoJsonDatas[update.data.category]
    const index = geoJsonCategorie.findIndex(
      (elt) => elt.properties.id === update.data.id
    )
    if (update.action) {
      geoJsonCategorie[index].properties = {} // to refresh the state.GeoJsonDatas
      geoJsonCategorie.length === 1
        ? delete state.GeoJsonDatas[update.data.category]
        : geoJsonCategorie.splice(index, 1)
    } else {
      geoJsonCategorie[index].properties = update.data
    }
    setStorage(state.markers, state.GeoJsonDatas)
  },
  TRANSFER_GEOJSON(state, transfer) {
    const arrayGeoJsonFrom =
      state.foldersDatas[transfer.from].GeoJsonDatas[transfer.data.category]
    const indexFrom = arrayGeoJsonFrom.findIndex(
      (e) => e.properties.id === transfer.data.id
    )

    // if to a new create folder, have to define geojson and marker because undefined
    state.foldersDatas[transfer.to].GeoJsonDatas === undefined
      ? (state.foldersDatas[transfer.to].GeoJsonDatas = {})
      : ''
    state.foldersDatas[transfer.to].markers === undefined
      ? (state.foldersDatas[transfer.to].markers = [])
      : ''

    const arrayGeoJsonTo = state.foldersDatas[transfer.to].GeoJsonDatas
    const markerInFolderTo = state.foldersDatas[transfer.to].markers.find(
      (e) =>
        e.category === transfer.data.category &&
        e.subCategory === transfer.data.subCategory
    )

    if (markerInFolderTo) {
      arrayGeoJsonFrom[indexFrom].icon.color = markerInFolderTo.color
      arrayGeoJsonFrom[indexFrom].icon.type = markerInFolderTo.icon
      arrayGeoJsonFrom[indexFrom].properties.subCategory =
        markerInFolderTo.subCategory
    } else {
      state.foldersDatas[transfer.to].markers.push(
        state.markers.find(
          (e) =>
            e.category === transfer.data.category &&
            e.subCategory === transfer.data.subCategory
        )
      )
    }

    arrayGeoJsonTo[transfer.data.category]
      ? arrayGeoJsonTo[transfer.data.category].push(arrayGeoJsonFrom[indexFrom])
      : (arrayGeoJsonTo[transfer.data.category] = [arrayGeoJsonFrom[indexFrom]])

    arrayGeoJsonFrom.length === 1
      ? delete state.foldersDatas[transfer.from].GeoJsonDatas[
          transfer.data.category
        ]
      : arrayGeoJsonFrom.splice(indexFrom, 1)
  },
  SAVE_GEOJSON(state, data) {
    state.GeoJsonDatas[data.properties.category]
      ? state.GeoJsonDatas[data.properties.category].push(data)
      : (state.GeoJsonDatas[data.properties.category] = [data])
    setStorage(state.markers, state.GeoJsonDatas)
  },
  RESET_GEOJSON(state) {
    state.GeoJsonDatas = {}
    setStorage(state.markers)
  },
  DRAG_MARKER(state, data) {
    // find the geojson match with the data.id
    let item = Object.values(state.GeoJsonDatas)
      .flat()
      .find((elt) => elt.properties.id == data.id)
    // update coordinate depending if point or polygon
    item.geometry.type === 'Point'
      ? (item.geometry.coordinates = data.coordinates)
      : item.geometry.coordinates[0].splice(data.index, 1, data.coordinates)
    setStorage(state.markers, state.GeoJsonDatas)
  },
  ADD_POINT(state, data) {
    let item = Object.values(state.GeoJsonDatas)
      .flat()
      .find((elt) => elt.properties.id == data.id)
    item.geometry.coordinates[0].push(data.coordinates)
    setStorage(state.markers, state.GeoJsonDatas)
  },
  // FIREBASE PAGE
  USER_FECTH(state, authUser) {
    const { uid, email, emailVerified, displayName } = authUser
    state.userAuth = { uid, email, emailVerified, displayName }
  },
  UPDATE_USER(state, data) {
    state.userAuth.displayName = data.displayName
  },
  USER_SIGNOUT(state) {
    state.userAuth = undefined
  },
  ERROR_REPONSE(state, message) {
    state.errorMessage = message
  },
  async FOLDER_ACTION(state, folder) {
    if (folder.remove) {
      // remove folder
      // use Vue to keep the getter reactive to the the object
      Vue.delete(state.foldersDatas, folder.name)
    } else if (folder.new) {
      // create folder
      // use Vue to keep the getter reactive to the the object
      Vue.set(state.foldersDatas, folder.name, {
        GeoJsonDatas: {},
        markers: [],
      })
      state.foldersDatas.on = folder.name
      state.markers = []
      state.GeoJsonDatas = {}
      setStorage(state.markers, state.GeoJsonDatas)
    } else if (folder.rename) {
      // rename folder
      const copyFolder = () => {
        return new Promise((resolve, reject) => {
          Vue.set(
            state.foldersDatas,
            folder.name,
            state.foldersDatas[folder.rename]
          )
          Vue.delete(state.foldersDatas, folder.rename)
          resolve(true)
        })
      }
      await copyFolder()
    } else {
      // switch folder
      state.markers = state.foldersDatas[folder.name].markers
        ? state.foldersDatas[folder.name].markers
        : []
      state.GeoJsonDatas = state.foldersDatas[folder.name].GeoJsonDatas
        ? state.foldersDatas[folder.name].GeoJsonDatas
        : {}
      state.foldersDatas.on = folder.name
      setStorage(state.markers, state.GeoJsonDatas)
    }
  },
}
export const getters = {
  GeoJsonTable(state) {
    if (state.GeoJsonDatas) {
      let values = Object.values(state.GeoJsonDatas).flat()
      let array = values.map(({ properties }) => properties)
      return array
    } else {
      return []
    }
  },
  foldersName(state) {
    return Object.keys(state.foldersDatas).filter((e) => e != 'on')
  },
  workOn(state) {
    return state.foldersDatas.on
  },
}
