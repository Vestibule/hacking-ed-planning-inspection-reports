const env = require('getenv');
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl'
import axios from 'axios'
import './assets/styles/index.css';

Vue.config.productionTip = false

Vue.use({
  install (Vue) {
    Vue.prototype.$api = axios.create({
      baseURL: env('API_URL', 'http://localhost:5000/')
    })
  }
})

Vue.use({
  install(Vue) {
    Vue.prototype.$mapbox = mapboxgl
  }
})

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
