<template>
  <div :class="['details', { 'details--image': details.image !== undefined }]">
    <div :class="['details__bar', { 'details__bar--visible': showBar }]">
      <h2>{{ $t(`${details.type}s.${details.id}.name`) }}</h2>
      <router-link class="details__close" :title="$t('ui.close')" :to="`/${$route.params.locale}`">
        <XIcon />
      </router-link>
    </div>
    <Scrollbar
      class="details__scroller"
      :ops="{
        vuescroll: { wheelScrollDuration: 400 },
        bar: { background: '#482d00', opacity: 0.5, size: '0.5rem' },
        rail: { size: '0.5rem', gutterOfSide: '0' }
      }"
    >
      <div class="details__content">
        <img v-if="details.image !== undefined" class="details__image" :src="imageUrl" :alt="$t(`${details.type}s.${details.id}.name`)">
        <section class="details__text">
          <div ref="intersectionGuard" class="details__intersection-guard" />
          <h2>{{ $t(`${details.type}s.${details.id}.name`) }}</h2>
          <Markdown :content="$t(`${details.type}s.${details.id}.details`)" tag="article" />
          <a
            v-if="details.coppermind !== undefined"
            :href="`https://coppermind.net/wiki/${details.coppermind}`"
            target="_blank"
            class="details__read-more"
          >
            {{ $t('ui.coppermind') }}
          </a>
        </section>
      </div>
    </Scrollbar>
  </div>
</template>

<script>
import Scrollbar from 'vuescroll/dist/vuescroll-native'
import { XIcon } from 'vue-feather-icons'
import Markdown from '@/components/Markdown.vue'

export default {
  name: 'Details',
  components: { Markdown, XIcon, Scrollbar },
  props: {
    details: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      showBar: false
    }
  },
  computed: {
    imageUrl () {
      return `${process.env.BASE_URL}img/${this.details.type}s/${this.details.image}`
    }
  },
  mounted () {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.showBar = entry.intersectionRatio < 1
        })
      },
      {
        root: this.$el,
        rootMargin: '0px'
      }
    )

    observer.observe(this.$refs.intersectionGuard)
  }
}
</script>

<style lang="scss">
.details {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 60;
  width: 450px;
  max-width: 100%;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.5);
  overflow: hidden;

  &-enter-active {
    transition: transform 0.75s ease-out;

    .details__image {
      transition: opacity 0.5s ease-out;
      transition-delay: 0.3s;
    }
  }

  &-enter {
    transform: translateX(-100%);

    .details__image {
      opacity: 0;
    }

    .details__text {
      opacity: 0;
      transform: translateY(50px);
    }
  }

  &-enter-to {
    transform: translateX(0);

    .details__image {
      opacity: 1;
    }
  }

  &-leave-active {
    transition: transform 0.75s ease-in, opacity 0.75s ease-in;
  }

  &-leave {
    transform: translateX(0);
  }

  &-leave-to {
    transform: translateX(-100%);
  }

  h2 {
    font-size: 2rem;
    font-variant: small-caps;
    margin: 0;
  }

  &__bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 62;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 1rem 1rem 1rem 2rem;
    background: rgba(#F5ECDA, .0);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    pointer-events: none;
    transition: background 0.5s ease-in-out, box-shadow 0.5s ease-in-out;

    h2 {
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
      padding-right: 3rem;
    }

    .details__close {
      margin-left: auto;
      cursor: pointer;
      appearance: none;
      outline: none;
      box-sizing: border-box;
      border: none;
      background: none;
      transition: color 0.2s ease-in-out, opacity 0.5s ease-in-out;
      z-index: 63;
      color: #242629;
      pointer-events: auto;
      height: 24px;

      &:hover, &:active, &:focus {
        color: #ffad00 !important;
      }
    }

    &--visible {
      background: #F5ECDA;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
      pointer-events: auto;

      h2 {
        opacity: 1;
      }

      .details__close {
        color: #242629 !important;
      }
    }
  }

  &__scroller {
    position: relative;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    min-height: 0;
    max-height: 100%;
  }

  &__scroller:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60px;
    z-index: 62;
    pointer-events: none;
    transition: opacity 0.5s ease-in-out;
    opacity: 1;
    background: linear-gradient(0deg, rgba(#F5ECDA, 1.0) 0, rgba(#F5ECDA, 0) 100%);
    border-bottom: 1rem solid #F5ECDA;
  }

  &__content {
    background: #F5ECDA url(../assets/paper.png);
    width: 450px;
    max-width: 100%;
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

  &__image {
    width: 100%;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 14%));
    opacity: 1;
  }

  &__text {
    transition: opacity 1s ease-out, transform 1s ease-out;
    transition-delay: 0.75s, 0.75s;
    max-width: 100%;
    opacity: 1;
    transform: translateY(0);
    position: relative;
    padding: 1rem 2rem 4rem;
    text-align: justify;
    line-height: 1.75;

    h2 {
      margin-bottom: 1.5rem;
      padding-right: 4rem;
      text-align: left;
      line-height: normal;
    }
  }

  &--image {
    .details__close {
      color: #F5ECDA;
    }

    .details__text {
      margin-top: -2rem;
    }
  }

  &__intersection-guard {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
  }

  @mixin diamond($base-color) {
    border-left-color: lighten($base-color, 10%);
    border-top-color: saturate(lighten($base-color, 20%), 10%);
    border-right-color: lighten($base-color, 15%);
    border-bottom-color: $base-color;
  }

  &__read-more {
    display: block;
    text-align: center;
    border: 2px solid #0f3562;
    text-transform: uppercase;
    color: inherit;
    text-decoration: none;
    font-size: 1.25rem;
    padding: 0.75rem 1rem;
    position: relative;
    border-radius: 3px;
    margin: 0 1rem;
    transition: all 0.3s ease-in-out;
    background-image: linear-gradient(0deg, #0f3562 0%, #0f3562 100%);
    background-repeat: no-repeat;
    background-size: 100% 0;
    background-position: 50% 100%;

    &:hover, &:active, &:focus {
      color: #f6f8fa;
      background-size: 100% 100%;
    }
  }
}
</style>
