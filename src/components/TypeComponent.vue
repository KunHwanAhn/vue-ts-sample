<template>
  <div>
    {{ this.greeting }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      msg: 'Hello'
    };
  },
  methods: {
    greet(): string {
      return this.msg + ' world';
    }
  },
  computed: {
    greeting(): string {
      return this.greet() + '!';
    }
  }
});
</script>


<style lang="scss" scoped>

</style>
