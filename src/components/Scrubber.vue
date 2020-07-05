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
          {{ currentDate }}
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
              :style="{ left: `${offset + timelineOffset}px` }"
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
import { lerp } from '@/utils'

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
      currentDate: '1174'
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
        event.timelines.forEach(t => result[t].push(event))
      })

      return result
    },
    years () {
      let lastYear = null
      let lastOffset = 0
      const years = []

      this.events.forEach((event) => {
        const year = event.date[0]

        if (lastYear !== null && year !== lastYear) {
          const diff = year - lastYear

          let filler = 1

          if (diff >= 1000) {
            filler = 5
          } else if (diff >= 200) {
            filler = 3
          } else if (diff >= 100) {
            filler = 2
          }

          const yearsBetween = [...Array(filler).keys()]
            .map(i => Math.trunc(lastYear + (i + 1) * diff / (filler + 1)))

          years.push(
            ...[...new Set(yearsBetween)]
              .map(y => ({
                year: y,
                offset: lerp(lastOffset, event.offset, (y - lastYear) / diff)
              }))
          )
        }

        if (year !== lastYear) {
          years.push({ year, offset: event.offset })
        }

        lastYear = event.date[0]
        lastOffset = event.offset
      })

      return years
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
            left: event.offset,
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
      this.timelineWidth = Math.max(...this.events.map(e => e.offset)) + this.$el.clientWidth
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

      const scroll = this.$refs.container.scrollLeft
      const endIndex = this.events.findIndex(event => event.offset >= scroll)

      if (endIndex === 0) {
        this.currentDate = this.events[0].date[0].toString()

        if (this.events[0].date[0] === this.events[1].date[0]) {
          this.currentDate += this.events[0].date[1]
        }
      } else {
        const start = this.events[endIndex - 1]
        const end = this.events[endIndex]
        const nextEnd = this.events[endIndex + 1]

        let dateBit = 0

        if (start.date[0] === end.date[0]) {
          dateBit = 1
          this.currentDate = `${start.date[0]}.`
        } else {
          this.currentDate = ''
        }

        if (scroll <= start.offset + 0.5) {
          this.currentDate += start.date[dateBit].toString()
        } else if (scroll >= end.offset - 0.5) {
          this.currentDate += end.date[dateBit].toString()

          if (nextEnd !== undefined && nextEnd.date[0] === end.date[0]) {
            this.currentDate = `${end.date[0]}.${end.date[1]}`
          }
        } else {
          const t = (scroll - start.offset) / (end.offset - start.offset)
          this.currentDate += Math.trunc(lerp(start.date[dateBit], end.date[dateBit], t)).toString()
        }
      }
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
