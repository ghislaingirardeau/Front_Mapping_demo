export default {
    methods: {
        layersMapsMixin() {
            const tokenMapbox =
                'pk.eyJ1IjoiZ2d3ZWJkZXYiLCJhIjoiY2t4OGVhemd5MXpyMzJvbzE4ZXpxajJzZCJ9.P2KXn7NQDyQ11BkYVkPEcQ'
            const mapBoxUrl = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${tokenMapbox}`
            const mapboxStreets = 'mapbox/streets-v11'
            const mapboxOutdoors = 'mapbox/outdoors-v11'
            const mapboxAttribution =
                'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
            const data = {}
            // pour switcher sur different layers
            data.outdoors = L.tileLayer(mapBoxUrl, {
                id: mapboxOutdoors,
                tileSize: 512,
                zoomOffset: -1,
                attribution: mapboxAttribution,
                accessToken: tokenMapbox,
            })
            data.streets = L.tileLayer(mapBoxUrl, {
                id: mapboxStreets,
                tileSize: 512,
                zoomOffset: -1,
                attribution: mapboxAttribution,
                accessToken: tokenMapbox,
            })
            data.landscape = L.tileLayer(
                'https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=05002ac7d7034aec81f8963fa723e851'
            )
            data.google = L.tileLayer(
                'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
                {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                }
            )
            return data
        },
        createGeoJsonMixin(layerType, groupLayer) {
            // layerType = le geojson que je souhaite envoyer dans le layer
            // groupLayer = dans quel groupe de layer je charge celui-ci : village ou house

            const onEachFeature = async (feature, layer) => {
                const createLayer = () => {
                    return new Promise((resolve, reject) => {
                        const showPopupMarker = (e) => {
                            var layer = e.target
                            layer.openPopup()
                        }

                        const hidePopupMarker = (e) => {
                            var layer = e.target
                            layer.closePopup()
                        }

                        const editLocation = (e) => {
                            // EDIT LOCATION
                            this.editItem = structuredClone({ ...e.target.feature })
                            // if it's a point or a polygon, store array of coordinates differently
                            this.editItem.geometry.type === 'Point'
                                ? (this.pointsOfLocation.coordinates = [
                                    structuredClone(this.editItem.geometry.coordinates),
                                ])
                                : (this.pointsOfLocation.coordinates = structuredClone(
                                    this.editItem.geometry.coordinates[0]
                                ))
                            // get the id of the geojson to change
                            this.pointsOfLocation.id = this.editItem.properties.id

                            // EDIT MARKER
                            this.oldMark = this.markers.find(
                                (elt) =>
                                    elt.category === this.editItem.properties.category &&
                                    elt.icon === this.editItem.icon.type &&
                                    elt.color === this.editItem.icon.color &&
                                    elt.subCategory === this.editItem.properties.subCategory
                            )
                            if (this.editItem.properties.subCategory.length > 0) {
                                this.rulesEditSub = [
                                    (v) => v.length > 1 || 'minimum 2 characters',
                                ]
                            } else {
                                this.rulesEditSub = [true]
                            }
                            this.editMarker = structuredClone(this.oldMark)

                            this.editShow.menu = !this.editShow.menu
                        }
                        // pour faire apparaitre le popup du marker si popupContent est defini
                        if (feature.properties && feature.properties.popupContent) {
                            layer.bindPopup(feature.properties.popupContent)
                        }
                        layer.on({
                            mouseover: showPopupMarker,
                            mouseout: hidePopupMarker,
                            click: editLocation,
                        })
                        resolve(true)
                    })
                }
                let response = await createLayer()
                if (response) {
                    // dynamic show of layer if it's activated or not
                    if (
                        layer instanceof L.Polygon ||
                        (layer instanceof L.Path && layer.feature)
                    ) {
                        this.measureActive
                            ? layer.showMeasurements()
                            : layer.hideMeasurements()
                    }
                }
            }

            // FUNCTION RETURN ICON HOUSE SVG DEPENDING ON COLOR PARAMS
            const createIcon = (type, color, size, name) => {
                let showHtml = `<i aria-hidden="true" class="v-icon notranslate mdi mdi-${type} theme--dark icon__layer--update--size" style="font-size: ${size}px; color:${color};"></i>`
                return L.divIcon({
                    className: `${type}-icon`,
                    html: showHtml,
                })
            }

            try {
                this.layerGeoJson = L.geoJSON(layerType, {
                    // on peut enchainer les options ici
                    onEachFeature: onEachFeature,
                    pointToLayer: (feature, latlng) => {
                        // CREATE THE MARKERS
                        return L.marker(latlng, {
                            icon: createIcon(
                                feature.icon.type,
                                feature.icon.color,
                                20,
                                feature.properties.name
                            ),
                        })
                    },
                    style: (feature) => {
                        // DEFINE SYTLE OF POLYGONS AND LINE
                        return { color: feature.icon.color, weight: 4 }
                    },
                })

                // GROUPE DE LAYER DANS LEQUEL J'ENREGISTRE LE JSON
                groupLayer.addLayer(this.layerGeoJson)
            } catch (error) {
                console.log(error);
            }

        },
        GPSLocation(element) {
            const disabledBtn = (boolean) => {
                if (element) {
                    this.disableLocation.track = boolean
                    this.disableLocation.target = boolean
                } else {
                    this.disableLocation.position = boolean
                    this.disableLocation.target = boolean
                }
            }
            // customize pseudo element before (already use on the button for the icon)
            let eltBefore = document.getElementsByClassName('btn__location')[0]
            element
                ? eltBefore.style.setProperty('--selection-top', '20px')
                : eltBefore.style.setProperty('--selection-top', '90px')

            if (this.markers.length === 0) {
                this.modalShow.generic = !this.modalShow.generic
                this.modalShow.modalTitle = 'Add a location'
                this.modalShow.modalMessage =
                    'Create a marker before to add a location !'
            } else {
                if (this.watchMe) {
                    navigator.geolocation.clearWatch(this.watchMe)
                    this.watchMe = undefined
                    this.modalShow.addLocation = true
                    this.hubPosition = false
                    this.disableAction = !this.disableAction
                    disabledBtn(false)
                    eltBefore.style.setProperty('--selection-block', 'none')
                    gsap.to(".btn-location-position", {
                        duration: 1.4,
                        rotateZ: '0deg',
                        ease: 'elastic.out(1, 0.3)',
                    })
                } else {
                    this.disableAction = !this.disableAction
                    disabledBtn(true)
                    gsap.to(".btn-location-position", {
                        duration: 1.4,
                        rotateZ: '90deg',
                        ease: 'elastic.out(1, 0.3)',
                    })

                    const success = (position) => {
                        this.hubPosition = true
                        
                        this.accuracyLocation = position.coords.accuracy
                        
                        if (element && this.accuracyLocation < 10) {
                            this.coordinates = [
                                [position.coords.longitude, position.coords.latitude],
                            ]
                            eltBefore.style.setProperty('--selection-block', 'block')
                            gsap.to(".btn-location-position", {
                                duration: 1.4,
                                rotateZ: '180deg',
                                ease: 'elastic.out(1, 0.3)',
                            })
                        } else if (this.accuracyLocation < 10) {
                            // show only if accuracy is good
                            eltBefore.style.setProperty('--selection-block', 'block')
                            this.coordinates.push([
                                position.coords.longitude,
                                position.coords.latitude,
                            ])
                        }

                        let updatePositionMarker = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        }
                        this.myLocationMark
                            .setLatLng(updatePositionMarker)
                            .setRadius(position.coords.accuracy)

                        this.map.flyTo(updatePositionMarker, 16)
                        this.myLocationMark.addTo(this.map)
                    }

                    let error = () => {
                        this.modalShow.modalTitle = 'Unable to retrieve your location'
                        this.modalShow.generic = true
                    }

                    if (navigator.geolocation) {
                        this.watchMe = navigator.geolocation.watchPosition(success, error, {
                            enableHighAccuracy: true,
                            maximumAge: 0,
                        })
                    } else {
                        this.modalShow.modalTitle =
                            'Geolocation is not supported by your browser'
                        this.modalShow.generic = true
                    }
                }
            }
        },
        targetLocation() {
            gsap.to(".btn-location-target", {
                duration: 1.4,
                rotateZ: '90deg',
                ease: 'elastic.out(1, 0.3)',
            })
            if (this.markers.length === 0) {
                this.modalShow.generic = !this.modalShow.generic
                this.modalShow.modalTitle = 'Add a location'
                this.modalShow.modalMessage =
                    'Create a marker before to add a location !'
            } else {
                // disable all btn
                Object.keys(this.disableLocation).forEach((element) => {
                    this.disableLocation[element] = true
                })
                this.disableAction = !this.disableAction
                // LOAD THE HUB FOR TARGET
                let x = this.map.getSize().x / 2 - 24
                let y = this.map.getSize().y / 2 - 49.5

                let icon = document.getElementById('hubTarget')
                icon.style.display = 'block'
                let tuto = document.getElementById('hubTuto')
                tuto.style.display = 'block'
                let hub = document.getElementById('hub')
                hub.style.display = 'flex'

                icon.style.top = `${y}px`
                icon.style.left = `${x}px`
                tuto.style.top = `${y - 10}px`
                tuto.style.left = `${x - 10}px`
                hub.style.top = `${y + 100}px`
                hub.style.left = `${x + 20}px`
            }
        }

    },
}