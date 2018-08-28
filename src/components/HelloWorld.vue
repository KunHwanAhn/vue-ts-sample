<template>
  <div class="main-container">
    <div class="hedaer">
      {{ title }}
    </div>
    <div class="button-group">
      <!-- <button v-stream:click="plusButton"> -->
      <button @click="plusButton">
        Click Me!
      </button>

      <span class="count">
        Click Count: {{ clickCount }}
      </span>

      <span class="count">
        Interval Count: {{ count }}
      </span>
    </div>
    <child-component class="child-container"
                     :passed-data="messageToChild">
    </child-component>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/take';
import { map, startWith, scan } from 'rxjs/operators';

const childComponent = {
  props: ['passedData'],
  template: '<div>{{ passedData }}</div>'
}

// https://github.com/orenhd/vue-typescript--rxjs
// https://www.vuemastery.com/conferences/vueconf-2018/vue-rx-john-lindquist/

export default Vue.extend({
  data() {
    return {
      title: 'HelloWorld.vue',
      messageToChild: 'Hello Vue! from Parent Component',
      clickCount: 0,
      count: 0
    };
  },
  components: {
    'child-component': childComponent
  },
  methods: {
    plusButton(): void {
      this.clickCount++;
    }
  },
  subscriptions() {
    return {
      // clickCount: this.plusButton.pipe(
      //   map(() => true),
      //   startWith(0),
      //   scan((total, change) => total + change)
      // ),
      count: Observable.interval(1000).take(10)
    }
  }
});
</script>

<style lang="scss" scoped>
.main-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.hedaer {
  padding: 10px;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-group {
  margin-top: 10px;
  padding: 10px;
  display: flex;
}

.count {
  margin-left: 10px;
  padding: 5px;
}

.child-container {
  margin-top: 10px;
  padding: 10px;
  font-size: 20px;
  border: 2px blueviolet solid;
  display: flex;
  align-items: center;
  justify-content: center
}
</style>
