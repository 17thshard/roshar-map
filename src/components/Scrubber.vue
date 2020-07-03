<template>
  <div class="scrubber">
    <Timeline
      v-for="(timelineEvents, timeline) in timelines"
      :key="timeline"
      :events="timelineEvents"
      :active-event="activeEvent"
      :class="`timeline--${timeline}`"
      @event-selected="$emit('event-selected', $event)"
    />
  </div>
</template>

<script>
import Timeline from '@/components/Timeline.vue'

export default {
  name: 'Scrubber',
  components: { Timeline },
  props: {
    activeEvent: {
      type: Object,
      required: false,
      default: () => null
    }
  },
  data () {
    return {
      events: [
        {
          id: 0,
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
          id: 1,
          year: 1153,
          name: 'Kaladin is born',
          timelines: ['kaladin'],
          shadesmar: false,
          coordinates: {
            x: 765,
            y: 188
          }
        },
        {
          id: 2,
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
          id: 3,
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
          id: 4,
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
    }
  },
  computed: {
    timelines () {
      const result = {
        general: [],
        dalinar: [],
        kaladin: [],
        shallan: []
      }

      this.events.forEach((event) => {
        // eslint-disable-next-line no-param-reassign
        event.offset = event.year - this.events[0].year
        event.timelines.forEach(t => result[t].push(event))
      })

      return result
    }
  }
}
</script>

<style lang="scss">
.scrubber {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  background: #F5ECDA url(../assets/paper.png);
  box-sizing: border-box;
  padding: 1rem 10rem;
}
</style>
