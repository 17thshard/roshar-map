<template>
  <div :class="['info', { 'info--active': active, 'info--leave-active': leaveActive }]">
    <button data-tutorial-id="menu-button" class="info__button" :title="$t('ui.menu')" @click="open">
      <MenuIcon size="1x" />
    </button>
    <transition name="info__wrapper" @before-leave="leaveActive = true" @after-leave="leaveActive = false">
      <div v-if="active" class="info__wrapper">
        <div :class="['info__bar', { 'info__bar--opaque': scrolled[subPage === null ? 'root' : subPage] === true }]">
          <button :class="['info__back', { 'info__back--active': subPage !== null }]" :title="$t('ui.back')" @click="subPage = null">
            <ChevronLeftIcon />
          </button>
          <button :class="['info__close', { 'info__close--dark': subPage !== null }]" :title="$t('ui.close')" @click="close">
            <XIcon />
          </button>
        </div>
        <Scrollbar
          :class="['info__scroller', 'info__scroller--root', { 'info__scroller--inactive': subPage !== null }]"
          :ops="{
            vuescroll: { wheelScrollDuration: 400 },
            bar: { onlyShowBarOnScroll: false, keepShow: true, background: '#482d00', opacity: 0.5, size: '0.5rem' },
            rail: { size: '0.5rem', gutterOfSide: '0' }
          }"
          @handle-scroll="onScroll(null, $event)"
        >
          <div class="info__content">
            <div class="info__logo" />
            <Markdown :content="$t('ui.welcome')" class="info__text" />
            <nav class="info__menu">
              <a href="#" target="_blank" @click.prevent="subPage = 'about'">{{ $t('ui.about') }}</a>
              <a href="#" target="_blank" @click.prevent="subPage = 'language'">{{ $t('ui.language') }}</a>
              <a href="#" target="_blank" @click.prevent="$emit('open-tutorial')">{{ $t('ui.help') }}</a>
              <a href="https://brandonsanderson.com" target="_blank">Brandon Sanderson</a>
              <a href="https://coppermind.net" target="_blank">The Coppermind</a>
              <a href="#" target="_blank" @click.prevent="subPage = 'credits'">Credits</a>
            </nav>
            <footer class="info__footer">
              <div class="info__credits">
                Map art by Spenser Farnes (Stoneward13)
              </div>
              <div class="info__socials">
                <a class="info__social" href="https://twitter.com/17thShard" target="_blank" title="Twitter">
                  <TwitterIcon />
                </a>
                <a class="info__social" href="https://facebook.com/17thShard/" target="_blank" title="Facebook">
                  <FacebookIcon />
                </a>
                <a class="info__social" href="https://youtube.com/user/17thShard" target="_blank" title="YouTube">
                  <YoutubeIcon />
                </a>
                <a class="info__social" href="https://patreon.com/17thshard" target="_blank" title="Patreon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="feather">
                    <g fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m14.271 4.2796c-3.1967 0-5.7974 2.6004-5.7974 5.7968 0 3.1868 2.6007 5.7795 5.7974 5.7795 3.1868 0 5.7794-2.5927 5.7794-5.7795 0-3.1965-2.5926-5.7968-5.7794-5.7968" />
                      <path d="m3.949 4.2795v15.441h2.8306v-15.441z" />
                    </g>
                  </svg>
                </a>
                <a class="info__social" href="https://github.com/Palanaeum/roshar-map" target="_blank" title="GitHub">
                  <GithubIcon />
                </a>
              </div>

              <img class="info__forum-logo" src="@/assets/17s_logo.png" alt="17th Shard">
            </footer>
          </div>
        </Scrollbar>
        <Scrollbar
          :class="['info__scroller', 'info__scroller--language', { 'info__scroller--active': subPage === 'language' }]"
          :ops="{
            vuescroll: { wheelScrollDuration: 400 },
            bar: { onlyShowBarOnScroll: false, keepShow: true, background: '#482d00', opacity: 0.5, size: '0.5rem' },
            rail: { size: '0.5rem', gutterOfSide: '0' }
          }"
          @handle-scroll="onScroll('language', $event)"
        >
          <div class="info__content">
            <h2>{{ $t('ui.languageHeading') }}</h2>
            <nav class="info__menu">
              <router-link to="/en-US">
                English
              </router-link>
              <router-link to="/es-ES">
                Español
              </router-link>
            </nav>
          </div>
        </Scrollbar>
        <Scrollbar
          :class="['info__scroller', 'info__scroller--about', { 'info__scroller--active': subPage === 'about' }]"
          :ops="{
            vuescroll: { wheelScrollDuration: 400 },
            bar: { onlyShowBarOnScroll: false, keepShow: true, background: '#482d00', opacity: 0.5, size: '0.5rem' },
            rail: { size: '0.5rem', gutterOfSide: '0' }
          }"
          @handle-scroll="onScroll('about', $event)"
        >
          <div class="info__content">
            <h2>{{ $t('ui.about') }}</h2>
            <Markdown :content="$t('ui.aboutText')" class="info__text" />
          </div>
        </Scrollbar>
        <Scrollbar
          :class="['info__scroller', 'info__scroller--credits', { 'info__scroller--active': subPage === 'credits' }]"
          :ops="{
            vuescroll: { wheelScrollDuration: 400 },
            bar: { onlyShowBarOnScroll: false, keepShow: true, background: '#482d00', opacity: 0.5, size: '0.5rem' },
            rail: { size: '0.5rem', gutterOfSide: '0' }
          }"
          @handle-scroll="onScroll('credits', $event)"
        >
          <div class="info__content">
            <h2>Credits</h2>
            <div class="markdown info__text">
              <!-- CREDITS_TEXT -->
            </div>
          </div>
        </Scrollbar>
      </div>
    </transition>
  </div>
</template>

<script>
import Scrollbar from 'vuescroll/dist/vuescroll-native'
import { ChevronLeftIcon, FacebookIcon, GithubIcon, MenuIcon, TwitterIcon, XIcon, YoutubeIcon } from 'vue-feather-icons'
import { mapState } from 'vuex'
import Markdown from '@/components/Markdown.vue'

export default {
  name: 'Info',
  components: { Markdown, TwitterIcon, FacebookIcon, YoutubeIcon, GithubIcon, MenuIcon, XIcon, Scrollbar, ChevronLeftIcon },
  data () {
    return {
      leaveActive: false,
      subPage: null,
      scrolled: {}
    }
  },
  computed: {
    ...mapState({ active: 'infoOpen' })
  },
  methods: {
    open () {
      this.scrolled = {}
      this.subPage = null
      this.$store.commit('openInfo')
      this.$emit('open')
    },
    close () {
      this.$store.commit('closeInfo')
      this.$emit('close')
    },
    onScroll (page, event) {
      this.$set(this.scrolled, page === null ? 'root' : page, event.process > 0)
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
    right: 0;
    left: 0;
    box-sizing: border-box;
    top: 0;
    bottom: 0;
    pointer-events: auto;
    box-shadow: 0 0 2rem rgba(0, 0, 0, 0.5);
    font-size: 1rem;
    overflow: hidden;

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

  &__bar {
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    pointer-events: none;
    background: rgba(#F5ECDA, 0);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    z-index: 65;
    box-sizing: border-box;
    padding: 1rem;
  }

  &__back, &__close {
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    transition: opacity 0.2s ease-in-out, box-shadow 0.2s ease-in-out, color 0.2s ease-in-out, background 0.2s ease-in-out;
    color: #242629;
    z-index: 65;
    opacity: 0;
    pointer-events: none;
    border-radius: 100%;
    background: rgba(#F5ECDA, .0);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    padding: 0.25rem;
    line-height: 1;
    display: flex;

    &--active {
      opacity: 1;
      transition-delay: 0.5s, 0s, 0s, 0s;
      pointer-events: auto;
    }

    &:hover, &:active, &:focus {
      color: #ffad00 !important;
    }
  }

  &__close {
    color: #F5ECDA;
    margin-left: auto;
    opacity: 1;
    pointer-events: auto;

    &--dark {
      color: #242629;
    }
  }

  &__bar--opaque &__close, &__bar--opaque &__back {
    color: #242629;
    background: #F5ECDA;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
  }

  &__scroller {
    position: absolute !important;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    min-height: 0;
    max-height: 100%;
    transition: transform 0.5s ease-in-out;
    transform: translateX(100%);

    &--root {
      transform: translateX(0);
    }

    &--active {
      transform: translateX(0);
    }

    &--inactive {
      transform: translateX(-100%);
    }

    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 60px;
      z-index: 62;
      pointer-events: none;
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
      background: linear-gradient(0deg, rgba(#F5ECDA, 1.0) 0, rgba(#F5ECDA, 0) 100%);
      border-bottom: 1rem solid #F5ECDA;
    }

    &.hasVBar:after {
      opacity: 1;
    }
  }

  .__rail-is-vertical {
    z-index: 61 !important;
  }

  .__panel {
    z-index: 60 !important;
  }

  .__view {
    z-index: 60 !important;
    display: flex;
    align-items: stretch;
    width: auto !important;
  }

  &__content {
    flex-shrink: 0;
    width: 350px;
    max-width: 100%;
    padding-bottom: 2rem;
    background: #F5ECDA url(../assets/paper.png);

    h2 {
      padding: 0 2rem;
      margin: 4rem 0 0;
    }
  }

  &__scroller--root &__content {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
  }

  &__scroller.hasVBar &__content {
    padding-bottom: 3.5rem;
  }

  &__logo {
    position: relative;
    width: 100%;
    padding-bottom: 57%;
    background-color: #1c1d26;
    background-image: url('../assets/roshar_logo.png');
    background-repeat: no-repeat;
    background-size: 90%;
    background-position: 50% 50%;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 14%));
    z-index: 63;
  }

  &__text {
    padding: 0 2rem;
    text-align: justify;
    line-height: 1.75;
  }

  &__scroller--root &__text {
    padding-top: 2rem;
  }

  &__menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 1rem;
    font-size: 1.75rem;
    font-variant: small-caps;

    a {
      color: #242629;
      text-decoration: none;
      margin: 0.5rem 0;
      background-image: linear-gradient(0deg, #242629 0%, #242629 100%);
      background-repeat: no-repeat;
      background-position: 50% 100%;
      background-size: 0 3px;
      transition: background-size 0.2s ease-in-out;

      &:hover, &:active, &:focus, .info__menu-item--active {
        background-size: 100% 3px;
      }
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    padding: 0 1rem;
  }

  &__credits {
    text-align: center;
    margin-bottom: 1rem;
    font-size: 0.8rem;
    color: lighten(#1c1d26, 30%);
  }

  &__socials {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__social {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #0f3562;
    width: 2rem;
    height: 2rem;
    border: 2px solid #0f3562;
    border-radius: 100%;
    transition: all 0.2s ease-in-out;
    margin: 0.25rem 0.5rem;
    background-image: linear-gradient(0deg, #0f3562 0%, #0f3562 100%);
    background-repeat: no-repeat;
    background-size: 100% 0;
    background-position: 50% 100%;

    &:hover, &:focus, &:active {
      color: #f6f8fa;
      background-size: 100% 100%;
    }

    .feather {
      position: relative;
      z-index: 1;
    }
  }

  &__forum-logo {
    width: 10rem;
    max-width: 100%;
    margin-top: 0.5rem
  }
}
</style>
