/* import vue from "vue"
import GarminConnect from "garmin-connect"
vue.use(GarminConnect) */
// '@/plugins/garmin-connect', transpile: ['garmin-connect']

const { GarminConnect } = require('garmin-connect');
const GCClient = new GarminConnect();

export default ({ app }, inject) => {
    // Inject $hello(msg) in Vue, context and store.
    inject('GCClient', GCClient)
}