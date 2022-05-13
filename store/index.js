// holds your root state
export const state = () => ({
    userAuth: undefined,
    errorMessage: undefined,
    markers: [],
    GeoJsonDatas: {}
})

// contains your actions
export const actions = {
    // FIREBASE PAGE
    async createNewUser({ commit, state }, formData) {
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
                    commit('USER_FECTH', newUser.user)

                    const messageRef = this.$fire.database.ref('mapApp')
                    await messageRef.child(newUser.user.uid).set({
                        markers: state.markers.length != 0 ? state.markers : [{
                            type: 'Point',
                            category: 'test',
                            subCategory: [''],
                            icon: 'home',
                            color: ['blue'],
                        }],
                        GeoJsonDatas: state.GeoJsonDatas
                    })
                    console.log('data ok')
                }
            }
        } catch (error) {
            commit('ERROR_REPONSE', error.message)
        }

    },
    async currentUser({ commit, state }, formData) {
        try {
            const userLog = await this.$fire.auth.signInWithEmailAndPassword(
                formData.email,
                formData.password
            );
            if (userLog) {
                console.log('log ok');
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
                    commit('USER_FECTH', userLog.user)

                    const messageRef = this.$fire.database.ref('mapApp')
                    try {
                        messageRef.child(userLog.user.uid).once('value', function (snapshot) {
                            // RETRIEVE DATA HERE WITH uid
                            let datas = {
                                GeoJsonDatas: snapshot.val().GeoJsonDatas,
                                markers: snapshot.val().markers
                            }
                            console.log(datas);
                            commit('SAVE_MARKERS', datas);
                            localStorage.setItem('APIGeoMap', JSON.stringify(datas))
                        })
                    } catch (e) {
                        alert(e)
                    }
                }
            }
            // LISTENER TO THE AUTH CHANGED IF STILL LOG OR NOT
        } catch (error) {
            console.log("This email or password doesn't exist");
            commit('ERROR_REPONSE', error.message)
        }
    },
    appLoad({ commit }, datas) {
        if (datas) {
            /* localStorage.setItem('APIGeoMap', JSON.stringify(datas)) */
            commit('SAVE_MARKERS', datas);
        } else {
            let datasLocalStorage = JSON.parse(localStorage.getItem('APIGeoMap'))
            if (datasLocalStorage) {
                commit('SAVE_MARKERS', datasLocalStorage);
            }
        }
    },
    appReset({ commit }) {
        commit('RESET_MARKERS')
        localStorage.removeItem('APIGeoMap')
    },
    markersOnCreate({ commit, state }, newMarker) {
        let flatMarkers = []
        if (newMarker.subCategory.length > 0) {
            for (
                let index = 0;
                index < newMarker.subCategory.length;
                index++
            ) {
                let multiMarker = {
                    type: newMarker.type,
                    category: newMarker.category,
                    subCategory: [newMarker.subCategory[index]],
                    icon: newMarker.icon,
                    color: [newMarker.color[index]],
                }
                flatMarkers.push(multiMarker)
            }
        } else {
            flatMarkers.push(newMarker)
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
                    elt.subCategory[0] === markerToUpdate.id.subCategory[0]
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
        localStorage.setItem('APIGeoMap', JSON.stringify({ markers: state.markers }))
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
            state.markers[update.index].color.splice(0, 1, update.new.color)
            state.markers[update.index].subCategory.splice(0, 1, update.new.subCategory)
            let geoJsonCategorie = state.GeoJsonDatas[update.new.GeoJson.name]
            update.new.GeoJson.index.forEach(element => {
                geoJsonCategorie[element].icon.color = update.new.color
                geoJsonCategorie[element].properties.subCategory = update.new.subCategory
            });
        }
        localStorage.setItem('APIGeoMap', JSON.stringify({
            markers: state.markers,
            GeoJsonDatas: state.GeoJsonDatas
        }))
    },
    UPDATE_GEOJSON(state, update) {
        const geoJsonCategorie = state.GeoJsonDatas[update.index.category]
        const index = geoJsonCategorie.findIndex(elt => elt.properties.id === update.index.id)
        if (update.action) {
            console.log(geoJsonCategorie);
            geoJsonCategorie.length === 1 ? delete state.GeoJsonDatas[update.index.category] : geoJsonCategorie.splice(index, 1)
        } else {
            geoJsonCategorie[index].properties = update.index 
        }
    },
    SAVE_GEOJSON(state, data) {
        state.GeoJsonDatas[data.properties.category] ?
            state.GeoJsonDatas[data.properties.category].push(data) :
            state.GeoJsonDatas[data.properties.category] = [data]
    },
    RESET_GEOJSON(state) {
        state.GeoJsonDatas = []
    },
    // FIREBASE PAGE
    USER_FECTH(state, authUser) {
        const { uid, email, emailVerified, displayName } = authUser
        state.userAuth = { uid, email, emailVerified, displayName }
        state.markers.length === 0 ?
            state.markers = [{
                type: 'Point',
                category: 'test',
                subCategory: [''],
                icon: 'home',
                color: ['blue'],
            }]
            : ""
    },
    USER_SIGNOUT(state) {
        state.userAuth = undefined
    },
    ERROR_REPONSE(state, message) {
        state.errorMessage = message
    },
}
