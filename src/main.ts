import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import VueRx from 'vue-rx';

Vue.use(VueRouter);
Vue.use(VueRx);

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
});
