<template>
  <div
    :class="[
      'scrubber',
      {
        'scrubber--left-overflow': leftOverflowVisible,
        'scrubber--right-overflow': rightOverflowVisible,
        'scrubber--ready': ready
      }
    ]"
  >
    <div
      ref="container"
      v-dragscroll
      class="scrubber__container"
      @mousewheel="scrollHorizontally"
      @DOMMouseScroll="scrollHorizontally"
      @scroll="updateOverflow"
    >
      <div
        :style="{ width: `${timelineWidth}px` }"
        class="scrubber__content"
      >
        <Timeline
          v-for="(timelineEvents, timeline) in timelines"
          :key="timeline"
          :events="timelineEvents"
          :active-event="activeEvent"
          :class="`timeline--${timeline}`"
          @event-selected="$emit('event-selected', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Timeline from '@/components/Timeline.vue'

export default {
  name: 'Scrubber',
  components: { Timeline },
  props: {
    ready: {
      type: Boolean
    },
    events: {
      type: Array,
      required: true
    },
    activeEvent: {
      type: Object,
      required: false,
      default: () => null
    }
  },
  data () {
    return {
      timelineWidth: 0,
      leftOverflowVisible: false,
      rightOverflowVisible: false
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
    },
    timespan () {
      return Math.max(...this.events.map(e => e.year)) - this.events[0].year
    }
  },
  watch: {
    activeEvent: {
      handler (event, oldEvent) {
        if (event === null) {
          return
        }

        if (oldEvent && event.id === oldEvent.id) {
          return
        }

        this.$nextTick(() => {
          this.$refs.container.scrollTo({
            left: event.offset * (14 + 20) + 50 - this.$el.clientWidth / 2,
            behavior: 'smooth'
          })
        })
      },
      immediate: true
    }
  },
  mounted () {
    window.addEventListener('resize', this.onResize)
    window.addEventListener('resize', this.updateOverflow)
    this.onResize()
  },
  destroyed () {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('resize', this.updateOverflow)
  },
  methods: {
    onResize () {
      this.timelineWidth = this.timespan * (14 + 20) + this.$el.clientWidth / 2 + 50
    },
    scrollHorizontally (event) {
      const e = window.event || event
      const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
      this.$refs.container.scrollLeft += delta * 40
      e.preventDefault()
    },
    updateOverflow () {
      const { container } = this.$refs
      this.leftOverflowVisible = container.scrollLeft > 0
      this.rightOverflowVisible = container.scrollLeft + container.clientWidth < container.scrollWidth
    }
  }
}
</script>

<style lang="scss">
.scrubber {
  box-sizing: border-box;
  position: relative;
  max-height: 0;
  transition: max-height 1s ease-out;
  transition-delay: 0.5s;

  &--ready {
    max-height: 130px;
  }

  &:before, &:after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 16px;
    z-index: 1;
    pointer-events: none;
    transition: opacity 0.2s ease-in-out;
    opacity: 0;
  }

  &:before {
    left: 0;
    background: linear-gradient(90deg, rgba(#63430F, 0.4) 0, rgba(#63430F, 0) 100%);
  }

  &:after {
    right: 0;
    background: linear-gradient(-90deg, rgba(#63430F, 0.4) 0, rgba(#63430F, 0) 100%);
  }

  &--left-overflow:before {
    opacity: 1;
  }

  &--right-overflow:after {
    opacity: 1;
  }

  &__container {
    overflow: hidden;
    max-width: 100%;
    cursor: ew-resize;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    position: relative;
    background: #F5ECDA url(../assets/paper.png);
    padding: 1rem 0;
  }
}
</style>
