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
    @keyup.arrow-left="gotoEvent(-1)"
    @keyup.arrow-right="gotoEvent(1)"
  >
    <transition name="event-card">
      <EventCard v-if="activeEvent !== null" :key="`event-${activeEvent.id}`" :event="activeEvent" />
    </transition>
    <transition name="scrubber__jump">
      <button
        v-if="leftOverflowVisible && (!$store.state.flipTimeline || filter.separateTags.length === 0)"
        class="scrubber__jump scrubber__jump--left"
        :title="$store.state.flipTimeline ? $t('ui.jump-to-end') : $t('ui.jump-to-start')"
        @click="$store.state.flipTimeline ? jumpToEnd() : jumpToStart()"
      >
        <ChevronsLeftIcon />
      </button>
    </transition>
    <div class="scrubber__bar">
      <div class="scrubber__indicator">
        <div class="scrubber__indicator-actions">
          <template v-if="this.$store.state.flipTimeline">
            <button
              class="scrubber__indicator-button scrubber__indicator-button--left"
              :title="$t('ui.next-event')"
              @click="gotoEvent(1)"
            >
              {{ $t('ui.next') }}
            </button>
            <span class="scrubber__indicator-year">
              {{ currentDate }}
            </span>
            <button
              class="scrubber__indicator-button scrubber__indicator-button--right"
              :title="$t('ui.previous-event')"
              @click="gotoEvent(-1)"
            >
              {{ $t('ui.previous') }}
            </button>
          </template>
          <template v-else>
            <button
              class="scrubber__indicator-button scrubber__indicator-button--left"
              :title="$t('ui.previous-event')"
              @click="gotoEvent(-1)"
            >
              {{ $t('ui.previous') }}
            </button>
            <span class="scrubber__indicator-year">
              {{ currentDate }}
            </span>
            <button class="scrubber__indicator-button scrubber__indicator-button--right" :title="$t('ui.next-event')" @click="gotoEvent(1)">
              {{ $t('ui.next') }}
            </button>
          </template>
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
            :excluded-by-lock="filter.lockedTag !== null && filter.lockedTag !== tag"
            class="scrubber__timeline"
            @event-selected="selectEvent"
          />
          <div key="years" class="scrubber__years">
            <template v-for="{ year, offset, months, singleEvent } in years.filter(year => year.display)">
              <span
                :key="year"
                :style="{ [offsetStyle]: `${offset + timelineOffset}px` }"
                class="scrubber__year"
              >
                {{ year }}
              </span>
              <span
                v-for="{ month, offset: monthOffset } in months.slice(singleEvent ? 1 : 0).filter(m => m.display && (offset + m.offset) <= maxEventOffset)"
                :key="`${year}.${month}`"
                :style="{ [offsetStyle]: `${offset + timelineOffset + monthOffset}px` }"
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
        v-if="rightOverflowVisible && (filter.separateTags.length === 0 || $store.state.flipTimeline)"
        class="scrubber__jump scrubber__jump--right"
        :title="$store.state.flipTimeline ? $t('ui.jump-to-start') : $t('ui.jump-to-end')"
        @click="$store.state.flipTimeline ? jumpToStart() : jumpToEnd()"
      >
        <ChevronsRightIcon />
      </button>
    </transition>
    <div
      v-if="filter.separateTags.length > 0"
      :class="['scrubber__separate-timelines', {'scrubber__separate-timelines--visible': separateVisible}]"
    >
      <transition name="scrubber__jump">
        <button
          v-if="(!$store.state.flipTimeline && rightOverflowVisible) || ($store.state.flipTimeline && leftOverflowVisible)"
          class="scrubber__jump scrubber__jump--separated"
          :title="$t('ui.jump-to-end')"
          @click="jumpToEnd"
        >
          <ChevronsLeftIcon v-if="$store.state.flipTimeline" />
          <ChevronsRightIcon v-else />
        </button>
      </transition>
      <button class="scrubber__separate-timelines-toggle" :title="$t('ui.separate-timelines')" @click="separateVisible = !separateVisible">
        <ChevronRightIcon v-if="separateVisible ^ $store.state.flipDirectionalIcons" size="1x" />
        <ChevronLeftIcon v-else size="1x" />
      </button>
      <div class="scrubber__separate-timelines-content">
        <h3>{{ $t('ui.separate-timelines') }}</h3>
        <SeparateTimelineOverview :height="separateHeight" />
      </div>
    </div>
    <button
      class="scrubber__jump scrubber__jump--date"
      :title="$t('ui.go-to-date.heading')"
      @click="$store.commit('openGoToDate')"
    >
      <CalendarIcon size="1x" />
    </button>
    <transition name="go-to-date">
      <GoToDate v-if="$store.state.goToDateOpen" @submit="scrollToDate" />
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'vue-feather-icons'
import Timeline from '@/components/Timeline.vue'
import EventCard from '@/components/EventCard.vue'
import { formatDate, lerp } from '@/utils'
import GoToDate from '@/components/GoToDate.vue'
import { inverseLerp } from '@/utils.js'
import SeparateTimelineOverview from '@/components/SeparateTimelineOverview.vue'

export default {
  name: 'Scrubber',
  components: {
    SeparateTimelineOverview,
    GoToDate,
    EventCard,
    Timeline,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon
  },
  data () {
    return {
      timelineWidth: 0,
      timelineOffset: 0,
      leftOverflowVisible: false,
      rightOverflowVisible: false,
      currentDate: '1174',
      separateVisible: false
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
    },
    separateHeight () {
      return Math.max(92, (this.filter.separateTags.length + 1) * 24 + 64)
    },
    filteredEvents () {
      return this.events.filter(event => this.$store.getters.isIncludedInNavigation(event))
    },
    offsetStyle () {
      return this.$store.state.flipTimeline ? 'right' : 'left'
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
    },
    'filter.latestSeparatedTag' (tag, oldTag) {
      if (tag === oldTag || tag === null) {
        return
      }

      const event = this.events.find(event => event.tags.includes(tag))
      if (event === undefined) {
        return
      }

      this.scrollToEvent(event)
    },
    'filter.separateTags': {
      handler (value) {
        if (value.length === 0) {
          this.separateVisible = false
        }
      },
      deep: true
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
      this.$refs.container.scrollLeft -= delta * 40 * (this.$store.state.flipTimeline ? -1 : 1)
      e.preventDefault()
    },
    onScroll () {
      this.updateOverflow()

      const scroll = this.$store.state.flipTimeline ? -this.$refs.container.scrollLeft : this.$refs.container.scrollLeft
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
      const scroll = this.$store.state.flipTimeline ? -container.scrollLeft : container.scrollLeft
      this.leftOverflowVisible = scroll > this.timelineOffset
      this.rightOverflowVisible = scroll + container.clientWidth < container.scrollWidth - this.timelineOffset

      if (this.$store.state.flipTimeline) {
        const tmp = this.leftOverflowVisible
        this.leftOverflowVisible = this.rightOverflowVisible
        this.rightOverflowVisible = tmp
      }
    },
    gotoEvent (dir) {
      const scroll = this.$store.state.flipTimeline ? -this.$refs.container.scrollLeft : this.$refs.container.scrollLeft

      const gotoAndScroll = (id) => {
        let index = Math.max(0, Math.min(id, this.events.length - 1))
        while (index > 0 && index < this.events.length - 1 && !this.$store.getters.isIncludedInNavigation(this.events[index])) {
          index += dir
        }

        if (!this.$store.getters.isIncludedInNavigation(this.events[index])) {
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
    scrollToDate (date) {
      const formattedDate = formatDate(date)
      const matchingEvents = this.events.filter(event => formatDate(event.date) === formattedDate)
      if (matchingEvents.length === 1) {
        this.selectEvent(matchingEvents[0])
        return
      } else if (matchingEvents.length > 1) {
        this.scrollToEvent(matchingEvents[0])
        return
      }

      const matchingYear = this.years.find(y => y.year === date[0])
      if (date.length === 1 && matchingYear !== undefined) {
        this.scrollTo(matchingYear.offset)
        return
      } else if (date.length === 2 && matchingYear !== undefined) {
        this.scrollTo(matchingYear.offset + matchingYear.months[date[1] - 1].offset)
        return
      } else if (matchingYear !== undefined) {
        const timeOfMonth = (date[3] ?? 1) - 1 + ((date[2] ?? 1) - 1) * 5

        const month = matchingYear.months[date[1] - 1]
        const nextMonth = matchingYear.months[date[1]]
        const monthWidth = date[1] === 10 ? matchingYear.size - month.offset : nextMonth.offset - month.offset

        this.scrollTo(matchingYear.offset + month.offset + timeOfMonth / 50 * monthWidth)

        return
      }

      const endIndex = this.years.findIndex(year => year.year >= date[0])

      if (endIndex === -1) {
        this.jumpToEnd()
        return
      }

      const start = this.years[Math.max(endIndex - 1, 0)]
      const end = this.years[endIndex]
      const offset = lerp(
        start.offset,
        end.offset,
        inverseLerp(
          start.year,
          end.year,
          date[0]
        )
      )

      this.scrollTo(offset)
    },
    selectEvent (event) {
      this.$store.commit('selectEvent', event)
      this.scrollToEvent(event)
    },
    scrollToEvent (event) {
      this.$nextTick(() => {
        const scrollTarget = event !== undefined ? event : this.activeEvent
        this.scrollTo(scrollTarget.offset)
      })
    },
    jumpToStart () {
      const firstEvent = this.filteredEvents[0]

      if (firstEvent === undefined) {
        this.scrollTo(0)
        return
      }

      this.scrollToEvent(firstEvent)
    },
    jumpToEnd () {
      const lastEvent = this.filteredEvents[this.filteredEvents.length - 1]

      if (lastEvent === undefined) {
        this.scrollTo(this.$refs.container.scrollWidth - this.$refs.container.clientWidth)
        return
      }

      this.scrollToEvent(lastEvent)
    },
    scrollTo (offset) {
      this.$refs.container.scrollTo({ left: this.$store.state.flipTimeline ? -offset : offset, behavior: 'smooth' })
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

  &__jump, &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    z-index: 16;
    align-self: center;
    font-size: 1rem;
    width: 2rem;
    height: 2rem;
    border-radius: 100%;
    appearance: none;
    border: none;
    background: #0f3562;
    color: #f6f8fa;
    margin: 0;
    padding: 0;
    cursor: pointer;
    outline: none;
    box-sizing: border-box;
    white-space: nowrap;
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.5);
    transition: 0.2s ease-in-out background;

    &:hover, &:active, &:focus {
      background: lighten(#0f3562, 10%);
    }

    &-enter-active {
      transition: opacity 0.2s ease-out, transform 0.3s ease-out;
      transition-delay: 0.1s, 0s;
    }

    &-leave-active {
      transition: opacity 0.2s ease-in, transform 0.3s ease-in;
    }

    &-enter, &-leave-to {
      opacity: 0;
      transform: translateX(var(--leave-position));
    }

    &-enter-to, &-leave-from {
      opacity: 1;
      transform: translateX(0);
    }

    &--left {
      left: 2rem;
      --leave-position: -100%;
    }

    &--right {
      right: 2rem;
      --leave-position: 100%;
    }

    &--separated {
      box-shadow: none;

      [dir=ltr] & {
        left: -3rem;
        --leave-position: 100%;
      }

      [dir=rtl] & {
        right: -3rem;
        --leave-position: -100%;
      }
    }

    &--date {
      width: auto;
      height: auto;
      bottom: 100%;
      margin-bottom: 2rem;
      border-radius: 2rem;
      padding: 0.75rem 0.75rem;
      background: #F5ECDA;
      color: #242629;
      z-index: 4;

      [dir=ltr] & {
        right: 2rem;
      }

      [dir=rtl] & {
        left: 2rem;
      }

      &:hover, &:focus, &:active {
        background: saturate(darken(#F5ECDA, 10%), 5%);
      }
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

      &--left {
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

      &--right {
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
    font-size: 0.7rem;

    [dir=ltr] & {
      transform: translateX(-50%);
    }

    [dir=rtl] & {
      transform: translateX(50%);
    }

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

  &__separate-timelines {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: flex-end;
    z-index: 16;
    filter: drop-shadow(-2px 0 6px rgba(0, 0, 0, 0.5));
    font-size: 14px;
    transition: transform 0.2s ease-in;

    [dir=ltr] & {
      right: 0;
      transform: translateX(calc(100% - 1.5rem));
    }

    [dir=rtl] & {
      left: 0;
      transform: translateX(calc(-100% + 1.5rem));
    }

    &--visible {
      transform: translateX(0) !important;
      transition: transform 0.2s ease-out;
    }

    &-toggle {
      display: flex;
      align-self: stretch;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      appearance: none;
      border: none;
      background: #F5ECDA;
      color: #242629;
      margin: 0;
      padding: 0 0.25rem;
      cursor: pointer;
      outline: none;
      box-sizing: border-box;
      white-space: nowrap;
      transition: 0.2s ease-in-out background;
      width: 1.5rem;

      &:hover, &:focus, &:active {
        background: saturate(darken(#F5ECDA, 10%), 5%);
      }
    }

    &-content {
      margin-top: -1rem;

      [dir=ltr] & {
        padding: 0.5rem 1rem 0 0.75rem;
        border-top-left-radius: 1rem;
      }

      [dir=rtl] & {
        padding: 0.5rem 0.75rem 0 1rem;
        border-top-right-radius: 1rem;
      }

      h3 {
        margin: 0;
        display: inline-block;
      }

      background: #F5ECDA;
    }
  }
}
</style>
