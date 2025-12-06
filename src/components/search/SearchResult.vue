<template>
  <router-link
    class="search-result"
    :to="{ name: details.type, params: { locale: $route.params.locale, id: details.id } }"
    @click.native="$emit('use')"
  >
    <div class="search-result__icon">
      <div
        v-if="image !== undefined"
        :style="image"
        class="search-result__icon-image"
      />

      <img
        v-else
        class="search-result__icon-placeholder"
        src="@/assets/logos/search-placeholder.svg"
        alt=""
      >
    </div>

    <div class="search-result__name">
      {{ $t(`${baseTranslationKey}.name`) }}
    </div>

    <small class="search-result__type">
      {{ $t(`entry-types.${details.type}`) }}
    </small>
  </router-link>
</template>

<script>
import { getEntryImageSrcSet } from '@/utils.js'

export default {
  name: 'SearchResult',
  props: {
    entry: {
      type: String,
      required: true
    }
  },
  computed: {
    details () {
      const [type, id] = this.entry.split('/', 2)
      return this.$store.state.mappings[type][id]
    },
    baseTranslationKey () {
      return `${this.details.type}.${this.details.id}`
    },
    image () {
      let image
      if (this.details.image !== undefined) {
        image = {
          backgroundImage: getEntryImageSrcSet(this.details.image.file, this.$gtag).css
        }

        if (this.details.image.offset !== undefined) {
          image.backgroundPosition = `${this.details.image.offset.x}% ${this.details.image.offset.y}%`
        }

        if (this.details.image.size !== undefined) {
          image.backgroundSize = `${this.details.image.size}%`
        }
      }

      return image
    }
  }
}
</script>

<style lang="scss">
.search-result {
  display: grid;
  justify-items: flex-start;
  padding: 0.25rem;
  margin-right: 1.25rem;
  grid-template-columns: auto 1fr;
  grid-gap: 0 0.5rem;
  text-decoration: none;
  color: inherit;

  &__icon {
    grid-row: 1/span 2;
    grid-column: 1;
    position: relative;
    width: 40px;
    height: 40px;
    clip-path: polygon(
        0.5rem 0,
        calc(100% - 0.5rem) 0,
        100% 0.5rem,
        100% calc(100% - 0.5rem),
        calc(100% - 0.5rem) 100%,
        0.5rem 100%,
        0 calc(100% - 0.5rem),
        0 0.5rem
    );
    transition: all 0.2s ease-in;

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #ffad00;
      opacity: 0;
      transition: opacity 0.2s ease-out;
    }

    &-image, &-placeholder {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      background-color: #0f3562;
      background-repeat: no-repeat;
      background-size: 100%;
      transition: transform 0.2s linear;
    }
  }

  &:hover, &:focus {
    outline: none;

    .search-result__icon {
      transition: all 0.2s ease-out;
      clip-path: polygon(
          0.25rem 0,
          calc(100% - 0.25rem) 0,
          100% 0.25rem,
          100% calc(100% - 0.25rem),
          calc(100% - 0.25rem) 100%,
          0.25rem 100%,
          0 calc(100% - 0.25rem),
          0 0.25rem
      );

      &:after {
        opacity: 0.2;
      }
    }

    .search-result__icon-image,
    .search-result__icon-placeholder {
      transition-duration: 5s;
      transform: scale(2);
    }
  }

  &__name {
    grid-row: 1;
    grid-column: 2;
    font-weight: bold;
    color: inherit;
    .search-result:hover &,
    .search-result:focus & {
      text-decoration: underline;
    }
  }

  &__type {
    grid-row: 2;
    grid-column: 2;
    font-size: 0.8em;
    font-variant: small-caps;
  }
}
</style>
