import colors from 'vuetify/es5/util/colors'

export default {
  ssr: false,

  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: 'GG DevWeb Map',
    title: 'GG DevWeb Map',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
      },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.PNG' },
      {
        rel: 'stylesheet',
        href: 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
        integrity:
          'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==',
        crossorigin: '',
      },
      { rel: 'stylesheet', href: 'measure/leaflet-measure-path.css' },
    ],
    script: [
      {
        src: 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
        integrity:
          'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==',
        crossorigin: '',
      },
      { src: 'measure/leaflet-measure-path.js' }, //https://github.com/ProminentEdge/leaflet-measure-path
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/gsap.min.js' },
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/Observer.min.js',
      },
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/MotionPathPlugin.min.js',
      },
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/TextPlugin.min.js',
      },
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/Flip.min.js' },
    ],
  },

  css: ['@/assets/home.scss', '@/assets/modal.scss'],

  plugins: ['~/plugins/togeojson'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: [
    '@/components',
    { path: '@/components/leaflet', extensions: ['vue'] },
    { path: '@/components/external', extensions: ['vue'] },
    { path: '@/components/menu', extensions: ['vue'] },
    { path: '@/components/svg', extensions: ['vue'] },
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    /* '@nuxtjs/eslint-module', */
    '@nuxtjs/vuetify',
    /* '@nuxt/content', */
    '@nuxtjs/dotenv',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    [
      '@nuxtjs/firebase',
      {
        config: {
          apiKey: 'AIzaSyCAdzvIYwTXrf139FyQScXbBKrR5t4fkcY',
          authDomain: 'my-database-project-1f237.firebaseapp.com',
          projectId: 'my-database-project-1f237',
          storageBucket: 'my-database-project-1f237.appspot.com',
          messagingSenderId: '86336628395',
          databaseURL:
            'https://my-database-project-1f237-default-rtdb.europe-west1.firebasedatabase.app/',
          appId: '1:86336628395:web:eea9b92f1eea075dcbb9ee',
          measurementId: 'G-V64M0QQZZ6',
        },
        services: {
          auth: true,
          firestore: true,
          database: true,
          analytics: true,
        },
        analytics: {
          collectionEnabled: true, // default
        },
        auth: {
          persistence: 'local', // keep auth on reload & close browser
          /* initialize: {
            onAuthStateChangedMutation: 'ON_AUTH_STATE_CHANGED_MUTATION',
            onAuthStateChangedAction: 'onAuthStateChangedAction',
            subscribeManually: false
          }, */
        },
      },
    ],
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],
  sitemap: {
    hostname: 'http://map-tool-village.netlify.app/',
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true, // add to change the variable
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: '#1e97f3',
          accent: colors.grey.darken3,
          secondary: '#d6d306',
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          third: '#f7a24d',
        },
      },
    },
  },

  build: {},

  pwa: {
    meta: {
      title: 'Cartography Map',
      author: 'gg web dev',
    },
    manifest: {
      name: 'Cartography App',
      lang: 'en',
      description: 'Cartography web app',
    },
    icon: {
      fileName: 'android-chrome-192x192.png',
      sizes: [64, 120, 144, 152, 192, 384, 512],
    },
  },
}
