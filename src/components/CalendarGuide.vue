<template>
  <div class="calendar-guide__wrapper" @click.self="close">
    <section class="calendar-guide">
      <header class="calendar-guide__header">
        <h2>{{ $t('ui.calendar-guide.title') }}</h2>

        <button class="calendar-guide__close" :title="$t('ui.close')" @click="close">
          <XIcon />
        </button>
      </header>
      <Markdown class="calendar-guide__explanation" :content="explanation" />
      <Calendar
        class="calendar-guide__calendar"
        :highlight-range="highlightRange"
        :clickable="step === 'date'"
        :stagger="step !== 'date'"
        @date-click="highlightedDate = $event"
      />
      <nav class="calendar-guide__navigation">
        <button class="calendar-guide__button calendar-guide__button--prev" :title="$t('ui.previous')" @click="prevStep">
          <ChevronRightIcon v-if="$store.state.flipDirectionalIcons" size="1x" :stroke-width="3" />
          <ChevronLeftIcon v-else size="1x" :stroke-width="3" />
        </button>
        <ul class="calendar-guide__dots">
          <li
            v-for="s in STEPS"
            :key="s"
            :class="['calendar-guide__dots-item', { 'calendar-guide__dots-item--active': step === s }]"
            :title="$t(`ui.calendar-guide.${s}.name`)"
            @click="step = s"
          />
        </ul>
        <button class="calendar-guide__button calendar-guide__button--next" :title="$t('ui.next')" @click="nextStep">
          <ChevronLeftIcon v-if="$store.state.flipDirectionalIcons" size="1x" :stroke-width="3" />
          <ChevronRightIcon v-else size="1x" :stroke-width="3" />
        </button>
      </nav>
    </section>
  </div>
</template>

<script>
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'vue-feather-icons'
import Calendar from '@/components/Calendar.vue'
import Markdown from '@/components/Markdown.vue'
import { formatDate } from '@/utils'

const STEPS = ['start', 'day', 'week', 'month', 'year', 'date']

export default {
  name: 'CalendarGuide',
  components: { Markdown, Calendar, ChevronLeftIcon, ChevronRightIcon, XIcon },
  data () {
    return {
      step: 'start',
      highlightedDate: [3, 4, 3],
      STEPS
    }
  },
  computed: {
    stepIndex () {
      return STEPS.indexOf(this.step)
    },
    explanation () {
      return this.step === 'date'
        ? this.$t(`ui.calendar-guide.${this.step}.explanation`, { date: formatDate([1173, ...this.highlightedDate]) })
        : this.$t(`ui.calendar-guide.${this.step}.explanation`)
    },
    highlightRange () {
      switch (this.step) {
        case 'start':
          return null
        case 'day':
          return { start: [1, 1, 1], end: [1, 1, 1] }
        case 'week':
          return { start: [1, 1, 1], end: [1, 1, 5] }
        case 'month':
          return { start: [1, 1, 1], end: [1, 10, 5] }
        case 'year':
          return { start: [1, 1, 1], end: [10, 10, 5] }
        default:
          return { start: this.highlightedDate, end: this.highlightedDate }
      }
    }
  },
  mounted () {
    document.addEventListener('keyup', this.closeOnEscape)
  },
  destroyed () {
    document.removeEventListener('keyup', this.closeOnEscape)
  },
  methods: {
    closeOnEscape (event) {
      if (event.key === 'Escape') {
        this.close()
      }
    },
    close () {
      this.$store.commit('closeCalendarGuide')
    },
    prevStep () {
      this.step = STEPS[Math.max(this.stepIndex - 1, 0)]
    },
    nextStep () {
      this.step = STEPS[Math.min(this.stepIndex + 1, STEPS.length - 1)]
    }
  }
}
</script>

<style lang="scss">
.calendar-guide {
  position: relative;
  padding: 1.5rem;
  filter: drop-shadow(0 0.5rem 1rem rgba(0, 0, 0, 0.5));
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 34rem;
  cursor: auto;
  box-sizing: border-box;

  @media (max-width: 640px) {
    width: 90%;
    max-width: 90%;
    overflow: hidden;
  }

  &-enter-active, &-leave-active {
    transition: opacity 0.5s ease-in;
  }

  &-enter, &-leave-to {
    opacity: 0;
  }

  &-enter-to, &-leave {
    opacity: 1;
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    background: #F5ECDA url(../assets/paper.png);
    clip-path: polygon(
        1rem 0,
        calc(100% - 1rem) 0,
        100% 1rem,
        100% calc(100% - 1rem),
        calc(100% - 1rem) 100%,
        1rem 100%,
        0 calc(100% - 1rem),
        0 1rem
    );
  }

  &__wrapper {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  &__header {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    z-index: 1;

    h2 {
      margin: 0;
      font-variant: small-caps;
    }
  }

  &__back, &__close {
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    transition: color 0.2s ease-in-out;
    color: #242629;
    z-index: 65;
    border-radius: 100%;
    padding: 0.25rem;
    line-height: 1;
    display: flex;

    [dir=ltr] & {
      margin-left: auto;
    }

    [dir=rtl] & {
      margin-right: auto;
    }

    &:hover, &:active, &:focus {
      color: #ffad00 !important;
    }
  }

  &__explanation, &__calendar {
    position: relative;
    z-index: 1;
  }

  &__explanation {
    align-self: flex-start;
    font-size: 0.9rem;
  }

  &__navigation {
    position: relative;
    display: flex;
    align-items: center;
    margin-top: 1rem;
    z-index: 1;
  }

  &__button {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    padding: 0;
    margin: 0;
    color: #0f3562;
    background: none;
    appearance: none;
    border: none;
    outline: none;
    transition: all 0.2s ease-in-out;

    &:hover, &:active, &:focus {
      cursor: pointer;
      color: color.adjust(#0f3562, $lightness: 10%);
    }

    [dir=ltr] & {
      &--prev {
        &:hover, &:active, &:focus {
          transform: translateX(-0.25rem);
        }
      }

      &--next {
        &:hover, &:active, &:focus {
          transform: translateX(0.25rem);
        }
      }
    }

    [dir=rtl] & {
      &--prev {
        &:hover, &:active, &:focus {
          transform: translateX(0.25rem);
        }
      }

      &--next {
        &:hover, &:active, &:focus {
          transform: translateX(-0.25rem);
        }
      }
    }
  }

  &__dots {
    display: grid;
    justify-content: center;
    list-style-type: none;
    grid-auto-flow: column;
    padding: 0;
    margin: 0 1rem;
    grid-gap: 0.5rem;
    flex: 1;

    &-item {
      display: block;
      width: 0.75rem;
      height: 0.75rem;
      transform-origin: 50% 50%;
      transform: rotate(45deg);
      background: #0f3562;
      opacity: 0.4;
      transition: opacity 0.2s ease-in-out;
      cursor: pointer;

      &:hover, &--active {
        opacity: 1;
      }
    }
  }
}
</style>
