<template>
  <div
    :class="[
      'event-card',
      { 'event-card--image': event.image !== undefined, 'event-card--details-visible': $route.name === 'events' }
    ]"
    :data-id="event.id"
  >
    <div class="event-card__content">
      <div
        v-if="event.image !== undefined"
        :style="buildImageStyles(event.image)"
        class="event-card__image"
      />
      <h2 class="event-card__name">
        {{ $t(`events.${event.id}.name`) }}
      </h2>
      <Markdown
        :content="$te(`events.${event.id}.blurb`, 'en') ? $t(`events.${event.id}.blurb`) : ''"
        inline
        class="event-card__text"
      >
        <router-link
          data-tutorial-id="event"
          :to="{ name: 'events', params: { locale: $route.params.locale, id: event.id } }"
          class="event-card__read-more"
        >
          {{ $t('ui.more') }}
        </router-link>
      </Markdown>
    </div>
  </div>
</template>

<script>
import Markdown from '@/components/Markdown.vue'
import { getEntryImageSrcSet } from '@/utils'

export default {
  name: 'EventCard',
  components: { Markdown },
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  computed: {
    imageBaseUrl () {
      return `${import.meta.env.BASE_URL}img`
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
.event-card {
  position: absolute;
  bottom: 100%;
  width: 450px;
  max-width: 90%;
  z-index: 5;
  filter: drop-shadow(0 -0.5rem 1rem rgba(0, 0, 0, 0.5));
  box-sizing: border-box;
  color: #242629;
  transition: all 0.2s ease-in-out;

  @media (max-width: 1920px) {
    font-size: 14px;
  }

  &--details-visible {
    transform: translateY(calc(100% - 2rem))
  }

  &--image {
    .event-card__content {
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
    background: #F5ECDA url(../assets/paper.png);
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
    opacity: 0;
    animation: event-card__image-enter 0.5s ease-out;
    animation-delay: 1.5s;
    animation-fill-mode: forwards;
    background-color: #F5ECDA;
    background-size: 100%;
    background-repeat: no-repeat;

    @keyframes event-card__image-enter {
      0% {
        opacity: 0;
      }

      100% {
        opacity: 1;
      }
    }
  }

  &__name {
    font-size: 1.5em;
    font-weight: 600;
    font-variant: small-caps;
    margin: 0;
    text-align: center;
  }

  &__text {
    text-align: center;
    font-size: 1em;
    padding: 1rem 1rem 2rem;
    line-height: 1.5;
  }

  &__read-more {
    color: inherit;
    font-size: 0.9em;
  }
}
</style>
