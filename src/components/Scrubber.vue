<template>
  <div
    data-tutorial-id="timeline"
    :class="[
      'scrubber',
      {
        'scrubber--left-overflow': leftOverflowVisible,
        'scrubber--right-overflow': rightOverflowVisible
      }
    ]"
    :style="{ '--max-height': `${contentHeight}px` }"
  >
    <transition name="event-card">
      <EventCard v-if="activeEvent !== null" :key="`event-${activeEvent.id}`" :event="activeEvent" />
    </transition>
    <transition name="scrubber__jump">
      <button
        v-if="leftOverflowVisible"
        class="scrubber__jump scrubber__jump--start"
        :title="$t('ui.jump-to-start')"
      >
        <ChevronsLeftIcon />
      </button>
    </transition>
    <div class="scrubber__bar">
      <div class="scrubber__indicator">
        <div class="scrubber__indicator-actions">
          <button
            class="scrubber__indicator-button scrubber__indicator-button--prev"
            :title="$t('ui.previous-event')"
            @click="gotoEvent(-1)"
          >
            {{ $t('ui.previous') }}
          </button>
          <span class="scrubber__indicator-year">
            {{ currentDate }}
          </span>
          <button class="scrubber__indicator-button scrubber__indicator-button--next" :title="$t('ui.next-event')" @click="gotoEvent(1)">
            {{ $t('ui.next') }}
          </button>
        </div>
      </div>
      <div
        ref="container"
        v-dragscroll
        class="scrubber__container"
        @mousewheel="scrollHorizontally"
        @DOMMouseScroll="scrollHorizontally"
        @scroll="onScroll"
      >
        <transition-group
          ref="timelineContainer"
          tag="div"
          name="scrubber__timeline"
          :style="{ width: `${timelineWidth}px`, height: `${contentHeight}px` }"
          class="scrubber__content"
        >
          <Timeline
            v-for="(timelineEvents, tag) in timelines"
            :key="tag"
            :tag="tag"
            :offset="timelineOffset"
            :events="timelineEvents"
            :active-event="activeEvent"
            class="scrubber__timeline"
            @event-selected="selectEvent"
          />
          <div key="years" class="scrubber__years">
            <template v-for="{ year, offset, months, singleEvent } in years.filter(year => year.display)">
              <span
                :key="year"
                :style="{ left: `${offset + timelineOffset}px` }"
                class="scrubber__year"
              >
                {{ year }}
              </span>
              <span
                v-for="{ month, offset: monthOffset } in months.slice(singleEvent ? 1 : 0).filter(m => m.display && (offset + m.offset) <= maxEventOffset)"
                :key="`${year}.${month}`"
                :style="{ left: `${offset + timelineOffset + monthOffset}px` }"
                :class="['scrubber__month', `scrubber__month--${month}`]"
              >
                {{ $t(`numbers[${month}]`) }}
              </span>
            </template>
          </div>
        </transition-group>
      </div>
    </div>
    <transition name="scrubber__jump">
      <button
        v-if="rightOverflowVisible"
        class="scrubber__jump scrubber__jump--end"
        :title="$t('ui.jump-to-end')"
      >
        <ChevronsRightIcon />
      </button>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { ChevronsLeftIcon, ChevronsRightIcon } from 'vue-feather-icons'
import Timeline from '@/components/Timeline.vue'
import EventCard from '@/components/EventCard.vue'
import { formatDate, lerp } from '@/utils'

export default {
  name: 'Scrubber',
  components: { EventCard, Timeline, ChevronsLeftIcon, ChevronsRightIcon },
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
    ...mapState(['events', 'filter', 'activeEvent', 'years']),
    contentHeight () {
      return Math.max(92, Object.keys(this.timelines).length * 24 + 64)
    },
    timelines () {
      const result = this.filter.separateTags.reduce((acc, t) => {
        acc[t] = []
        return acc
      }, {})

      result.all = []

      this.events.forEach((event) => {
        const separatedAssignments = this.filter.separateTags.filter(t => event.tags.includes(t))

        separatedAssignments.forEach((t) => {
          result[t].push(event)
        })

        if (separatedAssignments.length < event.tags.length || event.tags.length === 0) {
          result.all.push(event)
        }
      })

      return result
    },
    maxEventOffset () {
      return Math.max(...this.events.map(e => e.offset))
    }
  },
  watch: {
    activeEvent (event, oldEvent) {
      if (event === null) {
        return
      }

      if (oldEvent && event.id === oldEvent.id) {
        return
      }

      this.scrollToEvent(event)
    }
  },
  mounted () {
    if (this.activeEvent !== null) {
      setTimeout(() => this.scrollToEvent(this.activeEvent), 1500)
    } else {
      setTimeout(() => this.scrollToEvent(this.$store.state.mappings.events['gavilars-assassination']), 1500)
    }

    this.update()
    this.onScroll()
  },
  destroyed () {
    cancelAnimationFrame(this.lastAnimationRequest)
  },
  methods: {
    update () {
      if (this.lastWidth !== this.$el.clientWidth) {
        this.onResize()
      }

      this.lastWidth = this.$el.clientWidth

      this.lastAnimationRequest = requestAnimationFrame(this.update)
    },
    onResize () {
      this.timelineWidth = this.maxEventOffset + this.$el.clientWidth
      this.timelineOffset = this.$el.clientWidth / 2
      this.updateOverflow()
    },
    scrollHorizontally (event) {
      const e = window.event || event
      const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
      this.$refs.container.scrollLeft -= delta * 40
      e.preventDefault()
    },
    onScroll () {
      this.updateOverflow()

      const scroll = this.$refs.container.scrollLeft
      const event = this.events.find(event => Math.abs(event.offset - scroll) <= 1)
      if (event !== undefined) {
        this.currentDate = formatDate(event.date)

        if (event.circa) {
          this.currentDate = this.$t('ui.circa', { date: this.currentDate })
        }

        return
      }

      let endIndex = this.years.findIndex(year => year.offset >= scroll)
      if (endIndex === -1) {
        endIndex = this.years.length
      }

      const start = this.years[Math.max(endIndex - 1, 0)]
      const startEndOffset = start.offset + start.size

      if (!start.singleEvent && scroll <= startEndOffset) {
        const localScroll = scroll - start.offset

        let endMonthIndex = start.months.findIndex(month => month.offset >= localScroll)
        if (endMonthIndex === -1) {
          endMonthIndex = start.months.length
        }
        const startMonth = start.months[endMonthIndex - 1]
        const endMonth = endMonthIndex < start.months.length
          ? start.months[endMonthIndex]
          : { month: startMonth.month, offset: start.size }

        const displayMonth = lerp(
          startMonth.month,
          endMonth.month,
          (localScroll - startMonth.offset) / (endMonth.offset - startMonth.offset)
        )

        this.currentDate = formatDate([start.year, Math.trunc(displayMonth) + 1])
      } else {
        const end = this.years[endIndex]
        const lerpOffset = start.singleEvent ? start.offset : startEndOffset
        this.currentDate = Math.trunc(lerp(start.year + 1, end.year, (scroll - lerpOffset) / (end.offset - lerpOffset)))
      }
    },
    updateOverflow () {
      const { container } = this.$refs
      this.leftOverflowVisible = container.scrollLeft > this.timelineOffset
      this.rightOverflowVisible = container.scrollLeft + container.clientWidth < container.scrollWidth - this.timelineOffset
    },
    gotoEvent (dir) {
      const scroll = this.$refs.container.scrollLeft

      const gotoAndScroll = (id) => {
        let index = Math.max(0, Math.min(id, this.events.length - 1))
        while (index > 0 && index < this.events.length - 1 && this.$store.getters.isDisabled(this.events[index])) {
          index += dir
        }

        if (this.$store.getters.isDisabled(this.events[index])) {
          return
        }

        this.selectEvent(this.events[index])
      }

      if (this.activeEvent !== null && Math.abs(this.activeEvent.offset - scroll) <= 1) {
        gotoAndScroll(this.activeEvent.index + dir)

        return
      }

      const endIndex = this.events.findIndex(event => event.offset >= scroll)
      const prevIndex = endIndex - 1

      if (prevIndex === -1) {
        gotoAndScroll(dir)
      } else {
        const start = this.events[prevIndex]
        const end = this.events[endIndex]

        if (scroll <= start.offset + 1) {
          gotoAndScroll(start.index)
        } else if (scroll >= end.offset - 1) {
          gotoAndScroll(end.index)
        } else if (dir < 0) {
          gotoAndScroll(start.index)
        } else if (dir > 0) {
          gotoAndScroll(end.index)
        }
      }
    },
    selectEvent (event) {
      this.$store.commit('selectEvent', event)
      this.scrollToEvent(event)
    },
    scrollToEvent (event) {
      this.$nextTick(() => {
        const scrollTarget = event !== undefined ? event : this.activeEvent
        this.$refs.container.scrollTo({
          left: scrollTarget.offset,
          behavior: 'smooth'
        })
      })
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

  &-enter-active {
    transition: max-height 1s ease-out;
    transition-delay: 0.5s;

    .scrubber__indicator {
      transition: opacity 1s ease-out;
      transition-delay: 0.5s;
    }
  }

  &-enter {
    max-height: 0;

    .scrubber__indicator {
      opacity: 0;
    }
  }

  &-enter-to {
    max-height: var(--max-height);

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

  &__jump {
    display: flex;
    align-items: center;
    position: absolute;
    z-index: 16;
    align-self: center;
    width: 2rem;
    height: 2rem;
    border-radius: 100%;
    appearance: none;
    border: none;
    background: #0f3562;
    color: #f6f8fa;
    margin: 0;
    cursor: pointer;
    outline: none;
    box-sizing: border-box;
    white-space: nowrap;
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.5);

    &-enter-active, &-leave-active {
      transition: opacity 0.2s ease-in-out;
    }

    &-enter, &-leave-to {
      opacity: 0;
    }

    &-enter-to, &-leave-from {
      opacity: 1;
    }

    &--start {
      left: 1.5rem;
    }

    &--end {
      right: 1.5rem;
    }
  }

  &__indicator {
    position: absolute;
    top: -1rem;
    left: 0;
    right: 0;
    bottom: 2.45rem;
    z-index: 15;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    font-size: 0.8rem;
    pointer-events: none;

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
      font-family: inherit;
    }

    &-button {
      position: absolute;
      display: flex;
      align-items: center;
      appearance: none;
      border: none;
      background: #111;
      color: rgba(#fafafa, 0.0);
      line-height: 1.5;
      font-size: 1em;
      padding: 4px 0;
      margin: 0;
      font-family: 'Libre Baskerville', serif;
      cursor: pointer;
      outline: none;
      overflow: hidden;
      max-width: 1rem;
      box-sizing: border-box;
      transition: color 0.5s ease-in-out, padding 0.5s ease-in-out, max-width 0.5s ease-in-out;
      white-space: nowrap;

      &:before {
        position: absolute;
        width: 0.5rem;
        height: 0.5rem;
        box-sizing: border-box;
        content: '';
        border-top: 2px solid #fafafa;
        border-left: 2px solid #fafafa;
        transform-origin: 50% 50%;
      }

      &--prev {
        justify-content: flex-start;
        border-top-left-radius: 1rem;
        border-bottom-left-radius: 1rem;
        right: 100%;
        padding-left: 1rem;

        &:before {
          left: 0.5rem;
          transform: rotate(-45deg);
        }

        @media (pointer: coarse) {
          padding-left: 1.5rem;

          &:before {
            left: 0.75rem;
          }
        }
      }

      &--next {
        justify-content: flex-end;
        border-top-right-radius: 1rem;
        border-bottom-right-radius: 1rem;
        left: 100%;
        padding-right: 1rem;

        &:before {
          right: 0.5rem;
          transform: rotate(135deg);
        }

        @media (pointer: coarse) {
          padding-right: 1.5rem;

          &:before {
            right: 0.75rem;
          }
        }
      }
    }

    &-year {
      display: flex;
      align-items: center;
      background: #111;
      color: #fafafa;
      padding: 4px 8px;
      box-sizing: border-box;
      line-height: 1.5;
    }

    &-actions {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: stretch;
      pointer-events: auto;

      @media (any-hover: hover) {
        &:hover .scrubber__indicator-button {
          max-width: 5rem;
          color: rgba(#fafafa, 1.0);

          &--prev {
            padding-left: 1.25rem;
          }

          &--next {
            padding-right: 1.25rem;
          }
        }
      }
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
    padding: 1rem 0 3rem;
    min-height: 92px;
    box-sizing: border-box;
    transition: height 0.5s ease-in-out;
  }

  &__timeline {
    transition: all 0.5s ease-in-out;

    &-leave-active {
      left: 0;
      right: 0;
      position: absolute;
    }

    &-enter, &-leave-to {
      opacity: 0;
      transform: translateY(30px);
    }
  }

  &__years {
    position: absolute;
    color: rgba(0, 0, 0, 0.7);
    z-index: 10;
    height: 1rem;
    bottom: 0;
  }

  &__year, &__month {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.7rem;

    &:before {
      content: '';
      position: absolute;
      left: 50%;
      width: 2px;
      bottom: 2rem;
      background-color: #999791;
      transform: translateX(-50%);
      top: calc(-1 * var(--max-height));
    }
  }

  &__month {
    bottom: 1rem;
    background: #F5ECDA;

    &:before {
      background-color: transparent;
      background-image: linear-gradient(to bottom, #999791 50%, transparent 50%);
      background-position: left top;
      background-repeat: repeat-y;
      background-size: 2px 15px;
      bottom: 1rem;
    }

    &--0:before {
      display: none;
    }
  }
}
</style>
