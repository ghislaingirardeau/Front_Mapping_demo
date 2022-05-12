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
                        console.log(user, uid);
                    } else {
                        console.log("User is signed out");
                        commit('USER_SIGNOUT')
                    }
                });
                if (authListener) {
                    console.log('ecouteur ok');
                    commit('USER_FECTH', newUser.userAuth)

                    const messageRef = this.$fire.database.ref('mapApp')
                    const geoFromLocal = JSON.parse(localStorage.getItem("APIGeoMap"));
                    await messageRef.child(newUser.userAuth.uid).set({
                        markers: state.markers,
                        GeoJsonDatas: geoFromLocal.GeoJsonDatas ? geoFromLocal.GeoJsonDatas : ''
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
        console.log(addedMarker);
        let datas = {
            GeoJsonDatas: state.GeoJsonDatas,
            markers: addedMarker
        }
        commit('SAVE_MARKERS', datas);
    },
    appLoad({ commit }) {
        let markersLocalStorage = JSON.parse(localStorage.getItem('APIGeoMap'))
        if (markersLocalStorage) {
            commit('SAVE_MARKERS', markersLocalStorage);
        }
    },
    appUpdate({ commit }, datas) {
        commit('SAVE_MARKERS', datas);
    },
    appReset({ commit }) {
        commit('RESET_MARKERS')
        localStorage.removeItem('APIGeoMap')
    },
    geoJsonOnCreate({ commit }, newGeoJson) {
        commit('SAVE_GEOJSON', newGeoJson)
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
    },
    USER_SIGNOUT(state) {
        state.userAuth = undefined
    },
    ERROR_REPONSE(state, message) {
        state.errorMessage = message
    },
}
