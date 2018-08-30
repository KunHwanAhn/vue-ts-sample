<template>
  <div id="app" class="main-view">
    <div class="nav-container">
      <router-link class="nav-item" to="/myCroppa">
        Croppa
      </router-link>
      <router-link class="nav-item" to="/helloWrold">
        Hello World
      </router-link>
      <router-link class="nav-item" to="/typeComponent">
        Type Component
      </router-link>
    </div>

    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import VueRouter from 'vue-router';
import HelloWrold from './components/HelloWorld.vue';
import MyCroppa from './components/MyCroppa.vue';
import TypeComponent from './components/TypeComponent.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: 'myCroppa'
  },
  {
    path: '/helloWrold',
    component: HelloWrold
  },
  {
    path: '/myCroppa',
    component: MyCroppa
  },
  {
    path: '/typeComponent',
    component: TypeComponent
  }
];

const router = new VueRouter({ routes });

export default Vue.extend({
  name: 'app',
  router
})
</script>

<style lang="scss" scoped>
.main-view {
  max-width: 1280px;
  min-height: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.nav-container {
  background-color: powderblue;
  padding: 20px;
  display: flex;

  .nav-item {
    margin: 0 20px;
  }
}
</style>
