// holds your root state
export const state = () => ({
    user: undefined,
    errorMessage: undefined,
    markers: [],
    test: 'je suis in the state'
})

// contains your actions
export const actions = {
    // FIREBASE PAGE
    async createNewUser(context, formData) {
        try {
            const newUser = await this.$fire.auth.createUserWithEmailAndPassword(
                formData.email,
                formData.password,
            )
            if (newUser) {
                console.log(
                    "Register success",
                );
                await this.$fire.auth.currentUser
                    .updateProfile({
                        displayName: formData.displayName,
                    })
                    .then(() => {
                        console.log("Profile updated!");
                        context.commit('USER_FECTH', newUser.user)
                    })
                    .catch((error) => {
                        console.log("Faile Profile updated ");
                    });
            }
        } catch (error) {
            context.commit('ERROR_REPONSE', error.message)
        }

    },
    async currentUser({ commit, state }, formData) {
        try {
            let userLog = await this.$fire.auth.signInWithEmailAndPassword(
                formData.email,
                formData.password
            );
            // LISTENER TO THE AUTH CHANGED IF STILL LOG OR NOT
            this.$fire.auth.onAuthStateChanged((user) => {
                if (user) {
                    const uid = user.uid;
                    console.log(user, uid);
                } else {
                    console.log("User is signed out");
                    commit('USER_SIGNOUT')
                }
            });
            console.log(
                "Login success",
                "add the redirect log page when log",
                userLog.user
            );
            commit('USER_FECTH', userLog.user)
        } catch (error) {
            console.log("This email or password doesn't exist");
            commit('ERROR_REPONSE', error.message)
        }
    },
    loadMarkers(context) {
        let results = []
        const requestIndexedDB = window.indexedDB.open('Map_Database', 1)
        requestIndexedDB.onerror = (event) => {
            console.log(event)
        }
        requestIndexedDB.onsuccess = (event) => {
            let db = event.target.result

            let transaction = db.transaction('markers', 'readwrite')
            let store = transaction.objectStore('markers') // store = table in sql
            let idQuery = store.openCursor() // recherche sur l'id
            idQuery.onsuccess = (event) => {
                var cursor = event.target.result

                if (cursor) {
                    // if a get an array of sub category, i create a new object to send in this.markers array
                    if (cursor.value.subCategory.length > 0) {
                        for (
                            let index = 0;
                            index < cursor.value.subCategory.length;
                            index++
                        ) {
                            let multiMarker = {
                                type: cursor.value.type,
                                category: cursor.value.category,
                                subCategory: [],
                                icon: cursor.value.icon,
                                color: [],
                            }
                            multiMarker.subCategory.push(cursor.value.subCategory[index])
                            multiMarker.color.push(cursor.value.color[index])
                            results.push(multiMarker)
                        }
                    } else {
                        results.push(cursor.value)
                    }
                    cursor.continue()
                } else {
                    context.commit('SAVE_MARKERS', results);
                    console.log('No more entries!')

                }
            }
            transaction.oncomplete = () => {
                db.close()
            }
        }

    },
}
// contains your mutations
export const mutations = {
    SAVE_MARKERS(state, data) {
        state.markers = data;
    },
    RESET_MARKERS(state) {
        state.markers = [];
    },
    // FIREBASE PAGE
    USER_FECTH(state, authUser) {
        const { uid, email, emailVerified, displayName } = authUser
        state.user = { uid, email, emailVerified, displayName }
    },
    USER_SIGNOUT(state) {
        state.user = undefined
    },
    ERROR_REPONSE(state, message) {
        state.errorMessage = message
    }
}
