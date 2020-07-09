<template>
  <section :class="['settings', { 'settings--active': active }]">
    <button class="settings__button" @click="active = true">
      <SlidersIcon size="1x" />
      Settings
    </button>
    <transition name="settings__content">
      <div v-if="active" class="settings__content">
        <button class="settings__close" title="Close Settings" @click="active = false">
          <XIcon />
        </button>
        <h3>Filters</h3>
        <ul>
          <li v-for="tag in tags" :key="tag">
            <input type="checkbox" :checked="filter.tags !== null && filter.tags.includes(tag)" @input="toggleTag(tag)"> {{ tag }}
          </li>
        </ul>
      </div>
    </transition>
  </section>
</template>

<script>
import { SlidersIcon, XIcon } from 'vue-feather-icons'
import { mapState } from 'vuex'

export default {
  name: 'Settings',
  components: { SlidersIcon, XIcon },
  data () {
    return {
      active: false
    }
  },
  computed: {
    ...mapState(['events', 'filter']),
    tags () {
      const set = new Set()

      this.events.forEach((event) => {
        event.tags.forEach(t => set.add(t))
      })

      return [...set.values()]
    }
  },
  methods: {
    toggleTag (tag) {
      this.$store.commit('toggleTag', tag)
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
}
</style>
