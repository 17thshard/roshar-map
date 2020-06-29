<template>
  <div id="app">
    <Map />
  </div>
</template>

<script>
import Map from '@/components/Map.vue'

export default {
  name: 'App',
  components: {
    Map
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
