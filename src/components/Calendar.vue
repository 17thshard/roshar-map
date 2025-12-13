<template>
  <div :class="['calendar', { 'calendar--clickable': clickable }]">
    <div v-for="month in 10" :key="month" class="calendar__month">
      <span class="calendar__month-name">
        {{ $t(`numbers[${month - 1}]`) }}
      </span>
      <div v-for="week in 10" :key="week" class="calendar__week">
        <span
          v-for="day in 5"
          :key="day"
          :class="['calendar__day', { 'calendar__day--highlight': isDateHighlighted(month, week, day) }]"
          :style="{ '--delay': getHighlightDelay(month, week, day) }"
          @click="onDateClicked(month, week, day)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getTimestampInYear } from '@/utils'

export default {
  name: 'Calendar',
  props: {
    highlightRange: {
      type: Object,
      default: () => null
    },
    clickable: {
      type: Boolean
    },
    stagger: {
      type: Boolean
    }
  },
  computed: {
    highlightTimestampRange () {
      if (this.highlightRange === null) {
        return null
      }

      return { start: getTimestampInYear(this.highlightRange.start), end: getTimestampInYear(this.highlightRange.end) }
    }
  },
  methods: {
    isDateHighlighted (month, week, day) {
      if (this.highlightRange === null) {
        return false
      }

      const timestamp = getTimestampInYear([month, week, day])
      return this.highlightTimestampRange.start <= timestamp && timestamp <= this.highlightTimestampRange.end
    },
    getHighlightDelay (month, week, day) {
      if (this.highlightRange === null || !this.stagger || !this.isDateHighlighted(month, week, day)) {
        return undefined
      }

      const diff = getTimestampInYear([month, week, day]) - this.highlightTimestampRange.start
      return `${diff * 2}ms`
    },
    onDateClicked (month, week, day) {
      if (!this.clickable) {
        return
      }

      this.$emit('date-click', [month, week, day])
    }
  }
}
</script>

<style lang="scss">
.calendar {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  --base-unit: 1rem;
  grid-gap: var(--base-unit);

  @media (max-width: 640px) {
    --base-unit: calc(90vw / 35);
  }

  &--clickable .calendar__day {
    cursor: pointer;
  }

  &__month {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-gap: calc(max(var(--base-unit) / 4, 4px));

    &-name {
      text-align: center;
      font-weight: bold;
      font-size: 0.9rem;
    }
  }

  &__week {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    grid-gap: calc(max(var(--base-unit) / 4, 4px));
  }

  &__day {
    display: block;
    width: var(--base-unit);
    height: var(--base-unit);
    background: color.adjust(#F5ECDA, $lightness: -30%);
    padding: calc(max(var(--base-unit) / 4, 2px));
    box-sizing: border-box;
    position: relative;

    &:after {
      display: block;
      content: '';
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background: #0a3972;
      transform-origin: 50% 50%;
      transform: rotate(45deg) scale(0);
      opacity: 0;
      transition: all 0.2s ease-in-out;
    }

    &--highlight:after {
      opacity: 1;
      transform: rotate(45deg) scale(1);
      transition-delay: var(--delay);
    }
  }
}
</style>
