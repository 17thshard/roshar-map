<template>
  <div id="app" :class="{ 'app--details': details !== null, 'app--sidebar-active': sidebarActive }">
    <router-view
      :transitions="mapTransitions"
      @ready="onReady"
      @error="onError"
    />
    <transition name="details">
      <Details v-if="details !== null" :key="details.id" :details="details" />
    </transition>
    <transition name="scrubber" duration="1500" @after-enter="onScrubberLoaded">
      <Scrubber v-if="ready" />
    </transition>
    <div class="app__actions">
      <Search :open="openedMenu === 'search'" @open="openMenu('search')" @close="closeMenu" />
      <button
        data-tutorial-id="settings-button"
        :class="['app__actions-button', 'app__actions-button--wide', {'app__actions-button--hidden': openedMenu === 'settings'}]"
        @click="openMenu('settings')"
      >
        <SlidersIcon size="1x" />
        {{ $t('ui.settings') }}
      </button>
      <button
        data-tutorial-id="menu-button"
        :class="['app__actions-button', {'app__actions-button--hidden': openedMenu === 'info'}]"
        :title="$t('ui.menu')"
        @click="openMenu('info')"
      >
        <MenuIcon size="1x" />
      </button>
    </div>
    <Info :open="openedMenu === 'info'" @open-tutorial="openTutorial" @close="closeMenu" />
    <Settings :open="openedMenu === 'settings'" @close="closeMenu" />
    <transition name="calendar-guide">
      <CalendarGuide v-if="$store.state.calendarGuideOpen" />
    </transition>
    <transition name="first-visit-window" appear>
      <FirstVisitWindow v-if="ready && firstVisit" @open-tutorial="openTutorial" @close="firstVisit = false" />
    </transition>
    <transition name="tutorial">
      <Tutorial v-if="ready && tutorialActive" @close="tutorialActive = false" />
    </transition>
    <transition name="loading__fade">
      <LoadingIndicator v-if="!ready && !errored" />
    </transition>
    <transition name="loading__fade">
      <ErrorScreen v-if="errored" />
    </transition>
    <transition name="changelog" :duration="{ enter: 1000, leave: 300 }">
      <Changelog v-if="ready && showChangelog" @close="showChangelog = false" />
    </transition>
  </div>
</template>

<script>
import { MenuIcon, SlidersIcon } from 'vue-feather-icons'
import Scrubber from '@/components/Scrubber.vue'
import Settings from '@/components/Settings.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import Info from '@/components/Info.vue'
import Details from '@/components/Details.vue'
import CalendarGuide from '@/components/CalendarGuide.vue'
import Tutorial from '@/components/Tutorial.vue'
import FirstVisitWindow from '@/components/FirstVisitWindow.vue'
import ErrorScreen from '@/components/ErrorScreen.vue'
import Changelog, { VERSION as CHANGELOG_VERSION } from '@/components/Changelog.vue'
import '@/assets/fonts/hebrew.scss'
import Search from '@/components/search/Search.vue'
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'App',
  components: {
    Search,
    ErrorScreen,
    FirstVisitWindow,
    Tutorial,
    CalendarGuide,
    Details,
    Info,
    LoadingIndicator,
    Settings,
    Scrubber,
    MenuIcon,
    SlidersIcon,
    Changelog
  },
  data () {
    return {
      ready: false,
      errored: false,
      mapTransitions: false,
      tutorialActive: window.localStorage.tutorialStarted === 'true' && window.localStorage.tutorialDone !== 'true',
      firstVisit: window.localStorage.tutorialStarted !== 'true' && window.localStorage.tutorialDone !== 'true',
      showChangelog: window.localStorage.changelogVersion !== CHANGELOG_VERSION
    }
  },
  computed: {
    details () {
      if (this.mapTransitions && this.$route.meta.details) {
        const entry = this.$store.state.mappings[this.$route.name][this.$route.params.id]

        return entry !== undefined ? entry : null
      }

      return null
    },
    ...mapState(['openedMenu']),
    sidebarActive () {
      return this.openedMenu === 'settings' || this.openedMenu === 'info'
    }
  },
  watch: {
    '$store.state.activeEvent' (newEvent) {
      if (newEvent === null || this.$route.name === 'root') {
        return
      }

      if (this.$route.name === 'events' && this.$route.params.id === newEvent.id) {
        return
      }

      this.$router.replace(`/${this.$route.params.locale}`)
    },
    details (newDetails) {
      if (newDetails === null) {
        return
      }

      if (newDetails.type === 'events') {
        this.$store.commit('selectEvent', newDetails)
      } else {
        this.$store.commit('unselectEvent')
      }
    }
  },
  mounted () {
    if (window.localStorage.getItem('activeEvent')) {
      this.$store.commit('selectEvent', this.$store.state.mappings.events[localStorage.getItem('activeEvent')])
    }
    if (window.localStorage.getItem('layersActive')) {
      const layersActive = JSON.parse(localStorage.getItem('layersActive'))
      Object.entries(layersActive).forEach(([layer, value]) => {
        this.$store.commit('toggleLayer', { layer, value })
      })
    }
    if (window.localStorage.getItem('filter')) {
      this.$store.commit('updateFilter', JSON.parse(localStorage.getItem('filter')))
    }
  },
  methods: {
    onReady () {
      this.ready = true

      if (this.$gtag) {
        this.$gtag.time({
          name: 'load',
          value: Math.round(performance.now()),
          event_category: 'Map Readiness'
        })
      }
    },
    onError (error) {
      this.errored = true
      // eslint-disable-next-line no-console
      console.error(error)
      if (this.$gtag) {
        this.$gtag.exception({
          description: error.message ?? error,
          fatal: true
        })
      }
    },
    onScrubberLoaded () {
      this.mapTransitions = true
    },
    openTutorial () {
      if (this.$gtag && !this.tutorialActive) {
        this.$gtag.pageview({ page_title: 'Tutorial', page_path: '/tutorial', page_location: '' })
      }

      this.tutorialActive = true
    },
    ...mapMutations(['openMenu', 'closeMenu'])
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap');

body {
  margin: 0;
  padding: 0;
  position: fixed;
  height: 100%;
  width: 100%;
  font-size: 16px;
  background: #002D55;
}

#app {
  font-family: 'Libre Baskerville', 'Hadasim CLM', 'Merriweather', serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;
  height: 100%;
  max-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  color: #242629;
  transition: padding 0.5s ease-in-out;
  box-sizing: border-box;

  &.app--details {
    transition-delay: 0.3s;

    [dir=ltr] & {
      padding-left: 225px;
    }

    [dir=rtl] & {
      padding-right: 225px;
    }
  }

  &.app--sidebar-active {
    transition-delay: 0.1s;

    [dir=ltr] & {
      padding-right: 225px;
    }

    [dir=rtl] & {
      padding-left: 225px;
    }
  }

  .app__actions {
    position: fixed;
    top: 2rem;
    display: flex;
    grid-gap: 1rem;
    max-width: calc(100% - 4rem);
    z-index: 60;

    [dir=ltr] & {
      right: 2rem;
    }

    [dir=rtl] & {
      left: 2rem;
    }

    &-button {
      display: flex;
      align-items: center;
      position: relative;
      font-size: 1rem;
      line-height: 1;
      appearance: none;
      outline: none;
      box-sizing: border-box;
      border: none;
      z-index: 61;
      background: #F5ECDA;
      border-radius: 2rem;
      padding: 0.75rem 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      color: #242629;
      pointer-events: auto;
      box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.5);

      &:hover, &:active, &:focus {
        background: saturate(darken(#F5ECDA, 10%), 5%);
      }

      &--wide {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }

      &--hidden {
        cursor: default !important;
        box-shadow: 0 0 0 rgba(0, 0, 0, 0);
        pointer-events: none;
        opacity: 0;
        transform: scale(0);
      }

      [dir=ltr] & {
        transform-origin: calc(100% - 1rem) 50%;

        &--wide .feather {
          margin-right: 0.5rem;
        }
      }

      [dir=rtl] & {
        transform-origin: 1rem 50%;

        &--wide .feather {
          margin-left: 0.5rem;
        }
      }
    }
  }
}

button {
  font-family: 'Libre Baskerville', serif;
}

.loading__fade {
  &-leave-active {
    transition: opacity 0.5s ease-in;
  }

  &-leave-to {
    opacity: 0;
  }
}

[dir=rtl] .__rail-is-vertical {
  right: auto !important;
  left: 0 !important;
}
</style>
