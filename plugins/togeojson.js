const convertToGeoJson = require('togeojson')

export default ({ app }, inject) => {
    inject('convertToGeoJson', convertToGeoJson)
}