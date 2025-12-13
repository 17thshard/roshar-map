<template>
  <div class="changelog" @click.self="dismiss">
    <div class="changelog__window">
      <div class="changelog__window-content">
        <Scrollbar
          :class="['changelog__scroller', { 'changelog__scroller--bottom': scrolledToBottom }]"
          :ops="$store.state.scrollbarOptions"
          @handle-scroll="onScroll"
        >
          <Markdown :content="$t('changelog')" advanced />
        </Scrollbar>
        <Markdown tag="button" :content="$t('ui.dismiss')" inline class="changelog__confirm" @click.native="dismiss" />
      </div>
    </div>
  </div>
</template>

<script>
import Scrollbar from 'vuescroll/dist/vuescroll-native'
import Markdown from '@/components/Markdown.vue'

export const VERSION = 'row-ds'

export default {
  name: 'Changelog',
  components: { Markdown, Scrollbar },
  data () {
    return {
      scrolledToBottom: false
    }
  },
  mounted () {
    document.querySelector('#app').classList.add('changelog__blur')
  },
  destroyed () {
    document.querySelector('#app').classList.remove('changelog__blur')
  },
  methods: {
    dismiss () {
      window.localStorage.changelogVersion = VERSION
      this.$emit('close')
    },
    onScroll (event) {
      this.scrolledToBottom = event.process >= 0.99
    }
  }
}
</script>

<style lang="scss">
@use "sass:math";

.changelog {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  filter: initial !important;
  z-index: 100000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);

  @supports (backdrop-filter: none) {
    backdrop-filter: blur(50px);
    transition: backdrop-filter 1s ease-in-out;
  }

  @supports not (backdrop-filter: none) {
    &__blur > * {
      filter: blur(50px);
      animation: changelog__blur 1s ease-in-out;
    }
  }

  @keyframes changelog__blur {
    0% {
      filter: blur(1px);
    }
    100% {
      filter: blur(50px);
    }
  }

  &-enter-active {
    transition: all 0.5s ease-out;

    .changelog__window {
      transition: all 0.5s ease-out;
      transition-delay: 0.5s;
    }
  }

  &-leave-active {
    transition: all 0.3s ease-in;

    .changelog__window {
      transition: all 0.3s ease-in;
    }
  }

  &-enter, &-leave-to {
    opacity: 0;
    backdrop-filter: blur(0px);

    .changelog__window {
      opacity: 0;
      transform: translateY(-50px);
    }
  }

  &-enter-to, &-leave {
    opacity: 1;
    backdrop-filter: blur(50px);

    .changelog__window {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &__window {
    position: relative;
    display: flex;
    align-items: stretch;
    cursor: initial;
    width: 90%;
    max-width: 700px;
    max-height: calc(min(90%, 800px));
    overflow: hidden;

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

    &-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 1rem;
      position: relative;
      z-index: 1;
    }
  }

  &__scroller {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    min-height: 0;
    flex: 1;
    width: 100%;

    .__panel {
      min-width: 100%;
      height: auto !important;
      z-index: 3;
    }

    .__view {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: auto !important;
      z-index: 3;
      padding-right: 1rem;
    }

    .__rail-is-vertical {
      z-index: 10 !important;
    }

    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 60px;
      z-index: 4;
      pointer-events: none;
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
      background: linear-gradient(0deg, rgba(#F5ECDA, 1.0) 0, rgba(#F5ECDA, 0) 100%);
      border-bottom: 0.25rem solid #F5ECDA;
    }

    &.hasVBar:after {
      opacity: 1;
    }

    &--bottom:after {
      opacity: 0 !important;
    }
  }

  &__video {
    position: relative;
    width: 100%;
    max-width: 600px;
    clip-path: polygon(0.5rem 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% calc(100% - 0.5rem), calc(100% - 0.5rem) 100%, 0.5rem 100%, 0 calc(100% - 0.5rem), 0 0.5rem);

    &-wrapper {
      position: relative;
      padding-bottom: #{math.div(9, 16) * 100%};
    }

    iframe {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
  }

  &__confirm {
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    border-radius: 0.5rem;
    appearance: none;
    border: none;
    background: color.adjust(#0f3562, $lightness: 10%);
    color: #f6f8fa;
    padding: 0.75rem;
    margin: 0.5rem auto;
    cursor: pointer;
    outline: none;
    box-sizing: border-box;
    white-space: nowrap;
    transition: 0.2s ease-in-out background;

    &:hover, &:active, &:focus {
      background: color.adjust(#0f3562, $lightness: 20%);
    }
  }
}
</style>
