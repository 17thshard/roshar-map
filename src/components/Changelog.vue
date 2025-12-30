<template>
  <div
    class="changelog"
    @click.self="dismiss"
  >
    <div class="changelog__window">
      <div class="changelog__window-content">
        <CustomScrollbar
          ref="scroller"
          :class="['changelog__scroller', { 'changelog__scroller--bottom': scrolledToBottom }]"
          @scroll="onScroll"
        >
          <Markdown
            :content="$t('changelog')"
            advanced
          />
        </CustomScrollbar>
        <Markdown
          tag="button"
          :content="$t('ui.dismiss')"
          inline
          class="changelog__confirm"
          @click="dismiss"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Markdown from '@/components/Markdown.vue'
import CustomScrollbar from '@/components/CustomScrollbar.vue'

export const VERSION = 'row-ds'

export default {
  name: 'Changelog',
  components: { Markdown, CustomScrollbar },
  emits: ['close'],
  data () {
    return {
      scrolledToBottom: false
    }
  },
  mounted () {
    document.querySelector('#app').classList.add('changelog__blur')
  },
  unmounted () {
    document.querySelector('#app').classList.remove('changelog__blur')
  },
  methods: {
    dismiss () {
      window.localStorage.changelogVersion = VERSION
      this.$emit('close')
    },
    onScroll (event) {
      const element = event.target
      const threshold = 0.01
      const scrollPercentage = (element.scrollTop + element.clientHeight) / element.scrollHeight
      this.scrolledToBottom = scrollPercentage >= (1 - threshold)
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

  &-enter-from, &-leave-to {
    opacity: 0;
    backdrop-filter: blur(0px);

    .changelog__window {
      opacity: 0;
      transform: translateY(-50px);
    }
  }

  &-enter-to, &-leave-from {
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
    overflow-y: auto;
    overflow-x: hidden;


    [dir=rtl] & {
      direction: rtl;
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

    &:not(&--bottom):after {
      opacity: 1;
    }

    &--bottom:after {
      opacity: 0 !important;
    }

    > * {
      padding-right: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
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
