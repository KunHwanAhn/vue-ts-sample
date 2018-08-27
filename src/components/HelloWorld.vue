<template>
  <div class="main-container">
    <div class="hedaer">
      {{ message }}
    </div>
    <div class="button-group">
      <button v-stream:click="plusButton">
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

<script>
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/take';
import { map, startWith, scan } from 'rxjs/operators';

const childComponent = {
  props: ['passedData'],
  template: '<div>{{ passedData }}</div>'
}

export default {
  name: 'test',
  data() {
    return {
      clickCount: 0,
      count: 0,
      message: 'Hello world!!',
      messageToChild: 'Hello Vue! from Parent Component'
    }
  },
  components: {
      'child-component': childComponent
  },
  subscriptions() {
    this.plusButton = new Subject();

    return {
      clickCount: this.plusButton.pipe(
        map(() => true),
        startWith(0),
        scan((total, change) => total + change)
      ),
      count: Observable.interval(1000).take(10)
    }
  }
}
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
