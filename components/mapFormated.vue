<template>
  <div>
    <v-btn @click="showMeasure">{{btnMeasure ? 'show' : 'hide'}}</v-btn>
    <div id="map" class="mt-5" :style="{height: resize + 'px' }"></div>  
  </div>
</template>

<script>

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
        icon: {
          type: element.icon,
          color: element.color
        }
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
    resize: '300',
    btnMeasure: true,
    housesLayer: [],
    villageLayer: [],
  }),
  methods: {
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
      function createIcon(type, color, size) {
        return L.divIcon({
          className: `${type}-icon`,
          html: `<i aria-hidden="true" class="v-icon notranslate mdi mdi-${type} theme--dark" style="font-size: ${size}; color:${color};"></i>`,
        });
      }

      this.layerGeoJson = L.geoJSON(layerType, {
        // on peut enchainer les options ici
        onEachFeature: onEachFeature,
        pointToLayer: (feature, latlng) => {
          // CREATE THE MARKERS
          return L.marker(latlng, {
            icon: createIcon(
              feature.icon.type,
              feature.icon.color,
              "small"
            ),
          });
        },
        style: (feature) => {
          // DEFINE SYTLE OF POLYGONS AND LINE
          return { color: feature.icon.color }
        },
      });

      // GROUPE DE LAYER DANS LEQUEL J'ENREGISTRE LE JSON
      groupType.addLayer(this.layerGeoJson);
    },
    showMeasure() {
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
      zoomControl: false
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

    let geoFromLocal = JSON.parse(localStorage.getItem("APIGeoMap"));

    try {
      this.geoJsonHouse = geoFromLocal[0];
      this.geoJsonVillage = geoFromLocal[1];
      this.createGeoJsonLayer(this.geoJsonVillage, this.villageLayer);
      this.createGeoJsonLayer(this.geoJsonHouse, this.houseLayer);
    } catch (error) {
      console.log(error);
    }

  },
};
</script>

<style lang="scss">


</style>
