<template>
  <div id="app">
    <img class="logo" src="@/assets/roshar_logo.png" alt="Logo">
    <Map
      :active-event="mapTransitions ? activeEvent : null"
      @ready="onReady"
    />
    <Scrubber
      :ready="ready"
      :events="events"
      :active-event="activeEvent"
      @loaded="onScrubberLoaded"
      @event-selected="activeEvent = $event"
    />
    <div v-if="!ready" class="loader">
      Loading...
    </div>
  </div>
</template>

<script>
import Map from '@/components/Map.vue'
import Scrubber from '@/components/Scrubber.vue'

export default {
  name: 'App',
  components: {
    Scrubber,
    Map
  },
  data () {
    const events = [
      {
        id: 0,
        year: 1110,
        name: 'The Shattering',
        timelines: ['general'],
        shadesmar: false,
        specialEffect: 'shattering',
        coordinates: {
          x: 512,
          y: 256,
          zoom: 0
        }
      },
      {
        id: 1,
        year: 1120,
        name: 'Dalinar is born',
        timelines: ['dalinar'],
        shadesmar: false,
        coordinates: {
          x: 769,
          y: 249
        }
      },
      {
        id: 2,
        year: 1153,
        name: 'Kaladin is born',
        image: 'kaladin.jpg',
        timelines: ['kaladin'],
        shadesmar: false,
        coordinates: {
          x: 765,
          y: 188
        }
      },
      {
        id: 3,
        year: 1156,
        name: 'Shallan is born',
        timelines: ['shallan'],
        shadesmar: false,
        coordinates: {
          x: 642,
          y: 255
        }
      },
      {
        id: 4,
        year: 1163,
        name: 'Return to the Rift. Evi dies.',
        timelines: ['dalinar'],
        shadesmar: false,
        coordinates: {
          x: 756,
          y: 311
        }
      },
      {
        id: 5,
        year: 1174,
        name: 'The gang is in Shadesmar',
        timelines: ['kaladin', 'shallan'],
        shadesmar: true,
        coordinates: {
          x: 769,
          y: 249
        }
      }
    ]

    return {
      ready: false,
      mapTransitions: false,
      events,
      activeEvent: null
    }
  },
  methods: {
    onReady () {
      this.ready = true
      this.activeEvent = this.events[2]
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

.loader {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;
  background: black;
  color: white;
  text-align: center;
  z-index: 30;
}
</style>
