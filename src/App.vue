<template>
  <div id="app">
    <img class="logo" src="@/assets/roshar_logo.png" alt="Logo">
    <Map
      :active-event="mapTransitions ? activeEvent : null"
      @ready="onReady"
    />
    <Scrubber
      :ready="ready"
      :active-event="activeEvent"
      @loaded="onScrubberLoaded"
      @event-selected="activeEvent = $event"
    />
    <Settings />
    <div v-if="!ready" class="loader">
      Loading...
    </div>
  </div>
</template>

<script>
import Map from '@/components/Map.vue'
import Scrubber from '@/components/Scrubber.vue'
import Settings from '@/components/Settings.vue'

export default {
  name: 'App',
  components: {
    Settings,
    Scrubber,
    Map
  },
  data () {
    return {
      ready: false,
      mapTransitions: false,
      activeEvent: null
    }
  },
  methods: {
    onReady () {
      this.ready = true
      this.activeEvent = this.$store.state.events.find(event => event.tags.includes('kaladin'))
    },
    onScrubberLoaded () {
      setTimeout(() => {
        this.mapTransitions = true
      }, 200)
    }
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
  font-size: 16px;
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
  color: #242629;
}

button {
  font-family: 'Lora', serif;
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

.loader {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;
  background: black;
  color: white;
  text-align: center;
  z-index: 100;
}
</style>
