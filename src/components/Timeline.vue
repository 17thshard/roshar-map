<template>
  <transition-group tag="div" name="timeline__event" :class="['timeline', { 'timeline--excluded-by-lock': excludedByLock }]">
    <div
      key="bar"
      :style="{ [offsetStyle]: `${barOffset + offset}px`, ...(tag === 'all' ? { [endStyle]: 0 } : { width: `${width}px` }), ...barStyles }"
      :class="['timeline__bar', { 'timeline__bar--separate': tag !== 'all' }]"
    />
    <template v-for="event in events">
      <button
        :key="event.id"
        :title="$t(`events.${event.id}.name`)"
        :class="['timeline__event', { 'timeline__event--active': activeEvent !== null && activeEvent.id === event.id }]"
        :style="{ [offsetStyle]: `${event.offset + offset}px` }"
        :disabled="isDisabled(event)"
        @click="$emit('event-selected', event)"
      />
    </template>
  </transition-group>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { parseColorToCssVar } from '@/utils'

export default {
  name: 'Timeline',
  props: {
    tag: {
      type: String,
      required: true
    },
    offset: {
      type: Number,
      required: true
    },
    events: {
      type: Array,
      required: true
    },
    activeEvent: {
      type: Object,
      required: false,
      default: () => null
    },
    excludedByLock: {
      type: Boolean
    }
  },
  computed: {
    ...mapGetters(['isDisabled']),
    ...mapState({ tagProperties: state => state.mappings.tags }),
    barStyles () {
      const props = this.tagProperties[this.tag]

      if (props === undefined) {
        return undefined
      }

      return {
        '--timeline-bar-color': parseColorToCssVar(props.color),
        '--timeline-bar-alpha': props.alpha
      }
    },
    barOffset () {
      return Math.min(...this.events.map(e => e.offset))
    },
    width () {
      return Math.max(...this.events.map(e => e.offset)) - Math.min(...this.events.map(e => e.offset))
    },
    offsetStyle () {
      return this.$store.state.flipTimeline ? 'right' : 'left'
    },
    endStyle () {
      return this.$store.state.flipTimeline ? 'left' : 'right'
    }
  }
}
</script>

<style lang="scss">
.timeline {
  display: flex;
  align-items: center;
  box-sizing: content-box;
  padding: 0.75rem 0;
  position: relative;

  &--excluded-by-lock {
    opacity: 0.2;
  }

  &__bar {
    position: absolute;
    height: 0.6rem;
    z-index: 14;

    &:before, &:after {
      position: absolute;
      content: '';
      top: 0;
      bottom: 0;
    }

    &:after {
      width: 10rem;
    }

    [dir=ltr] & {
      &:before {
        left: -1.5rem;
        right: 10rem;
        border-top-left-radius: 0.3rem;
        border-bottom-left-radius: 0.3rem;
      }

      &:after {
        left: auto;
        right: 0;
      }
    }

    [dir=rtl] & {
      &:before {
        right: -1.5rem;
        left: 10rem;
        border-top-right-radius: 0.3rem;
        border-bottom-right-radius: 0.3rem;
      }

      &:after {
        right: auto;
        left: 0;
      }
    }

    &--separate {
      [dir=ltr] & {
        &:before {
          right: 0;
        }

        &:after {
          left: 100%;
        }
      }

      [dir=rtl] & {
        &:before {
          left: 0;
        }

        &:after {
          right: 100%;
        }
      }
    }
  }

  .timeline__bar {
    --timeline-bar-color: 153, 151, 145;
    --timeline-bar-alpha: 0.5;

    &:before {
      background: rgba(var(--timeline-bar-color), var(--timeline-bar-alpha));
    }

    [dir=ltr] &:after {
      background: linear-gradient(to right, rgba(var(--timeline-bar-color), var(--timeline-bar-alpha)), rgba(var(--timeline-bar-color), 0));
    }

    [dir=rtl] &:after {
      background: linear-gradient(to left, rgba(var(--timeline-bar-color), var(--timeline-bar-alpha)), rgba(var(--timeline-bar-color), 0));
    }
  }

  &__event {
    position: absolute;
    font-size: 1rem;
    width: 1em;
    height: 1em;
    appearance: none;
    outline: none;
    padding: 0;
    box-sizing: border-box;
    border: 0.5em solid;
    z-index: 15;

    [dir=ltr] & {
      margin: 0 0 0 -0.5em;
    }

    [dir=rtl] & {
      margin: 0 -0.5em 0 0;
    }

    @mixin diamond($base-color) {
      border-top-color: color.adjust($base-color, $lightness: 10%);
      border-left-color: color.adjust(color.adjust($base-color, $lightness: 20%), $saturation: 10%);
      border-bottom-color: color.adjust($base-color, $lightness: 15%);
      border-right-color: $base-color;
    }

    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, font-size 0.2s ease-in-out, opacity 0.2s ease-in-out;
    @include diamond(#9dc2ec);
    box-shadow: 0 0 0 #21a5ec;

    transform-origin: 50% 50%;
    transform: rotate(45deg);

    &--active:not(:disabled), &:not(:disabled):hover {
      @include diamond(#bcd4ea);
      box-shadow: 0 0 1em #61b8ef;
      font-size: 1.1rem;
      cursor: pointer;
    }

    &:disabled {
      cursor: default !important;
      pointer-events: none;
      opacity: 0.2;
    }

    &:after {
      content: '';
      position: absolute;
      left: -0.5em;
      right: -0.5em;
      top: -0.5em;
      bottom: -0.5em;
      box-shadow: inset 0 0 0.5em #21a5ec;
    }

    &-enter-active, &-leave-active {
      transition: opacity 1s;
    }

    &-enter, &-leave-to {
      opacity: 0;
    }
  }

  &__year {
    display: block;
    position: absolute;
    bottom: 1rem;
    font-size: 1rem;
    transform: translateX(-50%);
  }
}
</style>
