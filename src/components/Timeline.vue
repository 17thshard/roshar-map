<template>
  <transition-group tag="div" name="timeline__event" class="timeline">
    <div key="bar" :style="{ left: `${barOffset + offset}px`, ...barStyles }" class="timeline__bar" />
    <template v-for="event in events">
      <button
        :key="event.id"
        :title="$t(`events.${event.id}.name`)"
        :class="['timeline__event', { 'timeline__event--active': activeEvent !== null && activeEvent.id === event.id }]"
        :style="{ left: `${event.offset + offset}px` }"
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

  &__bar {
    position: absolute;
    right: 0;
    height: 0.6rem;
    z-index: 14;

    &:before, &:after {
      position: absolute;
      content: '';
      top: 0;
      bottom: 0;
    }

    &:before {
      left: -1.5rem;
      right: 10rem;
      border-top-left-radius: 0.3rem;
      border-bottom-left-radius: 0.3rem;
    }

    &:after {
      width: 10rem;
      left: auto;
      right: 0;
    }
  }

  .timeline__bar {
    --timeline-bar-color: 153, 151, 145;
    --timeline-bar-alpha: 0.5;

    &:before {
      background: rgba(var(--timeline-bar-color), var(--timeline-bar-alpha));
    }

    &:after {
      background: linear-gradient(to right, rgba(var(--timeline-bar-color), var(--timeline-bar-alpha)), rgba(var(--timeline-bar-color), 0));
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
    margin: 0 0 0 -0.5em;
    box-sizing: border-box;
    border: 0.5em solid;
    z-index: 15;

    @mixin diamond($base-color) {
      border-top-color: lighten($base-color, 10%);
      border-left-color: saturate(lighten($base-color, 20%), 10%);
      border-bottom-color: lighten($base-color, 15%);
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
