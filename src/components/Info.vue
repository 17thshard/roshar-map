<template>
  <section :class="['info', { 'info--active': active }]">
    <button class="info__button" title="Menu" @click="active = true">
      <MenuIcon size="1x" />
    </button>
    <transition name="info__content">
      <div v-if="active" class="info__content">
        <div class="info__logo">
          <button class="info__close" title="Close Menu" @click="active = false">
            <XIcon />
          </button>
        </div>
        <h3>Filters</h3>
      </div>
    </transition>
  </section>
</template>

<script>
import { MenuIcon, XIcon } from 'vue-feather-icons'
import { mapState } from 'vuex'

export default {
  name: 'Info',
  components: { MenuIcon, XIcon },
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
.info {
  position: fixed;
  left: 0;
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
    left: 2rem;
    top: 2rem;
    font-size: 1rem;
    line-height: 1;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    z-index: 51;
    background: #F5ECDA;
    border-radius: 2rem;
    padding: 0.75rem 0.75rem;
    cursor: pointer;
    transition: background 0.2s ease-in-out, opacity 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    color: #242629;
    pointer-events: auto;
    box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.5);

    &:hover, &:active, &:focus {
      background: saturate(darken(#F5ECDA, 10%), 5%);
    }
  }

  &__content {
    z-index: 50;
    position: absolute;
    background: #F5ECDA url(../assets/paper.png);
    right: 0;
    left: 0;
    padding: 2rem 1rem 2rem;
    box-sizing: border-box;
    top: 0;
    bottom: 0;
    pointer-events: auto;
    box-shadow: 0 0 2rem rgba(0, 0, 0, 0.5);
    clip-path: circle(100vh at 4rem 3.25rem);
    font-size: 14px;

    &-enter-active, &-leave-active {
      transition: clip-path 0.5s ease-in-out, transform 0.5s ease-in-out;
    }

    &-enter {
      clip-path: circle(1px at 4rem 3.25rem);
    }

    &-enter-to {
      clip-path: circle(100vh at 4rem 3.25rem);
    }

    &-leave-to {
      clip-path: circle(1px at 4rem 3.25rem);
    }

    h3 {
      font-family: sans-serif;
      text-transform: uppercase;
      font-size: 0.8em;
      margin: 0;
    }
  }

  &__logo {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 200px;
    background-color: #1c1d26;
    background-image: url('../assets/roshar_logo.png');
    background-repeat: no-repeat;
    background-size: 90%;
    background-position: 50% 50%;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 50px));
  }

  &__close {
    position: absolute;
    top: 1.5rem;
    right: 1rem;
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    transition: color 0.2s ease-in-out;
    color: #F5ECDA;

    &:hover, &:active, &:focus {
      color: #ffad00;
    }
  }

  &--active {
    z-index: 60;

    .info__button {
      cursor: default !important;
      box-shadow: 0 0 0 rgba(0, 0, 0, 0);
      pointer-events: none;
      opacity: 0;
    }
  }
}
</style>