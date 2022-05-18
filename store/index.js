
// holds your root state
export const state = () => ({
    userAuth: undefined,
    errorMessage: undefined,
    markers: [],
    GeoJsonDatas: {}
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
    async login({ commit, dispatch }, formData) {
        try {
            const userLog = await this.$fire.auth.signInWithEmailAndPassword(
                formData.email,
                formData.password
            );
            if (userLog) {
                console.log('log ok');
                const authListener = await this.$fire.auth.onAuthStateChanged((user) => {
                    if (user) {
                        console.log(user);
                    } else {
                        console.log("User is signed out");
                        commit('USER_SIGNOUT')
                    }
                });
                if (authListener) {
                    console.log('ecouteur ok');

                    return new Promise((resolve, reject) => {
                        const messageRef = this.$fire.database.ref('mapApp')
                        try {
                            messageRef.child(userLog.user.uid).once('value', function (snapshot) {
                                // RETRIEVE DATA HERE WITH uid
                                let datas = {
                                    GeoJsonDatas: snapshot.val().GeoJsonDatas,
                                    markers: snapshot.val().markers
                                }
                                commit('USER_FECTH', userLog.user)
                                commit('SAVE_MARKERS', datas);
                                sessionStorage.setItem('APIGeoMap', JSON.stringify(datas))
                                resolve(true)
                            })
                        } catch (error) {
                            reject(error)
                        }
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
                        messageRef.child(user.uid).once('value', function (snapshot) {
                            // RETRIEVE DATA HERE WITH uid
                            let datas = {
                                GeoJsonDatas: snapshot.val().GeoJsonDatas,
                                markers: snapshot.val().markers
                            }
                            commit('SAVE_MARKERS', datas);
                            sessionStorage.setItem('APIGeoMap', JSON.stringify(datas))
                            commit('USER_FECTH', user)
                            resolve(true)
                        })
                    } catch (e) {
                        alert(e)
                        reject(e)
                    }
                } else {
                    dispatch('appLoad')
                    console.log('dispatch to remove on disconnect');
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
        if (datas) {
            commit('SAVE_MARKERS', datas);
            setStorage(datas.markers, datas.GeoJsonDatas)
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
    markersOnCreate({ commit, state }, newMarker) {
        let flatMarkers = []
        // converti array en string
        if (newMarker.subCategory.length === 0) {
            newMarker.subCategory = newMarker.subCategory[0]
            newMarker.color = newMarker.color[0]
            flatMarkers.push(newMarker)
        } else {
            for (
                let index = 0;
                index < newMarker.subCategory.length;
                index++
            ) {
                let multiMarker = {
                    type: newMarker.type,
                    category: newMarker.category,
                    subCategory: newMarker.subCategory[index],
                    icon: newMarker.icon,
                    color: newMarker.color[index],
                }
                flatMarkers.push(multiMarker)
            }
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
                    elt.category === markerToUpdate.id.category &&
                    elt.subCategory === markerToUpdate.id.subCategory
            )
            if (index > -1) {
                if (markerToUpdate.update) {
                    let update = {
                        index: index,
                        new: markerToUpdate.update,
                    }
                    commit('UPDATE_MARKER', update); // envoie objet avec new color et new sub
                } else {
                    commit('UPDATE_MARKER', index); // envoie juste index a supprimer
                }
                resolve(true)
            } else {
                reject(false)
                alert('This marker is not find')
            }
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
    SAVE_MARKERS(state, data) {
        state.markers = data.markers;
        data.GeoJsonDatas ? state.GeoJsonDatas = data.GeoJsonDatas : '';
    },
    RESET_MARKERS(state) {
        state.markers = [];
        state.GeoJsonDatas = []
    },
    UPDATE_MARKER(state, update) {
        if (typeof (update) === 'number') {
            state.markers.splice(update, 1)
        } else {
            state.markers[update.index].color = update.new.color
            state.markers[update.index].subCategory = update.new.subCategory.length > 0 ? update.new.subCategory : ''
            let geoJsonCategorie = state.GeoJsonDatas[update.new.GeoJson.name]
            update.new.GeoJson.index.forEach(element => {
                geoJsonCategorie[element].icon.color = update.new.color
                geoJsonCategorie[element].properties.subCategory = update.new.subCategory
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
                subCategory: ['subcat'],
                icon: 'home',
                color: ['red'],
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
