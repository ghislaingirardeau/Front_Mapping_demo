<template>
  <v-col cols="12">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          dark
          v-bind="attrs"
          v-on="on"
        >
          Export to Excel
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">Convert datas to Excel</span>
        </v-card-title>
        <v-card-text v-if="errorMessage">
            {{errorMessage}}
        </v-card-text>
        <v-form
        v-else
        ref="form"
        v-model="valid"
        lazy-validation
        >
            <v-col cols="10">
                <v-text-field
                    v-model="fileName"
                    :counter="20"
                    :rules="fileNameRules"
                    label="File name"
                    required
                ></v-text-field>
            </v-col>
        </v-form>

        <v-card-actions>
          <v-spacer></v-spacer>
            <v-btn
                color="blue darken-1"
                text
                @click="close"
            >
                Close
            </v-btn>
            <v-btn
                :disabled="!valid"
                color="success"
                class="mr-4"
                @click="convertMyJson"
                v-if="!errorMessage"
            >
                Save
            </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>    
  </v-col>
</template>

<script>


export default {
    data: () => ({
        valid: true,
        dialog: false,
        errorMessage: undefined,
        fileName: '',
        fileNameRules: [
            v => !!v || 'A file name is required',
            v => (v && v.length <= 20) || 'Name must be less than 20 characters',
        ],
    }),
    methods: {
        close() {
            this.dialog = false
            this.errorMessage = undefined
        },
        convertMyJson() {
            function convertToCSV(objArray) {
                var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
                var str = '';

                for (var i = 0; i < array.length; i++) {
                    var line = '';
                    for (var index in array[i]) {
                        if (line != '') line += ','

                        line += array[i][index];
                    }

                    str += line + '\r\n';
                }

                return str;
            }

            function exportCSVFile(headers, items, fileTitle) {
                if (headers) {
                    items.unshift(headers);
                }

                // Convert Object to JSON
                var jsonObject = JSON.stringify(items);

                var csv = convertToCSV(jsonObject);

                var exportedFilename = fileTitle + '.csv' || 'export.csv';

                var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, exportedFilename);
                } else {
                    var link = document.createElement("a");
                    if (link.download !== undefined) { // feature detection
                        // Browsers that support HTML5 download attribute
                        var url = URL.createObjectURL(blob)
                        link.setAttribute("href", url)
                        link.setAttribute("download", exportedFilename)
                        link.style.visibility = 'hidden'
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                    }
                }
            }

            let download = (jsonToConvert) => {
                var headers = {
                    category: "category",
                    subCategory: "subCategory",
                    type: "type",
                    name: 'name',
                    comment: "popupContent",
                    coordinates: "coordinates"
                }

                var itemsNotFormatted = jsonToConvert

                var itemsFormatted = []

                // format the data
                
                itemsNotFormatted.forEach((item) => {
                    let coordinates
                    if(item.geometry.coordinates.length === 2) {
                        coordinates = item.geometry.coordinates.join(' ')
                    } else {
                        let arrayPolygon = item.geometry.coordinates
                        let coordinatesToString = arrayPolygon[0].join('/')
                        coordinates = coordinatesToString.replace(/,/g, ' ')
                    }
                    itemsFormatted.push({
                        category: item.properties.category,
                        subCategory: item.properties.subCategory,
                        type: item.geometry.type,
                        name: item.properties.name, 
                        comment: item.properties.popupContent,
                        coordinates: coordinates
                    })
                })

                var fileTitle = this.fileName

                exportCSVFile(headers, itemsFormatted, fileTitle)
            }
            if(this.$refs.form.validate()) {
                try {
                    let geoFromLocal = JSON.parse(localStorage.getItem('APIGeoMap'))
                    let allDatas = [...geoFromLocal[0], ...geoFromLocal[1]]
                    download(allDatas)
                    this.dialog = false
                } catch (error) {
                    this.errorMessage = "Failed to save the file, save first your data on map !"
                }
            }
        }
    },
}
</script>