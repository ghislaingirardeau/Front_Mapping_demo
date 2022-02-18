<template>
  <div class="container">

    <modalCustom :showModal="showModal" @send-modal="modalResponse">
        <template v-slot:title>
          {{modalTitle}}
        </template>
        <template v-slot:content>
          <legendModal v-if="showLegend" />
          <dataGeoJson
            v-if="showInputGeoDetail"
            @send-data="getData"
            :geoJsonHouse="geoJsonHouse"
            :geoJsonVillage="geoJsonVillage"
            :coordinates="coordinates"
          />
          <exportCSV v-if="modalExport" />
        </template>
    </modalCustom>

    <div id="helpModal" class="modal_help">
      <!-- Modal content -->
      <div class="modal_close">
        <span class="modal_close-icon">&times;</span>
      </div>
      <div v-show="messageModal" class="modal_message">
        <p>{{ messageModal }}</p>
      </div>

      <div v-show="!messageModal" class="modal_tuto">
        <div class="modal_tuto-actions">
          <p v-for="item in tutorials" :key="item">
            {{ item }}
          </p>
        </div>
      </div>
    </div>

    <div id="map" class="mt-5"></div>
    
  </div>
</template>

<script>
import dataGeoJson from "@/components/leaflet/dataGeoJson.vue";
import legendModal from "~/components/leaflet/legendModal.vue";
import exportCSV from "@/components/leaflet/exportCSV.vue";
import modalCustom from "@/components/leaflet/modalCustom.vue";

export default {
  async asyncData({ $content }) {
    // convert the coordinates
    const convertCoordinate = (coordinates, data) => {
      let indexLng = data.indexOf("'");
      if (indexLng === -1) {
        coordinates.push(parseFloat(data));
      } else {
        let degres = data.slice(0, indexLng);
        let minute = data.slice(indexLng + 1) / 60;
        coordinates.push(parseFloat(degres) + parseFloat(minute));
      }
    };
    // function to create the layer for each category of json
    const createGeoJsons = (element, layer) => {
      let coordinates = [];
      if (element.coordinates.indexOf("/") === -1) {
        let coordinateNumber = element.coordinates.split(" ");
        coordinateNumber.forEach((element) => {
          convertCoordinate(coordinates, element);
        });
      } else {
        let coordinateNumber = element.coordinates.split("/");
        let array = [];
        coordinateNumber.forEach((element) => {
          array.push(element.split(" "));
        });
        coordinates.push(array);
      }
      let newGeoJson = {
        type: "Feature",
        properties: {
          name: element.name,
          popupContent: element.popupContent,
          category: element.category,
          subCategory: element.subcategory,
        },
        geometry: {
          type: element.type,
          coordinates: coordinates,
        },
      };
      layer.push(newGeoJson);
    };

    let geoJsonVillage = [];
    let geoJsonHouse = [];

    const doc = await $content("myNewData").fetch(); // convert CSV files in content folder to json

    doc.body.forEach((element) => {
      if (element.category === "house") {
        createGeoJsons(element, geoJsonHouse);
      } else {
        createGeoJsons(element, geoJsonVillage);
      }
    });

    return { geoJsonHouse, geoJsonVillage };
  },
  data: () => ({
    map: Object,
    coordinates: [],
    myLocationMark: undefined,
    clickMapMark: undefined,
    showInputGeoDetail: false,
    housesLayer: [],
    villageLayer: [],
    lastItem: undefined,
    layerGeoJson: undefined,
    layerStorageControl: undefined,
    layerActionControl: undefined,
    btnMeasure: true,
    messageModal: undefined,
    watchMe: undefined,
    accuracyLocation: undefined,
    tutorials: [
      "Select layers to show -->",
      "Find me and add a coordinate -->",
      "Track me and add an area -->",
      "Delete last item -->",
      "Mode full screen -->",
      "Show the legend -->",
      "Show/hide measure area -->"
    ],
    showModal: false,
    showLegend: false,
    modalTitle: undefined,
    modalExport: false,
  }),
  components: {
    dataGeoJson,
    legendModal,
    exportCSV,
    modalCustom
  },
  methods: {
    helpModal() {
      // affiche un message lors du click
      var modal = document.getElementById("helpModal");
      var span = document.getElementsByClassName("modal_close-icon")[0];
      modal.style.display = "block";
      const resetModal = (display) => {
        display.style.display = "none";
        this.messageModal = undefined;
      };
      span.onclick = () => {
        resetModal(modal);
      };
      window.onclick = (event) => {
        if (event.target == modal) {
          resetModal(modal);
        }
      };
    },
    modalResponse(payload) {
      this.showModal = payload.message;
      this.showLegend = payload.message;
      this.modalExport = payload.message;
      this.showInputGeoDetail = payload.message;
    },
    getData(payload) {
      this.showInputGeoDetail = payload.show;
      this.showModal = payload.show;
      this.lastItem = payload.layerGroup;

      switch (this.lastItem) {
        case "house":
          this.createGeoJsonLayer(this.geoJsonHouse, this.houseLayer);
          break;
        case "village":
          this.createGeoJsonLayer(this.geoJsonVillage, this.villageLayer);
          break;
      }

      if (payload.resetCoordinates) {
        this.coordinates = [];
      }
      this.myLocationMark;
      this.clickMapMark.remove(this.map); // retire le marker click
    },
    createGeoJsonLayer(layerType, groupType) {
      // layerType = le geojson que je souhaite envoyer dans le layer
      // groupType = dans quel groupe de layer je charge celui-ci : village ou house

      function showPopupMarker(e) {
        var layer = e.target;
        layer.openPopup();
      }

      function hidePopupMarker(e) {
        var layer = e.target;
        layer.closePopup();
      }

      function onEachFeature(feature, layer) {
        // pour faire apparaitre le popup du marker si popupContent est defini
        if (feature.properties && feature.properties.popupContent) {
          layer.bindPopup(feature.properties.popupContent);
        }
        layer.on({
          mouseover: showPopupMarker,
          mouseout: hidePopupMarker,
        });
      }

      // FUNCTION RETURN ICON HOUSE SVG DEPENDING ON COLOR PARAMS
      function createIcon(category, subCategory, size) {
        let colors;
        let path;
        let view = "0 0 24 24";
        if (category === "house") {
          switch (subCategory) {
            case "not interview":
              colors = "black";
              break;
            case "indebted":
              colors = "orange";
              break;
            case "interview":
              colors = "green";
              break;
            case "lost land":
              colors = "red";
              break;
          }
        }
        if (category === "well") {
          switch (subCategory) {
            case "private":
              colors = "blue";
              break;
            case "public":
              colors = "red";
              break;
          }
        }
        switch (
          category // ICON DEPENDING ON THE CATEGORY
        ) {
          case "house":
            path = `<path fill="${colors}" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />`;
            break;
          case "bath":
            view = "0 0 512 512";
            path = `<path d="M511.094,264.722c-1.136-3.307-28.511-81.137-89.171-95.166c-30.729-7.107-63.124,3.303-96.526,30.938v-35.663    c6.222-2.428,10.637-8.464,10.637-15.545s-4.415-13.117-10.637-15.545V21.124c0-9.22-7.475-16.696-16.696-16.696h-89.595    c-9.22,0-16.696,7.475-16.696,16.696v46.166c-18.137-33.54-41.579-53.478-69.951-59.406C71.508-4.849,13.992,54.3,11.574,56.825    C6.875,61.728,5.615,68.989,8.387,75.19c2.773,6.2,9.015,10.103,15.811,9.873c82.495-2.81,169.04,34.422,169.902,34.798    c2.146,0.936,4.415,1.391,6.668,1.391c0.55,0,1.097-0.031,1.643-0.085v12.741c-5.986,2.538-10.185,8.467-10.185,15.378    s4.2,12.84,10.185,15.378v99.481c-13.69-36.175-34.515-59.305-62.158-68.907C81.436,174.809,16.819,226.106,14.098,228.3    c-5.288,4.262-7.467,11.302-5.513,17.805c1.956,6.503,7.654,11.176,14.416,11.815c6.876,0.651,13.745,1.588,20.559,2.751    c-26.815,24.958-41.321,57.285-42.141,59.145c-2.739,6.214-1.443,13.469,3.281,18.349c3.208,3.314,7.561,5.083,11.999,5.083    c2.096,0,4.212-0.395,6.233-1.209c76.563-30.832,170.624-25.43,171.564-25.372c2.816,0.178,5.51-0.359,7.913-1.449v27.787    c-5.986,2.538-10.185,8.467-10.185,15.378s4.2,12.84,10.185,15.378v117.115c0,9.22,7.475,16.696,16.696,16.696H308.7    c9.22,0,16.696-7.475,16.696-16.696V373.928c6.222-2.428,10.637-8.464,10.637-15.545s-4.415-13.117-10.637-15.545v-97.236    c22.507,1.287,99.826,7.886,162.387,39.448c2.383,1.202,4.958,1.79,7.516,1.79c3.954,0,7.87-1.404,10.977-4.113    C511.396,278.264,513.3,271.144,511.094,264.722z M70.033,53.522c16.303-9.503,36.4-16.998,55.681-12.936    c16.129,3.398,30.358,14.887,42.528,34.277C142.992,66.766,107.92,57.514,70.033,53.522z M55.265,296.723    c8.409-10.079,18.888-19.87,31.085-25.859c14.339,4.315,27.897,9.235,40.144,14.176    C104.959,286.978,80.307,290.495,55.265,296.723z M72.688,232.553c17.389-7.306,38.216-12.161,56.607-5.773    c15.598,5.418,28.267,18.643,37.87,39.466C143.202,255.001,109.679,241.362,72.688,232.553z M292.005,474.18h-56.204v-99.102    h56.204V474.18z M292.005,341.687h-56.204V165.981h56.204V341.687z M292.005,132.589h-56.204v-94.77h56.204V132.589z     M361.327,215.325c19.184-12.489,36.925-16.945,52.99-13.256c19.207,4.408,34.299,19.645,45.106,35.114    C423.36,224.901,387.642,218.575,361.327,215.325z"/> `;
            break;
          case "grave":
            path = `<path fill="black" d="M10,2H14C17.31,2 19,4.69 19,8V18.66C16.88,17.63 15.07,17 12,17C8.93,17 7.12,17.63 5,18.66V8C5,4.69 6.69,2 10,2M8,8V9.5H16V8H8M9,12V13.5H15V12H9M3,22V21.31C5.66,19.62 13.23,15.84 21,21.25V22H3Z" />`;
            break;
          case "chief House":
            path = `<path fill="black" d="M10,2V4.26L12,5.59V4H22V19H17V21H24V2H10M7.5,5L0,10V21H15V10L7.5,5M14,6V6.93L15.61,8H16V6H14M18,6V8H20V6H18M7.5,7.5L13,11V19H10V13H5V19H2V11L7.5,7.5M18,10V12H20V10H18M18,14V16H20V14H18Z" />`;
            break;
          case "homestay":
            path = `<path fill="black" d="M12,3L2,12H5V20H19V12H22L12,3M12,7.7C14.1,7.7 15.8,9.4 15.8,11.5C15.8,14.5 12,18 12,18C12,18 8.2,14.5 8.2,11.5C8.2,9.4 9.9,7.7 12,7.7M12,10A1.5,1.5 0 0,0 10.5,11.5A1.5,1.5 0 0,0 12,13A1.5,1.5 0 0,0 13.5,11.5A1.5,1.5 0 0,0 12,10Z" />`;
            break;
          case "communal":
            path = `<path fill="black" d="M12 5C6.5 5 2 9.5 2 15V21H22V15C22 9.5 17.5 5 12 5M12 7C14.53 7 16.78 8.17 18.25 10H5.76C7.22 8.17 9.47 7 12 7M8 19H4V15C4 13.94 4.21 12.93 4.58 12H8V19M14 19H10V12H14V19M20 19H16V12H19.42C19.79 12.93 20 13.94 20 15V19Z" />`;
            break;
          case "well":
            path = `<path fill="${colors}" d="M3.62 8H5V15H7V8H11V10H13V8H17V15H19V8H20.61C21.16 8 21.61 7.56 21.61 7C21.61 6.89 21.6 6.78 21.56 6.68L19 2H5L2.72 6.55C2.47 7.04 2.67 7.64 3.16 7.89C3.31 7.96 3.46 8 3.62 8M6.24 4H17.76L18.76 6H5.24L6.24 4M2 16V18H4V22H20V18H22V16H2M18 20H6V18H18V20M13.93 11C14.21 11 14.43 11.22 14.43 11.5C14.43 11.5 14.43 11.54 14.43 11.56L14.05 14.56C14 14.81 13.81 15 13.56 15H10.44C10.19 15 10 14.81 9.95 14.56L9.57 11.56C9.54 11.29 9.73 11.04 10 11C10.03 11 10.05 11 10.07 11H13.93Z" />`;
            break;
          case "worship":
            path = `<path fill="black" d="M15.59,9C17.7,7.74 19,5.46 19,3H17A5,5 0 0,1 12,8A5,5 0 0,1 7,3H5C5,5.46 6.3,7.74 8.41,9C5.09,11 4,15.28 6,18.6C7.97,21.92 12.27,23 15.59,21C18.91,19.04 20,14.74 18,11.42C17.42,10.43 16.58,9.59 15.59,9M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20Z" />`;
            break;
        }
        return L.divIcon({
          className: `${category}-icon`,
          html: `<svg style="width:${size}px;height:${size}px" viewBox="${view}">${path}</svg>`,
        });
      }

      function stylePolygon(element) {
        let colorPolygon;
        switch (element) {
          case "rice":
            colorPolygon = "#15e60e";
            break;
          case "cashew":
            colorPolygon = "#fcba03";
            break;
          case "route":
            colorPolygon = "red";
            break;
        }
        return { color: colorPolygon };
      }

      this.layerGeoJson = L.geoJSON(layerType, {
        // on peut enchainer les options ici
        onEachFeature: onEachFeature,
        pointToLayer: (feature, latlng) => {
          // CREATE THE MARKERS
          return L.marker(latlng, {
            icon: createIcon(
              feature.properties.category,
              feature.properties.subCategory,
              "16"
            ),
          });
        },
        style: (feature) => {
          // DEFINE SYTLE OF POLYGONS AND LINE
          return stylePolygon(feature.properties.category);
        },
      });

      // GROUPE DE LAYER DANS LEQUEL J'ENREGISTRE LE JSON
      groupType.addLayer(this.layerGeoJson);
    },
    showMeasure() {
      // show measure on click
      // HIDE MEASURE ON SECOND CLICK + BUTTON DYNAMIC
      // DEBUG ON PRINT = NOT SHOWING MEASURE

      if (this.btnMeasure === true) {
        this.map.eachLayer((layer) => {
          if (layer instanceof L.Polygon || (layer instanceof L.Path && layer.feature)) {
            // layer feature not undefined ex: L.circleMarker is a layer = show an error. but layer L.circleMarker doesn't have a feature
            layer.showMeasurements();
          }
        });
      } else {
        this.map.eachLayer((layer) => {
          if (layer instanceof L.Polygon || (layer instanceof L.Path && layer.feature)) {
            layer.hideMeasurements();
          }
        });
      }
      this.btnMeasure = !this.btnMeasure;
    },
    async deleteItem() {
      const removeLastData = async (group, layer, message) => {
        await group.removeLayer(this.layerGeoJson);
        await layer.pop();
        this.createGeoJsonLayer(layer, group);
        this.messageModal = message;
        this.helpModal();
        this.lastItem = undefined;
      };
      switch (this.lastItem) {
        case "house":
          removeLastData(this.houseLayer, this.geoJsonHouse, "Last house data removed");
          break;
        case "village":
          removeLastData(
            this.villageLayer,
            this.geoJsonVillage,
            "Last village data removed"
          );
          break;
        default:
          this.messageModal = "Nothings to remove";
          this.helpModal();
          break;
      }
    },
    removeGeoJson() {
      localStorage.removeItem("APIGeoMap");
      this.messageModal = "data remove from local storage";
      this.helpModal();
    },
    saveGeoJson() {
      let data = [this.geoJsonHouse, this.geoJsonVillage];
      localStorage.setItem("APIGeoMap", JSON.stringify(data));
      this.messageModal = "data save in local storage";
      this.helpModal();
    },
    coordinatesOnLocation(element) {
      if (this.watchMe) {
        navigator.geolocation.clearWatch(this.watchMe);
        this.watchMe = undefined;
        this.showInputGeoDetail = true;
        this.showModal = true;
        this.modalTitle = "Add a symbol"
      } else {
        // track my location, update the coordinates
        let success = (position) => {
          this.accuracyLocation = position.coords.accuracy;
          if (element) {
            this.coordinates = [[position.coords.longitude, position.coords.latitude]];
          } else {
            this.coordinates.push([position.coords.longitude, position.coords.latitude]);
          }
          let updatePositionMarker = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.myLocationMark
            .setLatLng(updatePositionMarker)
            .setRadius(position.coords.accuracy);

          this.map.flyTo(updatePositionMarker);
        };

        let error = () => {
          this.messageModal = "Unable to retrieve your location";
          this.helpModal();
        };

        if (navigator.geolocation) {
          /* this.message = 'Locating...' */
          this.watchMe = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            maximumAge: 0,
          });
        } else {
          this.messageModal = "Geolocation is not supported by your browser";
          this.helpModal();
        }
      }
    },
  },
  mounted() {
    // config mapbox
    const tokenMapbox =
      "pk.eyJ1IjoiZ2d3ZWJkZXYiLCJhIjoiY2t4OGVhemd5MXpyMzJvbzE4ZXpxajJzZCJ9.P2KXn7NQDyQ11BkYVkPEcQ";
    const mapBoxUrl = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${tokenMapbox}`;
    const mapboxStreets = "mapbox/streets-v11";
    const mapboxOutdoors = "mapbox/outdoors-v11";
    const mapboxSatellite = "mapbox/satellite-v9";
    const mapboxAttribution =
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

    // pour switcher sur different layers
    var outdoors = L.tileLayer(mapBoxUrl, {
        id: mapboxOutdoors,
        tileSize: 512,
        zoomOffset: -1,
        attribution: mapboxAttribution,
        accessToken: tokenMapbox,
      }),
      streets = L.tileLayer(mapBoxUrl, {
        id: mapboxStreets,
        tileSize: 512,
        zoomOffset: -1,
        attribution: mapboxAttribution,
        accessToken: tokenMapbox,
      }),
      satellite = L.tileLayer(mapBoxUrl, {
        id: mapboxSatellite,
        tileSize: 512,
        zoomOffset: -1,
        attribution: mapboxAttribution,
        accessToken: tokenMapbox,
      });
    // bouton pour le switch
    var baseMaps = {
      Streets: streets,
      /* "Satellite": satellite, */
      Outdoors: outdoors,
    };
    this.villageLayer = L.layerGroup();
    this.houseLayer = L.layerGroup();
    var overlayMaps = {
      village: this.villageLayer,
      house: this.houseLayer,
    };

    this.createGeoJsonLayer(this.geoJsonVillage, this.villageLayer);
    this.createGeoJsonLayer(this.geoJsonHouse, this.houseLayer);

    // build the container with switch layer
    this.map = L.map("map", {
      layers: [streets, outdoors, this.houseLayer, this.villageLayer],
    });
    this.map.locate({ setView: true, maxZoom: 16 });

    // control layer choice
    L.control.layers(baseMaps, overlayMaps).addTo(this.map);
    // ADD scale control
    L.control.scale().addTo(this.map);

    // show my location on load
    this.myLocationMark = L.circleMarker();
    let onLocationFound = (e) => {
      var radius = e.accuracy;
      this.myLocationMark.setLatLng(e.latlng).setRadius(radius).addTo(this.map);
    };
    this.map.on("locationfound", onLocationFound);

    // remove the marker each click
    // add a new marker to new click
    // get the coordinates
    this.clickMapMark = L.marker();
    let addMarker = async (e) => {
      await this.clickMapMark.setLatLng(e.latlng).addTo(this.map);
      this.coordinates.push([e.latlng.lng, e.latlng.lat]);
      this.showInputGeoDetail = true;
      this.showModal = true;
      this.modalTitle = "Add a symbol"
    };
    this.map.on("click", addMarker);

    /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
    let geoFromLocal = JSON.parse(localStorage.getItem("APIGeoMap"));

    if (geoFromLocal) {
      // if there is data from a file, loaded
      try {
        this.geoJsonHouse = geoFromLocal[0];
        this.geoJsonVillage = geoFromLocal[1];
        this.createGeoJsonLayer(this.geoJsonVillage, this.villageLayer);
        this.createGeoJsonLayer(this.geoJsonHouse, this.houseLayer);
      } catch (error) {
        console.log(error);
      }
    }

    // CUSTOMIZE AN ICON MENU ACTIONS ON THE MAP: 2 option of adding custome icons

    let styleControl = {
      margin: "10px",
      padding: "0px",
      cursor: "pointer",
    };

    const styleOnClick = (e) => {
      let element = e.classList.contains("click");
      if (element) {
        e.classList.remove("click");
      } else {
        e.classList.add("click");
      }
    };

    this.layerStorageControl = L.control.custom({
      position: "topleft",
      content:
        '<button type="button" class="btn-map">' +
        '    <svg  id="btn-save" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="green" d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"  /></svg>' +
        "</button>" +
        '<button type="button" class="btn-map ">' +
        '    <svg id="btn-erase" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="red" d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z"/></svg>' +
        "</button>" +
        '<button type="button" class="btn-map ">' +
        '    <svg id="btn-print" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="green" d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" /></svg>' +
        "</button>" +
        '<button type="button" class="btn-map">' +
        '<svg id="btn-tutorial" style="width:27px;height:27px" viewBox="0 0 24 24">  <path fill="green" d="M12 2C11.5 2 11 2.19 10.59 2.59L2.59 10.59C1.8 11.37 1.8 12.63 2.59 13.41L10.59 21.41C11.37 22.2 12.63 22.2 13.41 21.41L21.41 13.41C22.2 12.63 22.2 11.37 21.41 10.59L13.41 2.59C13 2.19 12.5 2 12 2M12 6.95C14.7 7.06 15.87 9.78 14.28 11.81C13.86 12.31 13.19 12.64 12.85 13.07C12.5 13.5 12.5 14 12.5 14.5H11C11 13.65 11 12.94 11.35 12.44C11.68 11.94 12.35 11.64 12.77 11.31C14 10.18 13.68 8.59 12 8.46C11.18 8.46 10.5 9.13 10.5 9.97H9C9 8.3 10.35 6.95 12 6.95M11 15.5H12.5V17H11V15.5Z" /></svg>' +
        "</button>" + 
        '<button type="button" class="btn-map">' +
        '<svg  id="btn-data" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="green" d="M4 12V9C4 11.2 7.6 13 12 13S20 11.2 20 9V12C20 12.5 19.8 12.9 19.5 13.4C18.7 13.1 17.9 13 17 13C14.5 13 12.1 14.1 10.6 15.9C6.8 15.6 4 14 4 12M12 11C16.4 11 20 9.2 20 7S16.4 3 12 3 4 4.8 4 7 7.6 11 12 11M9.1 19.7L8.8 19L9.1 18.3C9.2 18.1 9.3 18 9.3 17.8C6.2 17.2 4 15.8 4 14V17C4 18.8 6.4 20.3 9.7 20.8C9.5 20.5 9.3 20.1 9.1 19.7M17 18C16.4 18 16 18.4 16 19S16.4 20 17 20 18 19.6 18 19 17.6 18 17 18M23 19C22.1 21.3 19.7 23 17 23S11.9 21.3 11 19C11.9 16.7 14.3 15 17 15S22.1 16.7 23 19M19.5 19C19.5 17.6 18.4 16.5 17 16.5S14.5 17.6 14.5 19 15.6 21.5 17 21.5 19.5 20.4 19.5 19Z" /></svg>' +
        "</button>" +
        '<button type="button" class="btn-map">' +
        '<svg  id="btn-export" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="green" d="M2 12H4V17H20V12H22V17C22 18.11 21.11 19 20 19H4C2.9 19 2 18.11 2 17V12M12 15L17.55 9.54L16.13 8.13L13 11.25V2H11V11.25L7.88 8.13L6.46 9.55L12 15Z" /></svg>' +
        "</button>",
      classes: "btn-group-icon-map-option1",
      style: styleControl,
      events: {
        click: (data) => {
          if (data.target.querySelector("#btn-save")) {
            this.saveGeoJson();
          } else if (data.target.querySelector("#btn-erase")) {
            this.removeGeoJson();
          } else if (data.target.querySelector("#btn-print")) {
            window.print();
          } else if (data.target.querySelector("#btn-tutorial")) {
            this.helpModal();
          } else if (data.target.querySelector("#btn-export")) {
            this.modalExport = true;
            this.showModal = !this.showModal;
            this.modalTitle = "Convert datas to Excel"
          } else if (data.target.querySelector("#btn-data")) {
            let data = [this.geoJsonHouse, this.geoJsonVillage];
            localStorage.setItem("APIGeoMap", JSON.stringify(data));
            this.$router.push('myData')
          }       
        },
      },
    });

    this.layerActionControl = L.control.custom({
      position: "topright",
      content:
        '<button type="button" class="btn-map">' +
        '<svg id="btn-add" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="blue" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>' +
        "</button>" +
        '<button type="button" class="btn-map">' +
        '<svg id="btn-location" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="blue" d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z" /></svg>' +
        "</button>" +
        '<button type="button" class="btn-map">' +
        '<svg id="btn-delete" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="red" d="M22,3H7C6.31,3 5.77,3.35 5.41,3.88L0,12L5.41,20.11C5.77,20.64 6.31,21 7,21H22A2,2 0 0,0 24,19V5A2,2 0 0,0 22,3M19,15.59L17.59,17L14,13.41L10.41,17L9,15.59L12.59,12L9,8.41L10.41,7L14,10.59L17.59,7L19,8.41L15.41,12" /></svg>' +
        "</button>" +
        '<button type="button" class="btn-map">' +
        '<svg id="btn-fullscreen" style="width:27px;height:27px" viewBox="0 0 24 24">  <path fill="orange" d="M17 4H20C21.1 4 22 4.9 22 6V8H20V6H17V4M4 8V6H7V4H4C2.9 4 2 4.9 2 6V8H4M20 16V18H17V20H20C21.1 20 22 19.1 22 18V16H20M7 18H4V16H2V18C2 19.1 2.9 20 4 20H7V18M18 8H6V16H18V8Z" /></svg>' +
        "</button>" +
        '<button type="button" class="btn-map">' +
        '<svg  id="btn-legend" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="orange" d="M9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21L3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19.03 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3L20.34,3.03L15,5.1L9,3M8,5.45V17.15L5,18.31V6.46L8,5.45M10,5.47L14,6.87V18.53L10,17.13V5.47M19,5.7V17.54L16,18.55V6.86L19,5.7M7.46,6.3L5.57,6.97V9.12L7.46,8.45V6.3M7.46,9.05L5.57,9.72V11.87L7.46,11.2V9.05M7.46,11.8L5.57,12.47V14.62L7.46,13.95V11.8M7.46,14.55L5.57,15.22V17.37L7.46,16.7V14.55Z" /></svg>' +
        "</button>" +
        '<button type="button" class="btn-map">' +
        '<svg id="btn-ruler" style="width:27px;height:27px" viewBox="0 0 24 24"><path fill="orange" d="M1.39,18.36L3.16,16.6L4.58,18L5.64,16.95L4.22,15.54L5.64,14.12L8.11,16.6L9.17,15.54L6.7,13.06L8.11,11.65L9.53,13.06L10.59,12L9.17,10.59L10.59,9.17L13.06,11.65L14.12,10.59L11.65,8.11L13.06,6.7L14.47,8.11L15.54,7.05L14.12,5.64L15.54,4.22L18,6.7L19.07,5.64L16.6,3.16L18.36,1.39L22.61,5.64L5.64,22.61L1.39,18.36Z" /></svg>' +
        "</button>",
      classes: "btn-group-icon-map-option1",
      style: styleControl,
      events: {
        click: (data) => {
          // style css button
          let disableButton = (num, originalColor) => {
            let button = document.getElementsByClassName("btn-map")[num];
            let attribut = button.getAttribute("disabled");
            let path = button.getElementsByTagName("path")[0];
            if (attribut != null) {
              button.removeAttribute("disabled", "");
              path.setAttribute("fill", originalColor);
            } else {
              button.setAttribute("disabled", "");
              path.setAttribute("fill", "grey");
            }
          };
          // function on click
          if (data.target.querySelector("#btn-add")) {
            styleOnClick(data.target);
            disableButton(6, "blue");
            this.coordinatesOnLocation(true); // display differente type of coordinates one array
          } else if (data.target.querySelector("#btn-location")) {
            styleOnClick(data.target);
            this.coordinatesOnLocation(false); // display differente type of coordinates multiple array
            disableButton(5, "blue");
          } else if (data.target.querySelector("#btn-ruler")) {
            styleOnClick(data.target);
            this.showMeasure();
          } else if (data.target.querySelector("#btn-delete")) {
            this.deleteItem();
          } else if (data.target.querySelector("#btn-legend")) {
            this.showLegend = !this.showLegend;
            this.showModal = !this.showModal;
            this.modalTitle = "Map Legend"
          } else if (data.target.querySelector("#btn-fullscreen")) {
              styleOnClick(data.target);
              if(!document.fullscreenElement) {
                document.body.webkitRequestFullScreen()
              } else {
                document.exitFullscreen()
              }
          }
        },
      },
    });

    this.map.addControl(this.layerStorageControl);
    this.map.addControl(this.layerActionControl);

    // ecoute si online ou non automatiquement
    // fonctionnalité permettant d'enregistrer le geojson en mode offline
    // mettre un bouton precisant que l'on souhaite travailler en offline
    // enregistre le geojson dans le localstorage
    // ou retour de la connection, faire apparaitre le bouton pour sauvegarder le json dans le DB
    window.addEventListener("offline", function (e) {
      console.log("offline");
    });
    window.addEventListener("online", function (e) {
      console.log("online");
    });
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap");

.container{
  height: 100%;
  width: 100vw;
  padding: 0px;
}
#map {
  height: 100%;
  width: 100%;
  z-index: 1;
}

// STYLE BTN GROUP OM MAP
.btn-group-icon-map-option1 {
  position: relative;
  display: flex;
  flex-direction: column;
}
.btn-map {
  border: 2px solid grey;
  border-radius: 5px 5px;
  background-color: white;
  position: relative;
  margin-bottom: 2px;
  padding: 4px 2px 0px 2px;
  &::after {
    content: "";
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
  }
}
/* style button on map on click */
.click {
  border: 2px solid rgb(60, 255, 34);
}

// STYLE THE MODAL
/* The Modal (background) */
.modal_help {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 6; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.6); /* Black w/ opacity */
  font-family: "Architects Daughter", cursive;
}

/* Modal Content/Box */
.modal_message {
  margin: 5px auto; /* 15% from the top and centered */
  padding: 20px;
  color: rgb(255, 255, 255);
  text-align: center;
  width: 80%; /* Could be more or less, depending on screen size */
  & > p {
    margin-top: 10px;
  }
}

.modal_tuto {
  position: relative;
  &-actions {
    position: absolute;
    text-align: right;
    top: 20px;
    right: 70px;
    color: rgb(255, 255, 255);
    width: 70%; /* Could be more or less, depending on screen size */
    & > p {
      margin-bottom: 20px;
    }
  }
}

/* The Close Button */
.modal_close {
  margin: 10px 0px 0px 30px;
  text-align: center;
  float: left;
  &-icon {
    color: rgb(255, 255, 255);
    font-size: 42px;
    font-weight: bold;
    &:hover,
    &:focus {
      color: rgb(151, 151, 151);
      text-decoration: none;
      cursor: pointer;
    }
  }
}
</style>
