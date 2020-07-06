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
import { arraysEqual } from '@/utils'

export default {
  name: 'App',
  components: {
    Scrubber,
    Map
  },
  data () {
    const events = [
      {
        date: [-10000],
        name: 'Shattering of Adonalsium',
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
        date: [-8000],
        name: 'Human Exodus from Ashyn',
        timelines: ['general'],
        shadesmar: false,
        coordinates: {
          x: 512,
          y: 256,
          zoom: 0
        }
      },
      {
        date: [-3300],
        name: 'The Last Desolation',
        timelines: ['general'],
        shadesmar: false,
        coordinates: {
          x: 512,
          y: 256,
          zoom: 0
        }
      },
      {
        date: [-800],
        name: 'The False Desolation',
        timelines: ['general'],
        shadesmar: false,
        coordinates: {
          x: 512,
          y: 256,
          zoom: 0
        }
      },
      {
        date: [650],
        name: 'End of the Hierocracy',
        timelines: ['general'],
        shadesmar: false,
        coordinates: {
          x: 512,
          y: 256,
          zoom: 0
        }
      },
      {
        date: [975],
        name: 'Scouring of Amia',
        timelines: ['general'],
        shadesmar: false,
        coordinates: {
          x: 512,
          y: 256,
          zoom: 0
        }
      },
      {
        year: 1120,
        date: [1120],
        name: 'Dalinar is born',
        timelines: ['dalinar'],
        shadesmar: false,
        coordinates: {
          x: 769,
          y: 249
        }
      },
      {
        date: [1153],
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
        date: [1156],
        name: 'Shallan is born',
        timelines: ['shallan'],
        shadesmar: false,
        coordinates: {
          x: 642,
          y: 255
        }
      },
      {
        date: [1163],
        name: 'Return to the Rift. Evi dies.',
        timelines: ['dalinar'],
        shadesmar: false,
        coordinates: {
          x: 756,
          y: 311
        }
      },
      {
        date: [1169, 1],
        name: 'Taravangian visits the Nightwatcher',
        timelines: ['general'],
        shadesmar: false,
        coordinates: {
          x: 756,
          y: 311
        }
      },
      {
        date: [1169, 4],
        name: 'Tien dies',
        timelines: ['kaladin'],
        shadesmar: false,
        coordinates: {
          x: 756,
          y: 311
        }
      },
      {
        date: [1169, 10],
        name: 'Lin Davar accused of murder',
        timelines: ['general'],
        shadesmar: false,
        coordinates: {
          x: 756,
          y: 311
        }
      },
      {
        date: [-3300],
        tieBreaker: 1,
        name: 'Blublub',
        timelines: ['dalinar'],
        shadesmar: false,
        coordinates: {
          x: 512,
          y: 256,
          zoom: 0
        }
      },
      {
        date: [1174],
        name: 'The gang is in Shadesmar',
        timelines: ['kaladin', 'shallan'],
        shadesmar: true,
        coordinates: {
          x: 769,
          y: 249
        }
      }
    ].sort(
      (a, b) => {
        let j = 0

        for (let i = 0; i < a.date.length; i++) {
          if (j === b.date.length - 1 && b.date[j] !== a.date[i]) {
            return a.date[i] - b.date[j]
          }

          if (a.date[i] !== b.date[j]) {
            return a.date[i] - b.date[j]
          }

          j += 1
        }

        if (j !== b.date.length) {
          return -1
        }

        if (a.tieBreaker !== undefined && b.tieBreaker !== undefined) {
          return a.tieBreaker - b.tieBreaker
        } else if (a.tieBreaker !== undefined) {
          return 1
        }

        return -1
      }).map((event, index) => ({ ...event, id: index }))

    let lastEvent = null
    let runningOffset = 0
    events.forEach((event) => {
      if (lastEvent !== null) {
        runningOffset += this.calculateNextOffset(event, lastEvent)
      }

      // eslint-disable-next-line no-param-reassign
      event.offset = runningOffset

      lastEvent = event
    })

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
    },
    calculateNextOffset (event, lastEvent) {
      if (arraysEqual(event.date, lastEvent.date) && event.tieBreaker === lastEvent.tieBreaker) {
        return 0
      }

      if (event.date[0] - lastEvent.date[0] >= 100) {
        return 500
      }

      if (event.date[0] - lastEvent.date[0] >= 5) {
        return 200
      }

      if (event.date[0] - lastEvent.date[0] >= 1) {
        return (event.date[0] - lastEvent.date[0]) * 60
      }

      return 50
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
