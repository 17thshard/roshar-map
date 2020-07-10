<template>
  <div id="app" :class="{ 'app--details': $store.state.details !== null }">
    <Map
      :transitions="mapTransitions"
      @ready="onReady"
    />
    <transition name="details">
      <Details v-if="$store.state.details !== null" :key="$store.state.details.title" />
    </transition>
    <Scrubber
      :ready="ready"
      @loaded="onScrubberLoaded"
    />
    <Info />
    <Settings />
    <transition name="loading__fade">
      <LoadingIndicator v-if="!ready" />
    </transition>
  </div>
</template>

<script>
import Map from '@/components/map/Map.vue'
import Scrubber from '@/components/Scrubber.vue'
import Settings from '@/components/Settings.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import Info from '@/components/Info.vue'
import Details from '@/components/Details.vue'

export default {
  name: 'App',
  components: {
    Details,
    Info,
    LoadingIndicator,
    Settings,
    Scrubber,
    Map
  },
  data () {
    return {
      ready: false,
      mapTransitions: false
    }
  },
  methods: {
    onReady () {
      this.ready = true
      this.$store.commit('selectEvent', this.$store.state.events[this.$store.state.events.length - 1])
    },
    onScrubberLoaded () {
      setTimeout(() => {
        this.mapTransitions = true
      }, 1000)
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600&display=swap');

body {
  margin: 0;
  padding: 0;
  position: fixed;
  height: 100%;
  width: 100%;
  font-size: 16px;
}

#app {
  font-family: 'Lora', serif;
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
  transition: padding-left 0.5s ease-in-out;
  box-sizing: border-box;

  &.app--details {
    padding-left: 225px;
    transition-delay: 0.3s;
  }
}

button {
  font-family: 'Lora', serif;
}

.loading__fade {
  &-leave-active {
    transition: opacity 0.5s ease-in;
  }

  &-leave-to {
    opacity: 0;
  }
}
</style>
