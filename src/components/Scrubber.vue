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
    @transitionend="$emit('loaded')"
  >
    <transition name="scrubber__card">
      <EventCard v-if="activeEvent !== null" :key="`event-${activeEvent.id}`" :event="activeEvent" />
    </transition>
    <div class="scrubber__bar">
      <div class="scrubber__indicator">
        <span class="scrubber__indicator-year">
          {{ currentYear }}
        </span>
      </div>
      <div
        ref="container"
        v-dragscroll
        class="scrubber__container"
        @mousewheel="scrollHorizontally"
        @DOMMouseScroll="scrollHorizontally"
        @scroll="onScroll"
      >
        <div
          :style="{ width: `${timelineWidth}px` }"
          class="scrubber__content"
        >
          <Timeline
            v-for="(timelineEvents, timeline) in timelines"
            :key="timeline"
            :offset="timelineOffset"
            :events="timelineEvents"
            :active-event="activeEvent"
            :class="`timeline--${timeline}`"
            @event-selected="$emit('event-selected', $event)"
          />
          <div key="years" class="scrubber__years">
            <span
              v-for="{ year, offset } in years"
              :key="year"
              :style="{ left: `${offset * (14 + 20) + timelineOffset}px` }"
              class="scrubber__year"
            >
              {{ year }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Timeline from '@/components/Timeline.vue'
import EventCard from '@/components/EventCard.vue'

export default {
  name: 'Scrubber',
  components: { EventCard, Timeline },
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
      timelineOffset: 0,
      leftOverflowVisible: false,
      rightOverflowVisible: false,
      currentYear: 0
    }
  },
  computed: {
    timelines () {
      const result = {
        dalinar: [],
        kaladin: [],
        shallan: [],
        general: []
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
    },
    years () {
      const minYear = Math.min(...this.events.map(e => e.year))
      const maxYear = Math.max(...this.events.map(e => e.year))
      return [...Array(maxYear - minYear).keys()]
        .map(y => ({ year: y + minYear, offset: y }))
        .filter(y => y.year % 5 === 0)
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
            left: event.offset * (14 + 20),
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
      this.timelineWidth = this.timespan * (14 + 20) + this.$el.clientWidth
      this.timelineOffset = this.$el.clientWidth / 2
    },
    scrollHorizontally (event) {
      const e = window.event || event
      const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
      this.$refs.container.scrollLeft += delta * 40
      e.preventDefault()
    },
    onScroll () {
      this.updateOverflow()
      const minYear = Math.min(...this.events.map(e => e.year))
      this.currentYear = minYear + Math.floor(this.$refs.container.scrollLeft / (14 + 20))
    },
    updateOverflow () {
      const { container } = this.$refs
      this.leftOverflowVisible = container.scrollLeft > this.timelineOffset
      this.rightOverflowVisible = container.scrollLeft + container.clientWidth < container.scrollWidth - this.timelineOffset
    }
  }
}
</script>

<style lang="scss">
.scrubber {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  position: relative;
  max-height: 0;
  transition: max-height 1s ease-out;
  transition-delay: 0.5s;

  &--ready {
    max-height: 130px;

    .scrubber__indicator {
      opacity: 1;
    }
  }

  &:before, &:after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 16px;
    z-index: 15;
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

  &__card {
    &-enter-active {
      transition: transform 0.5s ease-out;
      transition-delay: 1.2s;
    }

    &-leave-active {
      transition: transform 0.5s ease-in;
    }

    &-enter, &-leave-to {
      transform: translateY(calc(100% + 2rem));
    }
  }

  &__indicator {
    position: absolute;
    left: 50%;
    top: -1rem;
    z-index: 15;
    transform: translateX(-50%);
    bottom: 1.45rem;
    font-size: 0.8rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1s ease-out;
    transition-delay: 0.5s;

    &:before {
      content: '';
      position: absolute;
      width: 2px;
      top: 1.5rem;
      bottom: 0;
      background: #111;
      left: 50%;
      margin-left: -1px;
      z-index: 14;
    }

    &-year {
      display: flex;
      align-items: center;
      background: #111;
      color: #fafafa;
      padding: 4px 8px;
      box-sizing: border-box;
      border-radius: 1rem;
    }
  }

  &__bar {
    max-width: 100%;
    flex: 1;
    z-index: 10;
    transform: translateZ(0);
    position: relative;
  }

  &__container {
    overflow: hidden;
    max-width: 100%;
    cursor: ew-resize;
    position: relative;
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

  &__years {
    position: relative;
    color: rgba(0, 0, 0, 0.7);
    z-index: 16;
  }

  &__year {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.7rem;
  }
}
</style>
