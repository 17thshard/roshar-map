<template>
  <div :class="['info', { 'info--active': active, 'info--leave-active': leaveActive }]">
    <button class="info__button" title="Menu" @click="active = true">
      <MenuIcon size="1x" />
    </button>
    <transition name="info__wrapper" @before-leave="leaveActive = true" @after-leave="leaveActive = false">
      <div v-if="active" class="info__wrapper">
        <div class="info__logo">
          <button class="info__close" title="Close Menu" @click="active = false">
            <XIcon />
          </button>
        </div>
        <div class="info__content">
          <div class="info__socials">
            <a class="info__social" href="https://github.com/Palanaeum/roshar-map" target="_blank">
              <GithubIcon />
            </a>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { GithubIcon, MenuIcon, XIcon } from 'vue-feather-icons'

export default {
  name: 'Info',
  components: { GithubIcon, MenuIcon, XIcon },
  data () {
    return {
      active: false,
      leaveActive: false
    }
  }
}
</script>

<style lang="scss">
.info {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 60;
  width: 350px;
  max-width: 100%;

  &__button {
    display: flex;
    align-items: center;
    position: absolute;
    right: 2rem;
    top: 2rem;
    font-size: 1rem;
    line-height: 1;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    z-index: 71;
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
  }

  &--active &__button {
    cursor: default !important;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    pointer-events: none;
    opacity: 0;
    transform: scale(0);
  }

  &--active, &--leave-active {
    z-index: 70;
  }

  &__wrapper {
    z-index: 61;
    position: absolute;
    background: #F5ECDA url(../assets/paper.png);
    right: 0;
    left: 0;
    box-sizing: border-box;
    top: 0;
    bottom: 0;
    pointer-events: auto;
    box-shadow: 0 0 2rem rgba(0, 0, 0, 0.5);
    font-size: 14px;

    &-enter-active, &-leave-active {
      transition: clip-path 0.5s ease-in-out, transform 0.5s ease-in-out;
      z-index: 70;
    }

    &-enter, &-leave-to {
      clip-path: circle(1px at calc(100% - 3.25rem) 3.25rem);
    }

    &-enter-to, &-leave {
      clip-path: circle(100vh at calc(100% - 3.25rem) 3.25rem);
    }

    h3 {
      font-family: sans-serif;
      text-transform: uppercase;
      font-size: 0.8em;
      margin: 0;
    }
  }

  &__logo {
    width: 100%;
    padding-bottom: 57%;
    background-color: #1c1d26;
    background-image: url('../assets/roshar_logo.png');
    background-repeat: no-repeat;
    background-size: 90%;
    background-position: 50% 50%;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 14%));
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

  &__content {
    padding: 2rem 1rem 2rem;
  }

  &__socials {
    display: flex;
    justify-content: center;
  }

  &__social {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    color: #0f3562;
    width: 2rem;
    height: 2rem;
    border: 2px solid #0f3562;
    border-radius: 100%;
    transition: all 0.2s ease-in-out;

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      background: #0f3562;
      transform-origin: 0 100%;
      z-index: 0;
      transition: transform 0.2s ease-in-out;
      transform: scaleY(0);
    }

    &:hover, &:focus, &:active {
      color: #f6f8fa;

      &:before {
        transform: scaleY(1);
      }
    }

    .feather {
      position: relative;
      z-index: 1;
    }
  }
}
</style>
