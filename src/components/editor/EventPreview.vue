<template>
  <div
    :class="[
      'event-preview',
      { 'event-preview--image': event.image !== undefined, 'event-preview--details-visible': $store.state.details !== null }
    ]"
  >
    <div class="event-preview__content">
      <div
        v-if="event.image !== undefined"
        :style="buildImageStyles(event.image)"
        class="event-preview__image"
      />
      <h2 class="event-preview__name">
        {{ displayName }}
      </h2>
      <Markdown class="event-preview__text" :content="displayBlurb" :inline="true">
        <span v-if="event.details === true">Read more</span>
      </Markdown>
    </div>
  </div>
</template>

<script>
import Markdown from '@/components/Markdown.vue'
import { getEntryImageSrcSet } from '@/utils'

export default {
  name: 'EventPreview',
  components: { Markdown },
  props: {
    event: {
      type: Object,
      required: true
    },
    selectedLanguage: {
      type: [String, null],
      required: false,
      default: () => null
    },
    languages: {
      type: Object,
      required: true
    }
  },
  computed: {
    imageBaseUrl () {
      return `${import.meta.env.BASE_URL}img`
    },
    selectedMessages () {
      return this.selectedLanguage !== null ? this.languages[this.selectedLanguage] : null
    },
    displayName () {
      return this.selectedMessages?.events?.[this.event.id]?.name ?? this.event.id
    },
    displayBlurb () {
      return this.selectedMessages?.events?.[this.event.id]?.blurb ?? ''
    }
  },
  methods: {
    buildImageStyles (image) {
      const styles = {
        backgroundImage: getEntryImageSrcSet(image.file, this.$gtag).css
      }

      if (image.offset !== undefined) {
        styles.backgroundPosition = `${image.offset.x}% ${image.offset.y}%`
      }

      if (image.size !== undefined) {
        styles.backgroundSize = `${image.size}%`
      }

      return styles
    }
  }
}
</script>

<style lang="scss">
.event-preview {
  position: absolute;
  bottom: 0;
  left: 50%;
  z-index: 10;
  margin-left: -200px;
  width: 400px;
  max-width: 90%;
  filter: drop-shadow(0 -0.5rem 1rem rgba(0, 0, 0, 0.5));
  box-sizing: border-box;
  color: #242629;
  transition: all 0.2s ease-in-out;
  opacity: 1;
  font-family: 'Libre Baskerville', serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  &--details-visible {
    opacity: 0;
  }

  &--image {
    .event-preview__content {
      padding-top: 4rem;
    }
  }

  &:before {
    content: '';
    position: absolute;
    box-sizing: border-box;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #F5ECDA url(../../assets/paper.png);
    clip-path: polygon(
        1rem 0,
        calc(100% - 1rem) 0,
        100% 1rem,
        100% 100%,
        100% 100%,
        0 100%,
        0 100%,
        0 1rem
    );
  }

  &-enter-active {
    transition: transform 0.5s ease-out;
    transition-delay: 1.2s;
  }

  &-leave-active {
    transition: transform 0.5s ease-in;
  }

  &-enter, &-leave-to {
    transform: translateY(calc(100% + 2rem));
  }

  &__content {
    position: relative;
    z-index: 6;
    padding: 1rem 0;
  }

  &__image {
    position: absolute;
    width: 120px;
    height: 120px;
    top: -60px;
    left: 50%;
    margin-left: -60px;
    border-radius: 100%;
    border: 4px solid #F5ECDA;
    box-sizing: border-box;
    background-size: 100%;
  }

  &__name {
    font-size: 1.5rem;
    font-weight: 600;
    font-variant: small-caps;
    margin: 0;
    text-align: center;
  }

  &__text {
    text-align: center;
    font-size: 1rem;
    padding: 0.5rem 0.5rem 2rem;
  }
}
</style>
