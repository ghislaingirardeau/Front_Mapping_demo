<template>
  <v-row>
    <v-col cols="12">
      <h1>My datas</h1>
    </v-col>
    <v-col cols="12">
      <h2>Import your datas</h2>
      <v-file-input
        label="Selelct CSV file"
        @click="readFileTest"
        id="csv"
      ></v-file-input>
    </v-col>
    <v-col cols="12">
      <p :class="{ active: isActive }">
        You have collected {{ geoJsonFeature ? geoJsonFeature.length : '' }} datas
      </p>
    </v-col>
    <tableGeoJson v-if="geoJsonFeature" :geoJsonFeature="geoJsonFeature" />
    <v-col v-else cols="12">
      <p>No data save yet</p>
    </v-col>

  </v-row>
</template>

<script>
import tableGeoJson from '@/components/leaflet/tableGeoJson.vue'

export default {
  layout: 'datasLayout',
  data() {
    return {
      geoJsonFeature: undefined,
      isActive: false,
    }
  },
  components: {
    tableGeoJson,
  },
  methods: {
    linkMap() {
      this.$router.push('/')
    },
    async readFileTest() {
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
        // GET THE FILE IMPORTED AND APPLY THE FUNCTION
        var fileInput = document.getElementById("csv")
        
            let readFile = () => {
                var reader = new FileReader();
                reader.onload = async () => {
                  // get the csv data here
                  let csv = reader.result
                  // CONVERT CSV TO JSON
                  var lines=csv.split("\n");
                  var result = [];
                  var headers=lines[0].split(",");

                  for(var i=1;i<(lines.length - 1);i++){

                      var obj = {};
                      var currentline=lines[i].split(",");
                      
                      for(var j=0;j<headers.length;j++){
                          obj[headers[j]] = currentline[j];
                      }

                      result.push(obj);

                  }
                  let JsonFromCsv = result
                  let geoJsonVillage = [];
                  let geoJsonHouse = [];
                  let countCategories = []

                  await JsonFromCsv.forEach(element => { // recupere le nombre de category differentes créées
                    if(countCategories.indexOf(element.category) === -1) {
                      countCategories.push(element.category)
                    }
                  });
                  /* let objetData = {} */
                  countCategories.forEach(element => { // pour chaque category, je lui crée un nouveau tableau
                    let name = element
                    element = new Array()
                    JsonFromCsv.forEach((index) => { // j'envoie le geojson dans le tableau correspondant
                      if(index.category === name) {
                        createGeoJsons(index, element);
                      }
                    });
                    
                  });
                  console.log(well);
                  /* JsonFromCsv.forEach((element) => {
                    if (element.category === "house") {
                      createGeoJsons(element, geoJsonHouse);
                    } else {
                      createGeoJsons(element, geoJsonVillage);
                    }
                  });

                  let data = [geoJsonHouse, geoJsonVillage];
                  localStorage.setItem("APIGeoMap", JSON.stringify(data)); */
                };
                reader.readAsBinaryString(fileInput.files[0]);
            };

        fileInput.addEventListener('change', readFile);
    }
  },
  mounted() {
    try {
      /* RECUPERE LES DONNEES SI PRESENT DANS LE LOCALSTORAGE */
      let geoFromLocal = JSON.parse(localStorage.getItem('APIGeoMap'))
      this.geoJsonFeature = [...geoFromLocal[0], ...geoFromLocal[1]]
    } catch (error) {}
  },
}
</script>

<style lang="scss">
</style>
