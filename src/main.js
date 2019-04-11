import Vue from 'vue'
import App from './App.vue'

import VueMaterial from 'vue-material';
import router from './common/router';
import VuexSaga from "vuex-saga";

import firebase from 'firebase';
import { fbConfig } from "./common/config";

import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css' // This line here

import store from './store';
export const EventBus = new Vue();

// Make A Vuex Store
Vue.use(VuexSaga, { store: store })
firebase.initializeApp(fbConfig);

Vue.use(VueMaterial);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
