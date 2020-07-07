<template>
  <div id="app">
    <img class="logo" src="@/assets/roshar_logo.png" alt="Logo">
    <Map
      :active-event="mapTransitions ? activeEvent : null"
      :active-location="activeLocation"
      @ready="onReady"
      @location-selected="selectLocation"
    />
    <Scrubber
      :ready="ready"
      :active-event="activeEvent"
      @loaded="onScrubberLoaded"
      @event-selected="selectEvent"
    />
    <Settings />
    <transition name="loading__fade">
      <LoadingIndicator v-if="!ready" />
    </transition>
  </div>
</template>

<script>
import Map from '@/components/Map.vue'
import Scrubber from '@/components/Scrubber.vue'
import Settings from '@/components/Settings.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'

export default {
  name: 'App',
  components: {
    LoadingIndicator,
    Settings,
    Scrubber,
    Map
  },
  data () {
    return {
      ready: false,
      mapTransitions: false,
      activeEvent: null,
      activeLocation: null
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
      }, 1000)
    },
    selectEvent (event) {
      this.activeEvent = event
      this.activeLocation = null
    },
    selectLocation (location) {
      this.activeLocation = location
      this.activeEvent = null
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

.loading__fade {
  &-leave-active {
    transition: opacity 0.5s ease-in;
  }

  &-leave-to {
    opacity: 0;
  }
}
</style>
