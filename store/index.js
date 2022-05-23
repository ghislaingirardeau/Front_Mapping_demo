
// holds your root state
export const state = () => ({
    userAuth: undefined,
    errorMessage: undefined,
    markers: [],
    GeoJsonDatas: {},
    iconsList: []
})

const setStorage = (markers, GeoJsonDatas) => {
    sessionStorage.setItem('APIGeoMap', JSON.stringify({
        markers: markers,
        GeoJsonDatas: GeoJsonDatas
    }))
}

// contains your actions
export const actions = {
    // FIREBASE PAGE
    async signUp({ commit, state }, formData) {
        try {
            const newUser = await this.$fire.auth.createUserWithEmailAndPassword(
                formData.email,
                formData.password,
            )
            if (newUser) {
                console.log('add name');
                await this.$fire.auth.currentUser
                    .updateProfile({
                        displayName: formData.displayName,
                    })
                const authListener = await this.$fire.auth.onAuthStateChanged((user) => {
                    if (user) {
                        const uid = user.uid;
                    } else {
                        console.log("User is signed out");
                        commit('USER_SIGNOUT')
                    }
                });
                if (authListener) {
                    console.log('ecouteur ok');
                    return new Promise((resolve, reject) => {
                        commit('USER_FECTH', newUser.user)

                        const messageRef = this.$fire.database.ref('mapApp')
                        messageRef.child(newUser.user.uid).set({
                            markers: state.markers,
                            GeoJsonDatas: state.GeoJsonDatas
                        })
                        resolve(true)
                    });
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
            );
            
            if (userLog) {
                console.log('log ok');
                const messageRef = this.$fire.database.ref('mapApp')
                let dataDB = await messageRef.child(userLog.user.uid).once('value', function (snapshot) {
                    if (formData.checkboxMerge) {
                        console.log(snapshot.val().markers);

                        messageRef.child(userLog.user.uid).update({
                            markers: [state.markers, snapshot.val().markers].flat(),
                            GeoJsonDatas: Object.assign(state.GeoJsonDatas, snapshot.val().GeoJsonDatas)
                        })
                    }
                    commit('USER_FECTH', userLog.user)
                })
                if (dataDB) {
                    return new Promise((resolve, reject) => {
                        resolve(true)
                    });
                }
            }
            // LISTENER TO THE AUTH CHANGED IF STILL LOG OR NOT
        } catch (error) {
            console.log("This email or password doesn't exist");
            commit('ERROR_REPONSE', error.message)
        }
    },
    async keepConnection({ commit, dispatch }) {
        return new Promise((resolve, reject) => {
            this.$fire.auth.onAuthStateChanged((user) => {
                if (user) {
                    const messageRef = this.$fire.database.ref('mapApp')
                    try {
                        messageRef.child(user.uid).once('value', (snapshot) => {
                            // RETRIEVE DATA HERE WITH uid
                            let datas = {
                                GeoJsonDatas: snapshot.val().GeoJsonDatas ? snapshot.val().GeoJsonDatas : {},
                                markers: snapshot.val().markers
                            }
                            commit('SAVE_MARKERS', datas);
                            console.log('keepconnection');
                            commit('USER_FECTH', user)
                            resolve(true)
                        })
                    } catch (e) {
                        alert(e)
                        reject(e)
                    }
                } else {
                    dispatch('appLoad')
                    resolve(true)
                }
            })
        });
    },
    async updateUser({ commit }, datas) {
        console.log(datas);
        await this.$fire.auth.currentUser
            .updateProfile({
                displayName: datas.displayName,
                photoURL: datas.photoURL
            })
            .then(() => {
                commit('UPDATE_USER', datas)
            })
            .catch(e => {
                console.log(e);
            })
    },
    appLoad({ commit }, datas) {
        console.log('appLoad');
        if (datas) {
            commit('SAVE_MARKERS', datas)
            
        } else {
            let datasLocalStorage = JSON.parse(sessionStorage.getItem('APIGeoMap'))
            if (datasLocalStorage) {
                commit('SAVE_MARKERS', datasLocalStorage);
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
            'https://pictogrammers.github.io/@mdi/font/6.5.95/css/materialdesignicons.min.css'
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
        for (
            let index = 0;
            index < newMarker.subCategory.length;
            index++
        ) {
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
            markers: addedMarker
        }
        commit('SAVE_MARKERS', datas);
    },
    updateMarker({ commit, state }, markerToUpdate) {
        return new Promise((resolve, reject) => {
            const index = state.markers.findIndex(
                elt =>
                    elt.id === markerToUpdate.old.id
            )
            if (markerToUpdate.new) {
                markerToUpdate.index = index
                commit('UPDATE_MARKER', markerToUpdate); // envoie objet avec new color et new sub
            } else {
                commit('UPDATE_MARKER', index); // envoie juste index a supprimer
            }
            resolve(true)
        });
    },
    geoJsonOnCreate({ commit }, newGeoJson) {
        commit('SAVE_GEOJSON', newGeoJson)
    },
    updateGeoJson({ commit, state }, dataToUpdate) {
        commit('UPDATE_GEOJSON', dataToUpdate);
    },
    geoJsonReset({ commit, state }) {
        commit('RESET_GEOJSON')
    },
}
// contains your mutations
export const mutations = {
    SAVE_ICONS(state, data) {
        state.iconsList = data;
    },
    SAVE_MARKERS(state, data) {
        if (data.merge === true) {
            state.markers.push(...data.markers);
            Object.assign(state.GeoJsonDatas, data.GeoJsonDatas)
            console.log('merge true');
        } else {
            console.log('merge false');
            state.markers = data.markers;
            data.GeoJsonDatas ? state.GeoJsonDatas = data.GeoJsonDatas : '';
        }
        setStorage(state.markers, state.GeoJsonDatas)
    },
    RESET_MARKERS(state) {
        state.markers = [];
        state.GeoJsonDatas = []
    },
    UPDATE_MARKER(state, update) {
        if (typeof (update) === 'number') {
            state.markers.splice(update, 1)
        } else {
            //MARKERS
            state.markers.splice(update.index, 1, update.new)
            // GEOJSON
            // IF CATEGORY NAME CHANGE = COPY OLD NAME TO THE NEW KEY AND DELETE IT
            if (update.new.category != update.old.category) {
                state.GeoJsonDatas[update.new.category] = state.GeoJsonDatas[update.old.category]
                delete state.GeoJsonDatas[update.old.category]
            }
            let geoJsonCategorie = state.GeoJsonDatas[update.new.category]
            update.geosIndex.forEach(element => {
                geoJsonCategorie[element].icon.color = update.new.color
                geoJsonCategorie[element].icon.type = update.new.icon
                geoJsonCategorie[element].properties.subCategory = update.new.subCategory
                geoJsonCategorie[element].properties.category = update.new.category
            });
        }
        setStorage(state.markers, state.GeoJsonDatas)
    },
    UPDATE_GEOJSON(state, update) {
        const geoJsonCategorie = state.GeoJsonDatas[update.index.category]
        const index = geoJsonCategorie.findIndex(elt => elt.properties.id === update.index.id)
        if (update.action) {
            geoJsonCategorie[index].properties = {} // to refresh the state.GeoJsonDatas
            geoJsonCategorie.length === 1 ? delete state.GeoJsonDatas[update.index.category] : geoJsonCategorie.splice(index, 1)
        } else {
            geoJsonCategorie[index].properties = update.index
        }
        setStorage(state.markers, state.GeoJsonDatas)
    },
    SAVE_GEOJSON(state, data) {
        state.GeoJsonDatas[data.properties.category] ?
            state.GeoJsonDatas[data.properties.category].push(data) :
            state.GeoJsonDatas[data.properties.category] = [data]
        setStorage(state.markers, state.GeoJsonDatas)
    },
    RESET_GEOJSON(state) {
        state.GeoJsonDatas = []
        setStorage(state.markers)
    },
    // FIREBASE PAGE
    USER_FECTH(state, authUser) {
        const { uid, email, emailVerified, displayName } = authUser
        state.userAuth = { uid, email, emailVerified, displayName }
        state.markers.length === 0 ?
            state.markers = [{
                type: 'Point',
                category: 'test',
                subCategory: '',
                icon: 'home',
                color: 'red',
            }]
            : ""
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
}
export const getters = {
    GeoJsonTable(state) {
        let values = Object.values(state.GeoJsonDatas).flat()
        let array = values.map(({ properties }) => properties)
        return array
    },
}
