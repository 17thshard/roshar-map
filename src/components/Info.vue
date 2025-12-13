<template>
  <div :class="['info', { 'info--open': open, 'info--leave-active': leaveActive }]">
    <transition name="info__wrapper" @before-leave="leaveActive = true" @after-leave="leaveActive = false">
      <div v-if="open" class="info__wrapper">
        <div :class="['info__bar', { 'info__bar--opaque': scrolled[subPage === null ? 'root' : subPage] === true }]">
          <button :class="['info__back', { 'info__back--active': subPage !== null }]" :title="$t('ui.back')" @click="subPage = null">
            <ChevronRightIcon v-if="$store.state.flipDirectionalIcons" />
            <ChevronLeftIcon v-else />
          </button>
          <button :class="['info__close', { 'info__close--dark': subPage !== null }]" :title="$t('ui.close')" @click="$emit('close')">
            <XIcon />
          </button>
        </div>
        <Scrollbar
          :class="['info__scroller', 'info__scroller--root', { 'info__scroller--inactive': subPage !== null }]"
          :ops="$store.state.scrollbarOptions"
          @handle-scroll="onScroll(null, $event)"
        >
          <div class="info__content">
            <div class="info__logo" :style="{ backgroundImage: `url('${logo}')` }" />
            <Markdown :content="$t('ui.welcome')" class="info__text" />
            <nav class="info__menu">
              <a href="#" target="_blank" @click.prevent="subPage = 'about'">{{ $t('ui.about') }}</a>
              <a href="#" target="_blank" @click.prevent="subPage = 'language'">{{ $t('ui.language') }}</a>
              <a href="#" target="_blank" @click.prevent="$emit('open-tutorial')">{{ $t('ui.help') }}</a>
              <a v-if="nativeShareSupported" href="#" target="_blank" @click.prevent="shareNatively">{{ $t('sharing.title') }}</a>
              <a href="https://brandonsanderson.com" target="_blank">{{ $t('ui.brandon-sanderson') }}</a>
              <a href="https://coppermind.net" target="_blank">The Coppermind</a>
              <a href="#" target="_blank" @click.prevent="subPage = 'credits'">{{ $t('ui.credits') }}</a>
            </nav>
            <footer class="info__footer">
              <div class="info__credits">
                {{ $t('ui.map-credits') }}
              </div>
              <div class="info__socials">
                <a
                  class="info__social"
                  href="https://discord.gg/nF3gxQCkwk?utm_source=Roshar%20Map&utm_medium=Icon"
                  target="_blank"
                  title="Discord"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="feather">
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      d="M4.334 4.636c1.351-.725 2.852-1.222 4.393-1.268l.205.25c-1.363.399-2.693.925-3.92 1.645-.507.312-1.023.624-1.462 1.029 1.106-.553 2.237-1.079 3.438-1.394.648-.183 1.302-.351 1.972-.428 1.604-.225 3.236-.325 4.85-.144a17.637 17.637 0 0 1 3.395.732 18.596 18.596 0 0 1 2.805 1.201c-.24-.243-.524-.434-.806-.622-1.295-.864-2.741-1.48-4.224-1.94.133-.123.22-.369.441-.33 1.947.124 3.819.886 5.4 2.01.114.074.243.144.291.28a28.333 28.333 0 0 1 2.208 6.201c.414 1.8.652 3.642.678 5.489.005.092.005.192-.06.267-1.05 1.466-2.709 2.417-4.451 2.805a9.254 9.254 0 0 1-1.777.218 81.691 81.691 0 0 1-1.355-1.674c.624-.162 1.215-.427 1.78-.733.74-.434 1.437-.982 1.926-1.694-.701.45-1.434.854-2.216 1.15a18.733 18.733 0 0 1-1.521.556c-.884.282-1.803.434-2.722.543-1.06.115-2.133.08-3.191-.04-1.1-.118-2.177-.395-3.226-.74-.865-.315-1.743-.625-2.524-1.122-.2-.126-.4-.252-.605-.368.309.477.743.856 1.181 1.21a7.55 7.55 0 0 0 2.402 1.2 69.246 69.246 0 0 1-1.182 1.462c-.094.098-.155.282-.323.245a9.398 9.398 0 0 1-2.44-.423c-1.086-.376-2.122-.947-2.937-1.767-.284-.281-.562-.582-.757-.934-.02-3.066.622-6.109 1.651-8.987.369-1.015.784-2.017 1.292-2.97.421-.36.909-.642 1.391-.915m3.583 6.412c-.729.082-1.364.596-1.65 1.262-.462.998-.147 2.308.77 2.935.464.32 1.069.435 1.614.282.599-.147 1.09-.602 1.355-1.15.445-.902.267-2.083-.465-2.785-.43-.4-1.036-.626-1.624-.544m7.376.018c-1.018.19-1.748 1.196-1.735 2.211-.013.8.386 1.615 1.08 2.034.46.294 1.05.356 1.57.2.579-.16 1.05-.61 1.304-1.144.462-.94.23-2.186-.579-2.863a1.994 1.994 0 0 0-1.64-.438z"
                    />
                  </svg>
                </a>
                <a class="info__social" href="https://twitter.com/17thShard" target="_blank" title="Twitter">
                  <TwitterIcon />
                </a>
                <a class="info__social" href="https://facebook.com/17thShard" target="_blank" title="Facebook">
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

              <a href="https://17thshard.com" target="_blank" title="17th Shard Forums">
                <img class="info__forum-logo" src="@/assets/logos/17s.svg" alt="17th Shard">
              </a>

              <template v-if="translatorLogo !== undefined">
                <h3 class="info__translator">
                  {{ $t('ui.translation-by') }}
                </h3>
                <a :href="$t(`meta.translator.url`)" target="_blank" :title="$t(`meta.translator.name`)">
                  <img class="info__translator-logo" :src="translatorLogo" :alt="$t(`meta.translator.name`)">
                </a>
              </template>
            </footer>
          </div>
        </Scrollbar>
        <Scrollbar
          :class="['info__scroller', 'info__scroller--language', { 'info__scroller--active': subPage === 'language' }]"
          :ops="$store.state.scrollbarOptions"
          @handle-scroll="onScroll('language', $event)"
        >
          <div class="info__content">
            <h2>{{ $t('ui.languageHeading') }}</h2>
            <nav class="info__menu">
              <router-link v-for="{ code, name } in availableLanguages" :key="code" :to="`/${code}`">
                {{ name }}
              </router-link>
            </nav>
          </div>
        </Scrollbar>
        <Scrollbar
          :class="['info__scroller', 'info__scroller--about', { 'info__scroller--active': subPage === 'about' }]"
          :ops="$store.state.scrollbarOptions"
          @handle-scroll="onScroll('about', $event)"
        >
          <div class="info__content">
            <h2>{{ $t('ui.about') }}</h2>
            <Markdown :content="$t('ui.aboutText')" class="info__text" />
          </div>
        </Scrollbar>
        <Scrollbar
          :class="['info__scroller', 'info__scroller--credits', { 'info__scroller--active': subPage === 'credits' }]"
          :ops="$store.state.scrollbarOptions"
          @handle-scroll="onScroll('credits', $event)"
        >
          <div class="info__content">
            <h2>{{ $t('ui.credits') }}</h2>
            <div class="markdown info__text" v-html="creditsHtml" />
          </div>
        </Scrollbar>
      </div>
    </transition>
  </div>
</template>

<script>
import Scrollbar from 'vuescroll/dist/vuescroll-native'
import { ChevronLeftIcon, ChevronRightIcon, FacebookIcon, GithubIcon, TwitterIcon, XIcon, YoutubeIcon } from 'vue-feather-icons'
import Markdown from '@/components/Markdown.vue'
import availableLanguages from '@/lang/menu.json'
import creditsHtml from '@generated/credits.js'
import { escapeCssPath } from '@/utils'
import { mapState } from 'vuex'

const logoUrls = import.meta.glob('/src/assets/logos/*', {
  eager: true,
  query: '?url',
  import: 'default'
})

export default {
  name: 'Info',
  components: {
    Markdown,
    TwitterIcon,
    FacebookIcon,
    YoutubeIcon,
    GithubIcon,
    XIcon,
    Scrollbar,
    ChevronLeftIcon,
    ChevronRightIcon
  },
  props: {
    open: Boolean
  },
  data () {
    return {
      availableLanguages,
      leaveActive: false,
      subPage: null,
      scrolled: {},
      nativeShareSupported: navigator.share !== undefined,
      creditsHtml
    }
  },
  computed: {
    logo () {
      const fileName = this.$t('logo')
      const url = logoUrls[`/src/assets/logos/${fileName}`]
      if (!url) {
        // fallback: return empty; UI will just not show the image
        return ''
      }
      return escapeCssPath(url)
    },
    translatorLogo () {
      if (!this.$te('meta.translator.url')) {
        return undefined
      }

      const fileName = this.$t('meta.translator.logo')
      return logoUrls[`/src/assets/logos/${fileName}`]
    },
    ...mapState(['openedMenu'])
  },
  watch: {
    active (value) {
      if (value) {
        this.scrolled = {}
        this.subPage = null
      }
    }
  },
  methods: {
    onScroll (page, event) {
      this.$set(this.scrolled, page === null ? 'root' : page, event.process > 0)
    },
    shareNatively () {
      navigator.share({
        url: import.meta.env.VUE_APP_PUBLIC_URL,
        title: document.title,
        description: this.$t('sharing.global-message')
      })
    }
  }
}
</script>

<style lang="scss">
.info {
  position: fixed;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 60;
  width: 350px;
  max-width: 100%;

  [dir=ltr] & {
    right: 0;
  }

  [dir=rtl] & {
    left: 0;
  }

  &--open, &--leave-active {
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

    [dir=ltr] & {
      &-enter, &-leave-to {
        clip-path: circle(1px at calc(100% - 3.25rem) 3.25rem);
      }

      &-enter-to, &-leave {
        clip-path: circle(100vh at calc(100% - 3.25rem) 3.25rem);
      }
    }

    [dir=rtl] & {
      &-enter, &-leave-to {
        clip-path: circle(1px at 3.25rem 3.25rem);
      }

      &-enter-to, &-leave {
        clip-path: circle(100vh at 3.25rem 3.25rem);
      }
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
    opacity: 1;
    pointer-events: auto;

    [dir=ltr] & {
      margin-left: auto;
    }

    [dir=rtl] & {
      margin-right: auto;
    }

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

    [dir=ltr] & {
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
    }

    [dir=rtl] & {
      transform: translateX(-100%);

      &--root {
        transform: translateX(0);
      }

      &--active {
        transform: translateX(0);
      }

      &--inactive {
        transform: translateX(100%);
      }
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
    background-repeat: no-repeat;
    background-size: 90%;
    background-position: 50% 50%;
    z-index: 63;

    [dir=ltr] & {
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 14%));
    }

    [dir=rtl] & {
      clip-path: polygon(0 0, 100% 0, 100% calc(100% - 14%), 0 100%);
    }
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
    color: color.adjust(#1c1d26, $lightness: 30%);
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

  &__translator-logo {
    max-width: 100%;
    margin-top: 0.5rem
  }
}
</style>
