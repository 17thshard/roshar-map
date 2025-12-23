<template>
  <Draggable
    v-model="separateTags"
    :animation="200"
    tag="ul"
    handle=".separate-timeline-overview__timeline-drag-handle"
    class="separate-timeline-overview"
    :style="{ height: `${height}px` }"
    :item-key="(item) => item"
    @start="dragging = true"
    @end="dragging = false"
  >
    <template #item="{ element: tag }">
      <li
        :class="[
          'separate-timeline-overview__timeline',
          { 'separate-timeline-overview__timeline--excluded': lockedTag !== null && lockedTag !== tag }
        ]"
      >
        <span class="separate-timeline-overview__timeline-drag-handle" />
        <span class="separate-timeline-overview__timeline-icon" :style="{ background: $store.state.mappings.tags[tag].color }" />
        {{ $t(`tags.${tag}`) }}
        <div class="separate-timeline-overview__timeline-actions">
          <button
            class="separate-timeline-overview__timeline-action"
            :title="lockedTag === tag ? $t('ui.unlock-timeline') : $t('ui.lock-timeline')"
            @click="toggleLock(tag)"
          >
            <VueFeather v-if="lockedTag === tag" type="lock" :size="24" />
            <VueFeather v-else type="unlock" :size="24" />
          </button>
          <button
            class="separate-timeline-overview__timeline-action"
            :title="$t('ui.stop-display-separately')"
            @click="disableTagSeparation(tag)"
          >
            <VueFeather type="x" :size="24" />
          </button>
        </div>
      </li>
    </template>
  </Draggable>
</template>

<script>
import Draggable from '@marshallswain/vuedraggable'
import VueFeather from 'vue-feather'
import { useI18n } from 'vue-i18n'

export default {
  name: 'SeparateTimelineOverview',
  components: { VueFeather, Draggable },
  props: {
    height: {
      type: Number,
      required: true
    }
  },
  setup () {
    const { t } = useI18n()
    return { t }
  },
  data () {
    return {
      dragging: false
    }
  },
  computed: {
    separateTags: {
      get () {
        return this.$store.state.filter.separateTags
      },
      set (value) {
        this.$store.commit('updateSeparateTags', value)
      }
    },
    lockedTag () {
      return this.$store.state.filter.lockedTag
    }
  },
  methods: {
    toggleLock (tag) {
      if (this.lockedTag === tag) {
        this.$store.commit('unlockTag')
      } else {
        this.$store.commit('lockTag', tag)
      }
    },
    disableTagSeparation (tag) {
      this.$store.commit('disableTagSeparation', tag)
    }
  }
}
</script>

<style lang="scss">
.separate-timeline-overview {
  display: flex;
  flex-direction: column;
  justify-content: center;
  list-style-type: none;
  margin: 0;
  position: relative;
  transition: height 0.5s ease-in-out;
  box-sizing: border-box;
  padding: 1rem 0 72px;

  &__timeline {
    display: flex;
    align-items: center;
    height: 24px;
    box-sizing: border-box;

    &--excluded {
      opacity: 0.5;
    }

    &.ghost {
      opacity: 0.5;
      background: #F5ECDA;
    }

    &-move, &-enter-active, &-leave-active {
      transition: all 0.5s ease-in-out;
    }

    &-leave-active {
      position: absolute;
      left: 0;
      right: 0;
    }

    &-enter-from, &-leave-to {
      opacity: 0;
      transform: translateY(30px);
    }

    &-drag-handle {
      align-self: stretch;
      width: 16px;
      cursor: move;
      background-repeat: no-repeat;
      background-position: 50%;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23242629' d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2m0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8m0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14m6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6m0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8m0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14'/%3E%3C/svg%3E");

      [dir=ltr] & {
        margin-right: 0.25rem;
      }

      [dir=rtl] & {
        margin-left: 0.25rem;
      }
    }

    &-icon {
      width: 0.8rem;
      height: 0.8rem;
      border-radius: 100%;

      [dir=ltr] & {
        margin-right: 0.25rem;
      }

      [dir=rtl] & {
        margin-left: 0.25rem;
      }
    }

    &-actions {
      display: flex;
      align-items: center;

      [dir=ltr] & {
        margin-left: auto;
      }

      [dir=rtl] & {
        margin-right: auto;
      }
    }

    &-action {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      appearance: none;
      outline: none;
      box-sizing: border-box;
      border: none;
      background: none;
      transition: color 0.2s ease-in-out;
      padding: 0;
      font-size: 1.25rem;

      [dir=ltr] & {
        margin-left: 0.25rem;
      }

      [dir=rtl] & {
        margin-right: 0.25rem;
      }

      &:hover, &:active, &:focus {
        color: #ffad00;
      }
    }
  }
}
</style>
