<template>
  <div :class="['settings', { 'settings--active': active }]">
    <button class="settings__button" @click="active = true">
      <SlidersIcon size="1x" />
      Settings
    </button>
    <transition name="settings__content">
      <div v-if="active" class="settings__content">
        <button class="settings__close" title="Close Settings" @click="active = false">
          <XIcon />
        </button>
        <section>
          <h3>Filters</h3>
          <template v-for="(tags, category) in tagCategories">
            <h4 :key="category">
              {{ $t(`tagCategories.${category}`) }}
            </h4>
            <ul :key="`${category}-tags?`" class="settings__tag-list">
              <li v-for="tag in tags" :key="tag">
                <label :for="`tag--${tag}`">
                  <input :id="`tag--${tag}`" type="checkbox" :checked="!filter.tags.includes(tag)" @input="toggleTag(tag)">
                  <span class="settings__tag-check" />
                  {{ $t(`tags.${tag}`) }}
                  <a v-if="!filter.separateTags.includes(tag)" href="#" @click.prevent="enableTagSeparation(tag)">Display separately</a>
                </label>
              </li>
            </ul>
          </template>
        </section>

        <section class="settings__separate-timelines-container">
          <h3>
            Separate timelines
          </h3>
          <Draggable
            v-model="separateTags"
            :animation="200"
            tag="div"
            handle=".settings__separate-timeline-drag-handle"
            @start="draggingSeparates = true"
            @end="draggingSeparates = false"
          >
            <transition-group
              :name="draggingSeparates ? 'settings__separate-timeline--dragging' : 'settings__separate-timeline'"
              tag="ul"
              type="transition"
              class="settings__separate-timelines"
              :style="{ height: `${separateHeight}px` }"
            >
              <li v-for="tag in separateTags" :key="tag" class="settings__separate-timeline">
                <span class="settings__separate-timeline-drag-handle" />
                {{ $t(`tags.${tag}`) }}
                <button class="settings__separate-timeline-delete" title="No longer display separately" @click="disableTagSeparation(tag)">
                  <XIcon />
                </button>
              </li>
            </transition-group>
          </Draggable>
        </section>
      </div>
    </transition>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import { SlidersIcon, XIcon } from 'vue-feather-icons'
import { mapState } from 'vuex'

export default {
  name: 'Settings',
  components: { SlidersIcon, XIcon, Draggable },
  data () {
    return {
      active: false,
      tagCategories: {
        tags: ['general'],
        characters: ['dalinar', 'kaladin', 'shallan'],
        books: ['wok', 'wor', 'ob', 'ed', 'row']
      },
      draggingSeparates: false
    }
  },
  computed: {
    ...mapState(['events', 'filter']),
    separateTags: {
      get () {
        return this.filter.separateTags
      },
      set (value) {
        this.$store.commit('updateSeparateTags', value)
      }
    },
    separateHeight () {
      return Math.max(92, (this.separateTags.length + 1) * 24 + 32)
    }
  },
  methods: {
    toggleTag (tag) {
      this.$store.commit('toggleTag', tag)
    },
    enableTagSeparation (tag) {
      this.$store.commit('enableTagSeparation', tag)
    },
    disableTagSeparation (tag) {
      this.$store.commit('disableTagSeparation', tag)
    }
  }
}
</script>

<style lang="scss">
.settings {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 50;
  width: 350px;
  max-width: 100%;

  &__button {
    display: flex;
    align-items: center;
    position: absolute;
    left: 100%;
    top: 2rem;
    width: 9rem;
    margin-left: -11rem;
    font-size: 1rem;
    line-height: 1;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    z-index: 51;
    background: #F5ECDA;
    border-radius: 2rem;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: background 0.2s ease-in-out, left 0.5s ease-in-out, margin-left 0.5s ease-in-out, box-shadow 0.2s ease-in-out;
    color: #242629;
    pointer-events: auto;
    box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.5);

    &:hover, &:active, &:focus {
      background: saturate(darken(#F5ECDA, 10%), 5%);
    }

    .feather {
      margin-right: 0.5rem;
    }
  }

  &__content {
    z-index: 50;
    position: absolute;
    background: #F5ECDA url(../assets/paper.png);
    right: 0;
    left: 0;
    padding: 5rem 1rem 2rem;
    box-sizing: border-box;
    top: 0;
    bottom: 0;
    pointer-events: auto;
    box-shadow: 0 0 2rem rgba(0, 0, 0, 0.5);
    clip-path: circle(100vh at 5.5rem 3.25rem);
    font-size: 14px;
    overflow: hidden;

    &-enter-active, &-leave-active {
      transition: clip-path 0.5s ease-in-out, transform 0.5s ease-in-out;
    }

    &-enter {
      clip-path: circle(1px at 5.5rem 3.25rem);
      transform: translateX(calc(100% - 13rem));
    }

    &-enter-to {
      clip-path: circle(100vh at 5.5rem 3.25rem);
    }

    &-leave-to {
      clip-path: circle(1px at 5.5rem 3.25rem);
      transform: translateX(calc(100% - 11rem));
    }

    h3 {
      margin: 0 0 0.5rem;
    }

    h4 {
      font-family: sans-serif;
      text-transform: uppercase;
      font-size: 0.8em;
      margin: 0;
    }
  }

  &__close {
    position: absolute;
    top: 2.5rem;
    right: 1rem;
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    transition: color 0.2s ease-in-out;

    &:hover, &:active, &:focus {
      color: #ffad00;
    }
  }

  &--active .settings__button {
    background: rgba(#F5ECDA, 0) !important;
    cursor: default !important;
    left: 1.5rem;
    margin-left: -2rem;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }

  &__tag-list {
    padding: 0;
    list-style-type: none;
    margin: 0.5rem 0;

    label {
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0.25rem 0 0.25rem 0.2rem;

      input {
        display: none;
      }

      @mixin diamond($base-color) {
        border-top-color: lighten($base-color, 10%);
        border-left-color: saturate(lighten($base-color, 20%), 10%);
        border-bottom-color: lighten($base-color, 15%);
        border-right-color: $base-color;
      }

      .settings__tag-check {
        display: block;
        margin-right: 0.5rem;
        width: 1rem;
        height: 1rem;
        background: darken(#F5ECDA, 30%);
        padding: 0.125rem;
        box-sizing: border-box;
        position: relative;
        transform-origin: 50% 50%;
        transform: rotate(45deg);

        &:before {
          display: block;
          content: '';
          width: 0.75rem;
          height: 0.75rem;
          box-sizing: border-box;
          border: 0.375rem solid;

          @include diamond(#9dc2ec);
        }

        &:after {
          content: '';
          position: absolute;
          left: 0.125rem;
          top: 0.125rem;
          width: 0.75rem;
          height: 0.75rem;
          box-shadow: inset 0 0 0.3rem #21a5ec;
        }

        &:before, &:after {
          opacity: 0;
          transition: border-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
        }
      }

      &:hover .settings__tag-check {
        &:before, &:after {
          opacity: 0.5;
        }
      }

      input:checked + .settings__tag-check {
        &:before, &:after {
          opacity: 1;
        }
      }

      &:hover input:checked + .settings__tag-check {
        &:before {
          @include diamond(#e0efff);
        }
      }

      a {
        margin-left: auto;
        color: #242629;
      }
    }
  }

  &__separate-timelines {
    display: flex;
    flex-direction: column;
    justify-content: center;
    list-style-type: none;
    margin: 0;
    position: relative;
    transition: height 0.5s ease-in-out;
    box-sizing: border-box;
    padding: 1rem 0 calc(24px + 1rem);

    &-container {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem 0.5rem 0;
      background: #F5ECDA url(../assets/paper.png);
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    }
  }

  &__separate-timeline {
    display: flex;
    align-items: center;
    height: 24px;
    box-sizing: border-box;

    &.ghost {
      opacity: 0.5;
      background: #c8ebfb;
    }

    &-move, &-enter-active, &-leave-active {
      transition: all 0.5s ease-in-out;
    }

    &-leave-active {
      position: absolute;
      left: 0;
      right: 0;
    }

    &-enter, &-leave-to {
      opacity: 0;
      transform: translateY(30px);
    }

    &-drag-handle {
      align-self: stretch;
      margin-right: 0.5rem;
      width: 16px;
      cursor: move;
      background-repeat: no-repeat;
      background-position: 50%;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23242629' d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2m0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8m0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14m6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6m0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8m0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14'/%3E%3C/svg%3E");
    }

    &-delete {
      margin-left: auto;
      cursor: pointer;
      appearance: none;
      outline: none;
      box-sizing: border-box;
      border: none;
      background: none;
      transition: color 0.2s ease-in-out;

      &:hover, &:active, &:focus {
        color: #ffad00;
      }
    }
  }
}
</style>
