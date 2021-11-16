<template>
  <div class="tutorial">
    <transition name="tutorial">
      <div v-if="!hideWindow" class="tutorial__window">
        <div class="tutorial__window-text">
          <h2>{{ $t('ui.tutorial.title') }}</h2>
          <p>{{ $t('ui.tutorial.explanation') }}</p>
        </div>
        <div class="tutorial__window-buttons">
          <button @click="dismiss">
            {{ $t('ui.dismiss') }}
          </button>
          <button @click="$store.commit('openCalendarGuide')">
            {{ $t('ui.tutorial.calendar') }}
          </button>
        </div>
      </div>
    </transition>
    <transition-group tag="div" name="tutorial__marker" class="tutorial__markers">
      <div
        v-for="{ id, marker } in Object.keys(markers).filter(k => markers[k].visible).map(k => ({ id: k, marker: markers[k] }))"
        :id="`tutorial__marker--${id}`"
        :key="id"
        :class="['tutorial__marker', { 'tutorial__marker--active': activeMarker === id }]"
        :style="{ left: `${marker.position.x}px`, top: `${marker.position.y}px` }"
        :title="$t(`ui.tutorial.hints.${id}.title`)"
        @click="activeMarker = activeMarker === id ? null : id"
      />
    </transition-group>
    <transition name="tutorial__details">
      <div v-if="activeMarker !== null && markers[activeMarker].visible" :key="activeMarker" ref="details" class="tutorial__details">
        <Markdown tag="div" class="tutorial__details-text" :content="$t(`ui.tutorial.hints.${activeMarker}.text`)" inline />
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { createPopper } from '@popperjs/core/lib/popper-lite'
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow'
import flip from '@popperjs/core/lib/modifiers/flip'
import offset from '@popperjs/core/lib/modifiers/offset'
import Markdown from '@/components/Markdown.vue'

export default {
  name: 'Tutorial',
  components: { Markdown },
  data () {
    return {
      markers: {
        'settings-button': {
          visible: false,
          position: { x: 0, y: 0 },
          detailsPlacement: 'bottom-end',
          detailsOffset: [-10, -10],
          isVisible: () => this.openedMenu === null && this.$route.name === 'root',
          getPosition: rect => ({ x: rect.x + rect.height * 0.1, y: rect.y + rect.height * 0.9 })
        },
        'settings-layers': {
          visible: false,
          position: { x: 0, y: 0 },
          isVisible: () => this.openedMenu === 'settings',
          getPosition: rect => ({ x: rect.x + rect.width + 15, y: rect.y + rect.height * 0.5 })
        },
        'settings-filters': {
          visible: false,
          position: { x: 0, y: 0 },
          isVisible: () => this.openedMenu === 'settings',
          getPosition: rect => ({ x: rect.x + rect.width + 15, y: rect.y + rect.height * 0.5 })
        },
        'settings-separate-timelines': {
          visible: false,
          position: { x: 0, y: 0 },
          isVisible: () => this.openedMenu === 'settings',
          getPosition: rect => ({ x: rect.x + rect.width + 15, y: rect.y + rect.height * 0.5 })
        },
        'menu-button': {
          visible: false,
          position: { x: 0, y: 0 },
          detailsPlacement: 'bottom-end',
          detailsOffset: [-10, -10],
          isVisible: () => this.openedMenu === null && this.$route.name === 'root',
          getPosition: rect => ({ x: rect.x + rect.width * 0.1, y: rect.y + rect.height * 0.9 })
        },
        search: {
          visible: false,
          position: { x: 0, y: 0 },
          detailsPlacement: 'bottom-end',
          detailsOffset: [-10, -10],
          isVisible: () => this.openedMenu === null && this.$route.name === 'root',
          getPosition: rect => ({ x: rect.x + rect.width * 0.1, y: rect.y + rect.height * 0.9 })
        },
        timeline: {
          visible: false,
          position: { x: 0, y: 0 },
          isVisible: () => !this.eventActive && this.openedMenu === null && this.$route.name === 'root',
          getPosition: rect => ({ x: rect.x + rect.width * 0.5 + 75, y: rect.y })
        },
        event: {
          visible: false,
          position: { x: 0, y: 0 },
          isVisible: () => this.eventActive && this.$route.name === 'root',
          getPosition: rect => ({ x: rect.x + rect.width - rect.height * 0.1, y: rect.y + rect.height * 0.9 })
        },
        location: {
          visible: false,
          position: { x: 0, y: 0 },
          isVisible: () => this.openedMenu === null && this.$route.name === 'root',
          getPosition: rect => ({ x: rect.x, y: rect.y })
        },
        'measure-button': {
          visible: false,
          position: { x: 0, y: 0 },
          detailsOffset: [-10, -10],
          isVisible: () => !this.eventActive && this.openedMenu === null && this.$route.name === 'root',
          getPosition: rect => ({ x: rect.x + rect.width * 0.1, y: rect.y + rect.height * 0.1 })
        },
        'go-to-date-button': {
          visible: false,
          position: { x: 0, y: 0 },
          detailsOffset: [-10, -10],
          isVisible: () => !this.eventActive && this.openedMenu === null && this.$route.name === 'root',
          getPosition: rect => ({ x: rect.x + rect.width * 0.1, y: rect.y + rect.height * 0.1 })
        }
      },
      activeMarker: null,
      hideWindow: false
    }
  },
  computed: {
    ...mapState(['openedMenu']),
    ...mapState({ eventActive: state => state.activeEvent !== null })
  },
  watch: {
    activeMarker (value) {
      if (value === null) {
        return
      }

      this.$nextTick(() => {
        this.popper = createPopper(document.querySelector(`#tutorial__marker--${value}`), this.$refs.details, {
          placement: this.markers[value].detailsPlacement ?? 'top-start',
          modifiers: [
            {
              ...preventOverflow,
              options: {
                padding: {
                  top: 16,
                  bottom: 16,
                  left: 16,
                  right: 16
                }
              }
            },
            flip,
            {
              ...offset,
              options: {
                offset: this.markers[value].detailsOffset ?? [10, -10]
              }
            }
          ]
        })
      })
    }
  },
  mounted () {
    document.addEventListener('click', this.handleOutsideClick)
    document.addEventListener('touchstart', this.handleOutsideClick)
    this.update()
  },
  destroyed () {
    document.removeEventListener('click', this.handleOutsideClick)
    document.removeEventListener('touchstart', this.handleOutsideClick)
    cancelAnimationFrame(this.lastAnimationRequest)
  },
  methods: {
    dismiss () {
      window.localStorage.tutorialDone = 'true'
      this.$emit('close')
    },
    update () {
      Object.keys(this.markers)
        .forEach((id) => {
          if (this.markers[id].isVisible && !this.markers[id].isVisible()) {
            this.updateMarkerProperty(id, 'visible', false)

            if (this.activeMarker === id) {
              this.activeMarker = null
            }

            return
          }

          const elem = document.querySelector(`[data-tutorial-id="${id}"]`)
          if (elem === null) {
            this.updateMarkerProperty(id, 'visible', false)

            if (this.activeMarker === id) {
              this.activeMarker = null
            }

            return
          }

          this.updateMarkerProperty(id, 'visible', true)
          this.updateMarkerProperty(id, 'position', this.markers[id].getPosition(elem.getBoundingClientRect()))
        })

      if (this.popper !== undefined && this.popper !== null) {
        this.popper.update()
      }

      this.hideWindow = (this.openedMenu !== null && window.innerWidth < 800) || this.$route.name !== 'root'

      this.lastAnimationRequest = requestAnimationFrame(this.update)
    },
    updateMarkerProperty (id, property, value) {
      const currentValue = this.markers[id][property]

      if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
        this.markers[id][property] = value
      }
    },
    handleOutsideClick (e) {
      if (this.$refs.details === undefined || this.$refs.details === null) {
        return
      }

      if (!this.$refs.details.contains(e.target) && !e.target.classList.contains('tutorial__marker')) {
        this.activeMarker = null
        e.stopPropagation()
      }
    }
  }
}
</script>

<style lang="scss">
.tutorial {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: none;

  &-enter-active {
    transition: opacity 0.2s ease-out;
  }

  &-leave-active {
    transition: opacity 0.2s ease-in;
  }

  &-enter, &-leave-to {
    opacity: 0;
  }

  &-enter-to, &-leave {
    opacity: 1;
  }

  $marker-color: #ff4429;

  &__marker {
    position: absolute;
    margin-left: -0.625rem;
    margin-top: -0.625rem;
    width: 1.25rem;
    height: 1.25rem;
    cursor: help;
    pointer-events: auto;
    z-index: 0;
    background: red;
    transform: scale(1);
    border-radius: 100%;
    background: $marker-color;
    box-shadow: 0 0 0 0 rgba($marker-color, 1);
    animation: tutorial__marker 2s infinite;

    &--active {
      z-index: 2;
    }

    &-enter-active {
      transition: opacity 0.2s ease-out;
      transition-delay: 0.2s;
    }

    &-leave-active {
      transition: opacity 0.2s ease-in;
    }

    &-enter, &-leave-to {
      opacity: 0;
    }

    &-enter-to, &-leave {
      opacity: 1;
    }

    @keyframes tutorial__marker {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba($marker-color, 0.7);
      }

      70% {
        transform: scale(1);
        box-shadow: 0 0 0 20px rgba($marker-color, 0);
      }

      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba($marker-color, 0);
      }
    }
  }

  &__details {
    position: absolute;
    bottom: 2.75rem;
    left: 0.625rem;
    max-width: 350px;
    padding: 1rem;
    font-size: 0.9rem;
    cursor: auto;
    z-index: 0;
    pointer-events: auto;
    filter: drop-shadow(0 0.5rem 1rem rgba(0, 0, 0, 0.5));

    &-enter-active {
      transition: opacity 0.2s ease-out;

      .tutorial__details-text {
        transition: transform 0.4s ease-out;
      }
    }

    &-leave-active {
      transition: opacity 0.2s ease-in;

      .tutorial__details-text {
        transition: transform 0.4s ease-in;
      }
    }

    &-enter, &-leave-to {
      opacity: 0;

      .tutorial__details-text {
        transform: translateY(50%);
      }
    }

    &-enter-to, &-leave {
      opacity: 1;

      .tutorial__details-text {
        transform: translateY(0);
      }
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
          0.5rem 0,
          calc(100% - 0.5rem) 0,
          100% 0.5rem,
          100% calc(100% - 0.5rem),
          calc(100% - 0.5rem) 100%,
          0.5rem 100%,
          0 calc(100% - 0.5rem),
          0 0.5rem
      );
    }

    &-text {
      position: relative;
      z-index: 1;
    }
  }

  &__window {
    position: absolute;
    top: 2rem;
    left: 2rem;
    right: 2rem;
    z-index: 0;
    margin: 0;
    padding: 1rem;
    font-size: 14px;
    filter: drop-shadow(0 0.5rem 1rem rgba(0, 0, 0, 0.5));
    max-width: 350px;
    pointer-events: auto;

    @media (max-width: 640px) {
      top: 6rem;
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
      clip-path: polygon(0.5rem 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% calc(100% - 0.5rem), calc(100% - 0.5rem) 100%, 0.5rem 100%, 0 calc(100% - 0.5rem), 0 0.5rem);
    }

    &-text {
      position: relative;
      z-index: 1;

      h2 {
        margin: 0;
      }
    }

    &-buttons {
      text-align: center;
      position: relative;
      z-index: 1;

      button {
        display: inline-block;
        color: inherit;
        text-decoration: none;
        transition: all 0.2s ease-in-out;
        font-size: 1em;
        appearance: none;
        outline: none;
        box-sizing: border-box;
        border: none;
        background-color: transparent;
        background-image: linear-gradient(0deg, #0f3562 0%, #0f3562 100%);
        background-repeat: no-repeat;
        background-size: 100% 0.1em;
        background-position: 50% 100%;
        cursor: pointer;
        padding: 0.125rem 0.25rem;
        margin: 0 0.25rem;

        &:last-child {
          margin-right: 0;
        }

        &:hover, &:active, &:focus {
          color: #f6f8fa;
          background-size: 100% 100%;
        }
      }
    }
  }
}
</style>
