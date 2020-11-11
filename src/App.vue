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
    <Info @open="sidebarActive = true" @open-tutorial="tutorialActive = true" @close="sidebarActive = false" />
    <Settings @open="sidebarActive = true" @close="sidebarActive = false" />
    <transition name="calendar-guide">
      <CalendarGuide v-if="$store.state.calendarGuideOpen" />
    </transition>
    <transition name="first-visit-window" appear>
      <FirstVisitWindow v-if="ready && firstVisit" @open-tutorial="tutorialActive = true" @close="firstVisit = false" />
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
  </div>
</template>

<script>
import Scrubber from '@/components/Scrubber.vue'
import Settings from '@/components/Settings.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import Info from '@/components/Info.vue'
import Details from '@/components/Details.vue'
import CalendarGuide from '@/components/CalendarGuide.vue'
import Tutorial from '@/components/Tutorial.vue'
import FirstVisitWindow from '@/components/FirstVisitWindow.vue'
import ErrorScreen from '@/components/ErrorScreen.vue'
import '@/assets/fonts/hebrew.scss'

export default {
  name: 'App',
  components: {
    ErrorScreen,
    FirstVisitWindow,
    Tutorial,
    CalendarGuide,
    Details,
    Info,
    LoadingIndicator,
    Settings,
    Scrubber
  },
  data () {
    return {
      ready: false,
      errored: false,
      mapTransitions: false,
      sidebarActive: false,
      tutorialActive: window.localStorage.tutorialStarted === 'true' && window.localStorage.tutorialDone !== 'true',
      firstVisit: window.localStorage.tutorialStarted !== 'true' && window.localStorage.tutorialDone !== 'true'
    }
  },
  computed: {
    details () {
      if (this.mapTransitions && this.$route.meta.details) {
        const entry = this.$store.state.mappings[this.$route.name][this.$route.params.id]

        return entry !== undefined ? entry : null
      }

      return null
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
    }
  },
  methods: {
    onReady () {
      this.ready = true
    },
    onError (error) {
      this.errored = true
      // eslint-disable-next-line no-console
      console.error(error)
      this.$ga.exception(error.message ?? error)
    },
    onScrubberLoaded () {
      this.mapTransitions = true
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

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
  font-family: 'Libre Baskerville', 'Hadasim CLM', serif;
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
