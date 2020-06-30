<template>
  <div id="app">
    <img class="logo" src="@/assets/roshar-logo.png" alt="Logo">
    <Map />
    <Timeline />
  </div>
</template>

<script>
import Map from '@/components/Map.vue'
import Timeline from '@/components/Timeline.vue'

export default {
  name: 'App',
  components: {
    Timeline,
    Map
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600&display=swap');

body {
  margin: 0;
  padding: 0;
  position: fixed;
  height: 100%;
  width: 100%;
}

#app {
  font-family: 'Lora', serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;
  height: 100%;
  max-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.logo {
  position: absolute;
  top: 2rem;
  left: 1rem;
  width: 302px;
  z-index: 20;

  @media (max-width: 1080px) {
    width: 151px;
  }
}
</style>
