<template>
  <div :class="['details', { 'details--image': details.image !== undefined }]">
    <router-link
      :class="['details__close', { 'details__close--opaque': reachedHeading }]"
      :title="$t('ui.close')"
      :to="`/${$route.params.locale}`"
    >
      <VueFeather type="x" />
    </router-link>
    <CustomScrollbar
      ref="scroller"
      class="details__scroller"
    >
      <div class="details__content">
        <figure v-if="details.image !== undefined" class="details__image">
          <div
            class="details__image-art"
            :style="{
              backgroundImage: imageSrcSet.css,
              paddingBottom: `${(imageAspect * 100).toFixed(3)}%`,
              backgroundSize: `${width}px auto`
            }"
          />
          <Markdown :content="imageCredits" tag="figcaption" inline />
        </figure>
        <section class="details__text">
          <div ref="intersectionGuard" class="details__intersection-guard" />
          <h2 ref="title" class="details__title">
            {{ $t(`${baseTranslationKey}.name`) }}
          </h2>
          <ul v-if="Object.keys(metadata).length > 0" class="details__metadata">
            <li v-if="metadata.date">
              <VueFeather type="calendar" :aria-label="$t(`ui.date`)" class="details__metadata-icon" :size="16" />
              {{ metadata.date }}
              <button class="details__date-help" :title="$t('ui.date-help')" @click="store.openCalendarGuide()">
                <VueFeather type="help-circle" :size="16" />
              </button>
            </li>
            <li v-if="metadata.chapter">
              <VueFeather type="book" :aria-label="$t(`ui.chapter`)" class="details__metadata-icon" :size="16" />
              <Markdown tag="span" :content="metadata.chapter" inline />
            </li>
          </ul>
          <Markdown :content="text" tag="article" />
          <a
            v-if="details.coppermind !== undefined"
            :href="`https://coppermind.net/wiki/${details.coppermind}`"
            target="_blank"
            class="details__read-more"
          >
            {{ $t('ui.coppermind') }}
          </a>
        </section>
        <section v-if="anyRelated" class="details__related">
          <h3>{{ $t('ui.related') }}</h3>
          <div
            v-for="type in ['events', 'locations', 'characters', 'misc'].filter(t => related[t] !== undefined && related[t].length > 0)"
            :key="type"
            class="details__related-group"
          >
            <h4 class="details__related-group-title">
              {{ $t(`entry-types.${type}`) }}
            </h4>
            <router-link
              v-for="link in related[type]"
              :key="link.translationKey"
              :to="{ name: type, params: { locale: $route.params.locale, id: link.id } }"
              class="details__related-link"
            >
              <div class="details__related-link-icon">
                <div
                  v-if="link.image !== undefined"
                  :style="link.image"
                  :title="$t(link.translationKey)"
                  class="details__related-link-image"
                />
                <img v-else class="details__related-link-placeholder" src="@/assets/logos/knight-radiant-ancient.svg" alt="A logo of the knights radiant" aria-hidden="true" />
              </div>
              {{ $t(link.translationKey) }}
            </router-link>
          </div>
        </section>
        <section class="details__share">
          <h3>{{ $t('ui.share') }}</h3>
          <a
            class="share-button share-button--tumblr"
            :href="tumblrShareUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="$t('sharing.tumblr.button-text')"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="tumblrLogo" alt="" aria-hidden="true">
            </span>
            <span class="share-button__text">{{ $t('sharing.tumblr.button-text') }}</span>
          </a>
          <a
            class="share-button share-button--reddit"
            :href="redditShareUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="$t('sharing.reddit.button-text')"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="redditLogo" alt="" aria-hidden="true">
            </span>
            <span class="share-button__text">{{ $t('sharing.reddit.button-text') }}</span>
          </a>
          <a
            class="share-button share-button--twitter"
            :href="twitterShareUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="$t('sharing.twitter.button-text')"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="xLogo" alt="" aria-hidden="true">
            </span>
            <span class="share-button__text">{{ $t('sharing.twitter.button-text') }}</span>
          </a>
          <a
            href="#"
            role="button"
            class="share-button share-button--instagram"
            :aria-label="$t('sharing.instagram.button-text')"
            @click.prevent="shareInstagram"
            @keydown.enter.prevent="shareInstagram"
            @keydown.space.prevent="shareInstagram"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="instagramLogo" alt="" aria-hidden="true">
            </span>
            <span class="share-button__text">{{ $t('sharing.instagram.button-text') }}</span>
          </a>
          <a
            class="share-button share-button--facebook"
            :href="facebookShareUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="$t('sharing.facebook.button-text')"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="facebookLogo" alt="" aria-hidden="true">
            </span>
            <span class="share-button__text">{{ $t('sharing.facebook.button-text') }}</span>
          </a>
          <a
            href="#"
            role="button"
            class="share-button share-button--general"
            :aria-label="$t('sharing.general.button-text')"
            @click.prevent="shareGenerally"
            @keydown.enter.prevent="shareGenerally"
            @keydown.space.prevent="shareGenerally"
          >
            <span class="share-button__icon" aria-hidden="true">
              <img class="share-button__icon-img" :src="shareLogo" alt="" aria-hidden="true">
            </span>
            <span class="share-button__text">
              {{ generalShareLabel }}
            </span>
          </a>
        </section>
      </div>
    </CustomScrollbar>
  </div>
</template>

<script>
import VueFeather from 'vue-feather'
import Markdown from '@/components/Markdown.vue'
import CustomScrollbar from '@/components/CustomScrollbar.vue'
import { formatDate, getEntryImageSrcSet, compareEvents } from '@/utils'
import xLogo from '@/assets/logos/x.svg'
import instagramLogo from '@/assets/logos/instagram.svg'
import facebookLogo from '@/assets/logos/facebook.svg'
import redditLogo from '@/assets/logos/reddit.svg'
import tumblrLogo from '@/assets/logos/tumblr.svg'
import shareLogo from '@/assets/logos/share-svgrepo-com.svg'
import { useMainStore } from '@/stores/main'

export default {
  name: 'Details',
  components: {
    VueFeather,
    Markdown,
    CustomScrollbar
  },
  setup () {
    const store = useMainStore()
    return { store }
  },
  props: {
    details: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      reachedHeading: false,
      imageAspect: 1,
      width: 1,
      nativeShareSupported: navigator.share !== undefined,
      shareCopied: false,
      shareCopiedTimeout: null,
      xLogo,
      instagramLogo,
      facebookLogo,
      redditLogo,
      tumblrLogo,
      shareLogo
    }
  },
  computed: {
    imageSrcSet () {
      return this.details.image !== undefined ? getEntryImageSrcSet(this.details.image.file, this.$gtag || undefined) : undefined
    },
    imageUrl () {
      return this.imageSrcSet !== undefined ? this.imageSrcSet.sources[0].url : undefined
    },
    imageCredits () {
      return this.details.image?.credits === undefined
        ? 'Credits have to be set!'
        : this.$t('ui.image-credits', { credits: this.details.image.credits })
    },
    baseTranslationKey () {
      return `${this.details.type}.${this.details.id}`
    },
    shareUrl () {
      return window.location.href
    },
    shareTitle () {
      return this.$t(`${this.baseTranslationKey}.name`)
    },
    generalShareLabel () {
      return this.shareCopied ? this.$t('sharing.general.copied') : this.$t('sharing.general.button-text')
    },
    twitterShareUrl () {
      const text = this.$t('sharing.twitter.entry-template', { entry: this.shareTitle })
      const url = encodeURIComponent(this.shareUrl)
      return `https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(text)}`
    },
    facebookShareUrl () {
      const url = encodeURIComponent(this.shareUrl)
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`
    },
    redditShareUrl () {
      const title = this.$t('sharing.reddit.entry-template', { entry: this.shareTitle })
      const url = encodeURIComponent(this.shareUrl)
      return `https://www.reddit.com/submit?url=${url}&title=${encodeURIComponent(title)}`
    },
    tumblrShareUrl () {
      const caption = this.$t('sharing.tumblr.entry-template', { entry: this.shareTitle })
      const url = encodeURIComponent(this.shareUrl)
      return `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&caption=${encodeURIComponent(caption)}`
    },
    metadata () {
      const result = {}

      if (this.details.date) {
        result.date = formatDate(this.details.date)
      }

      if (this.$te(`${this.baseTranslationKey}.chapter`, this.$i18n.fallbackLocale)) {
        result.chapter = this.$t(`${this.baseTranslationKey}.chapter`)
      }

      return result
    },
    text () {
      // Fall back from translated details to translated blurb to English details to English blurb
      if (this.$te(`${this.baseTranslationKey}.details`)) {
        return this.$t(`${this.baseTranslationKey}.details`)
      }

      if (this.$te(`${this.baseTranslationKey}.blurb`)) {
        return this.$t(`${this.baseTranslationKey}.blurb`)
      }

      if (this.$te(`${this.baseTranslationKey}.details`, this.$i18n.fallbackLocale)) {
        return this.$t(`${this.baseTranslationKey}.details`)
      }

      return this.$t(`${this.baseTranslationKey}.blurb`)
    },
    anyRelated () {
      return Object.keys(this.related).length > 0
    },
    related () {
      if (this.details.related === undefined) {
        return []
      }

      const result = this.details.related.map((link) => {
        const [type, id] = link.split('/', 2)
        const linkDetails = this.store.mappings[type][id]

        if (linkDetails === undefined) {
          return {
            translationKey: 'unknown-entry',
            url: link
          }
        }

        let image
        if (linkDetails.image !== undefined) {
          image = {
            backgroundImage: getEntryImageSrcSet(linkDetails.image.file, this.$gtag || undefined).css
          }

          if (linkDetails.image.offset !== undefined) {
            image.backgroundPosition = `${linkDetails.image.offset.x}% ${linkDetails.image.offset.y}%`
          }

          if (linkDetails.image.size !== undefined) {
            image.backgroundSize = `${linkDetails.image.size}%`
          }
        }

        return {
          type,
          id,
          translationKey: `${type}.${id}.name`,
          image,
          date: linkDetails.date,
          tieBreaker: linkDetails.tieBreaker
        }
      }).reduce((acc, relatedItem) => {
        acc[relatedItem.type] = [...(acc[relatedItem.type] ?? []), relatedItem]
        return acc
      }, {})

      Object.keys(result).forEach((type) => {
        if (type === 'events') {
          result[type].sort(compareEvents)
        } else {
          result[type].sort((a, b) => this.$t(a.translationKey).localeCompare(this.$t(b.translationKey), this.$i18n.locale))
        }
      })

      return result
    }
  },
  watch: {
    imageUrl: {
      handler (newUrl) {
        if (newUrl !== undefined) {
          const image = new Image()
          image.src = newUrl

          image.onload = () => {
            this.imageAspect = image.height / image.width
            const actualHeight = this.imageAspect * this.$el.clientWidth

            if (actualHeight >= window.innerHeight) {
              const instance = this.$refs.scroller?.osInstance()
              if (instance) {
                const { viewport } = instance.elements()
                viewport.scrollTop = actualHeight * 0.5
              }
            }
          }
        }
      },
      immediate: true
    }
  },
  mounted () {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.reachedHeading = entry.intersectionRatio < 1
        })
      },
      {
        root: this.$el,
        rootMargin: '0px'
      }
    )

    observer.observe(this.$refs.intersectionGuard)

    window.addEventListener('resize', this.onResize)
    this.onResize()
  },
  destroyed () {
    window.removeEventListener('resize', this.onResize)
    if (this.shareCopiedTimeout !== null) {
      window.clearTimeout(this.shareCopiedTimeout)
      this.shareCopiedTimeout = null
    }
  },
  methods: {
    onResize () {
      this.width = this.$el.clientWidth
    },
    async copyToClipboard (text) {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const el = document.createElement('textarea')
          el.value = text
          el.setAttribute('readonly', '')
          el.style.position = 'fixed'
          el.style.left = '-9999px'
          document.body.appendChild(el)
          el.select()
          document.execCommand('copy')
          document.body.removeChild(el)
        }

        this.shareCopied = true
        if (this.shareCopiedTimeout !== null) {
          window.clearTimeout(this.shareCopiedTimeout)
        }
        this.shareCopiedTimeout = window.setTimeout(() => {
          this.shareCopied = false
          this.shareCopiedTimeout = null
        }, 1500)
      } catch (e) {
        // ignore copy failures (e.g., permissions)
      }
    },
    async shareGenerally () {
      const url = this.shareUrl
      const title = this.shareTitle
      const text = this.$t('sharing.general.entry-template', { entry: title })

      if (this.nativeShareSupported) {
        try {
          await navigator.share({ title, text, url })
          return
        } catch (e) {
          // User cancellation or unsupported payload; fall through to copy
        }
      }

      await this.copyToClipboard(url)
    },
    async shareInstagram () {
      // Instagram doesn't provide a reliable web "share intent" URL.
      // Best-effort: try native share (mobile), otherwise copy the link and open Instagram.
      const url = this.shareUrl
      const title = this.shareTitle
      const text = this.$t('sharing.instagram.entry-template', { entry: title })

      if (this.nativeShareSupported) {
        try {
          await navigator.share({ title, text, url })
          return
        } catch (e) {
          // fall through to copy + open
        }
      }

      await this.copyToClipboard(url)
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    }
  }
}
</script>

<style lang="scss">
.details {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 80;
  width: 500px;
  max-width: 100%;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.5);
  overflow: hidden;

  [dir=ltr] & {
    left: 0;

    &-enter-from {
      transform: translateX(-100%);
    }

    &-leave-to {
      transform: translateX(-100%);
    }
  }

  [dir=rtl] & {
    right: 0;

    &-enter-from {
      transform: translateX(100%);
    }

    &-leave-to {
      transform: translateX(100%);
    }
  }

  &-enter-active {
    transition: transform 0.75s ease-out;

    .details__image {
      transition: opacity 0.5s ease-out;
      transition-delay: 0.3s;
    }
  }

  &-enter-from {
    .details__image {
      opacity: 0;
    }

    .details__text, .details__share, .details__related {
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

  &-leave-from {
    transform: translateX(0);
  }

  .details__close {
    position: absolute;
    top: 1rem;
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    transition: color 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.5s ease-in-out;
    z-index: 63;
    color: #242629;
    pointer-events: auto;
    border-radius: 100%;
    background: rgba(#F5ECDA, .0);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
    padding: 0.25rem;
    line-height: 1;
    display: flex;

    [dir=ltr] & {
      right: 1rem;
      margin-left: auto;
    }

    [dir=rtl] & {
      left: 1rem;
      margin-right: auto;
    }

    &:hover, &:active, &:focus {
      color: #ffad00 !important;
    }

    &--opaque {
      color: #242629 !important;
      background: #F5ECDA;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    }
  }

  &__scroller {
    position: relative;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    min-height: 0;
    height: 100%;

    [dir=rtl] & {
      direction: rtl;
    }
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
    width: 500px;
    max-width: 100%;
    padding-bottom: 4rem;
    min-height: 100%;
    box-sizing: border-box;

    @media (max-width: 1920px) {
      font-size: 14px;
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

  &__image {
    position: relative;
    width: 100%;
    opacity: 1;
    margin: 0;
    padding: 0;

    &-art {
      position: relative;
      max-width: 100%;
      background-color: #0f3562;
      background-attachment: fixed;

      [dir=ltr] & {
        clip-path: polygon(0 0, 100% 0, 100% calc(100% - 2rem), 0 100%);
      }

      [dir=rtl] & {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 2rem));
        background-position-x: right;
      }
    }

    img {
      position: absolute;
      z-index: 1;
      width: 100%;
      background-repeat: no-repeat;
    }

    figcaption {
      max-width: 50%;
      z-index: 2;
      text-align: end;
      font-size: 0.8rem;
      color: color.adjust(#1c1d26, $lightness: 30%);
      margin-top: -0.75rem;

      [dir=ltr] & {
        margin-left: auto;
        padding-right: 2rem;
      }

      [dir=rtl] & {
        margin-right: auto;
        padding-left: 2rem;
      }
    }
  }

  &__metadata {
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    padding: 0;
    margin: 0.5rem -0.25rem;
    line-height: 1;
    font-size: 0.9em;

    li {
      display: flex;
      align-items: center;
      margin: 0.25rem;

      &:after {
        content: '◆';
        font-size: 0.8em;
        opacity: 0.7;

        [dir=ltr] & {
          margin: 0 0 0.125rem 0.4rem;
        }

        [dir=rtl] & {
          margin: 0 0.4rem 0.125rem 0;
        }
      }

      &:last-child:after {
        display: none;
      }
    }

    &-icon {
      flex-shrink: 0;

      [dir=ltr] & {
        margin-right: 0.25rem;
      }

      [dir=rtl] & {
        margin-left: 0.25rem;
      }
    }
  }

  &__date-help {
    display: flex;
    align-items: center;
    padding: 0;
    overflow: hidden;
    white-space: nowrap;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    font-size: 1em;

    [dir=ltr] & {
      margin: 0 0 0 0.25rem;
    }

    [dir=rtl] & {
      margin: 0 0.25rem 0 0;
    }

    &:hover {
      color: #0f3562;
    }
  }

  &__text {
    transition: opacity 1s ease-out, transform 1s ease-out;
    transition-delay: 0.75s, 0.75s;
    max-width: 100%;
    opacity: 1;
    transform: translateY(0);
    position: relative;
    padding: 2rem 3rem 1rem;
    text-align: justify;
    line-height: 1.9;
  }

  &__title {
    font-variant: small-caps;
    font-size: 2em;
    margin: 0;
    line-height: normal;
    text-align: start;
  }

  &__read-more {
    display: block;
    text-align: center;
    border: 2px solid #0f3562;
    text-transform: uppercase;
    color: inherit;
    text-decoration: none;
    font-size: 1.2em;
    padding: 0.75rem 1rem;
    position: relative;
    border-radius: 3px;
    margin: 0 1rem;
    transition: all 0.3s ease-in-out;
    background-image: linear-gradient(0deg, #0f3562 0%, #0f3562 100%);
    background-repeat: no-repeat;
    background-size: 100% 0 !important;
    background-position: 50% 100%;

    &:hover, &:active, &:focus {
      color: #f6f8fa;
      background-size: 100% 100% !important;
    }
  }

  &__share, &__related {
    transition: opacity 1s ease-out, transform 1s ease-out;
    transition-delay: 0.75s, 0.75s;
    max-width: 100%;
    opacity: 1;
    transform: translateY(0);
    padding: 1rem 2.5rem;

    h3 {
      font-size: 1.3em;
      width: 100%;
      flex-grow: 1;
      padding: 0 0.5rem;
      font-weight: 600;
      margin: 0 0 1rem;
    }
  }

  &__share {
    text-align: center;

    h3 {
      text-align: left;
      margin-bottom: 0.5rem;
    }

    .share-button, &-more-button {
      &__icon {
        width: 1rem;
        height: 1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        .share-button__icon-img {
          display: block;
          width: 1rem;
          height: 1rem;
          // Logos are black in the SVG source; invert to display as white.
          filter: brightness(0) invert(1);
        }

        [dir=ltr] & {
          margin-right: 0.4rem;
        }

        [dir=rtl] & {
          margin-left: 0.4rem;
        }
      }

      &__text {
        font-size: 1em;
        margin-left: 0;
      }
    }

    .share-button {
      $focus-color: hsla(215, 5%, 54%, 0.4);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      height: 28px;
      padding: 0 0.5rem;
      margin: 4px;
      border-radius: 4px;
      text-decoration: none;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-weight: 400;
      line-height: 1;
      user-select: none;
      transition: filter 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      border: none;
      box-shadow: none;
      appearance: none;
      -webkit-appearance: none;
      background-image: none;
      text-rendering: auto;
      text-indent: 0;
      text-align: center;
      letter-spacing: normal;
      word-spacing: normal;
      text-shadow: none;

      svg {
        display: block;
      }

      &:not(:disabled):not(.disabled) {
        cursor: pointer;
      }

      &:focus {
        outline: none;
      }

      &:focus-visible {
        box-shadow: 0 0 0 3px $focus-color;
      }

      &:hover {
        filter: brightness(0.92);
      }

      &:active {
        filter: brightness(0.86);
      }

      @media (max-width: 768px) {
        margin: 2px;
      }
    }

    .share-button--twitter {
      background-color: #000000;
    }

    .share-button--facebook {
      background-color: #0866FF;
    }

    .share-button--reddit {
      background-color: #FF4500;
    }

    .share-button--tumblr {
      background-color: #36465d;
    }

    .share-button--instagram {
      background-color: #FF0069;
    }

    .share-button--general {
      background-color: hsl(214, 5%, 29%);
    }

    &-more-button {
      $main-color: hsl(214, 5%, 29%);
      $focus-color: hsla(215, 5%, 54%, 0.4);
      $hover-color: hsla(215, 5%, 29%, 0.9);
      $painted-color: hsla(214, 4%, 19%, 1);
      display: inline-block;
      min-height: 28px;
      padding: 0.35rem 0.5rem;
      margin: 4px;
      color: #fff;
      background-color: $main-color;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-weight: 400;
      vertical-align: top;
      user-select: none;
      border: none;
      border-radius: 4px;
      box-shadow: none;
      text-rendering: auto;
      text-indent: 0;
      text-align: center;
      letter-spacing: normal;
      word-spacing: normal;
      text-shadow: none;
      transition: color 0.3s ease-in-out, background-color 0.3s ease-in-out, border-color 0.3s ease-in-out;

      &:disabled {
        opacity: 0.9;
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px $focus-color;
      }

      &:hover {
        background-color: $hover-color;
      }

      &:not(:disabled):not(.disabled) {
        cursor: pointer;
      }

      &:last-child {
        margin-right: 0;
      }

      @media (max-width: 768px) {
        margin: 2px;
      }
    }
  }

  &__related {
    &-group {
      display: flex;
      flex-wrap: wrap;
      max-width: 100%;
      margin-bottom: 0.5rem;

      &-title {
        text-transform: uppercase;
        font-size: 0.7em;
        flex-grow: 1;
        margin: 0.25rem 0.5rem;
        width: 100%;
      }
    }

    &-link {
      text-align: center;
      font-size: 1em;
      width: 115px;
      max-width: 100%;
      margin: 0.5rem;
      word-wrap: break-word;
      text-decoration: none;
      color: inherit;

      &-icon {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
        clip-path: polygon(
            2rem 0,
            calc(100% - 2rem) 0,
            100% 2rem,
            100% calc(100% - 2rem),
            calc(100% - 2rem) 100%,
            2rem 100%,
            0 calc(100% - 2rem),
            0 2rem
        );
        transition: all 0.2s ease-in;
        margin-bottom: 0.5rem;

        &:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #ffad00;
          opacity: 0;
        }
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

      &:hover, &:active, &:focus {
        .details__related-link-icon {
          transition: all 0.2s ease-out;
          clip-path: polygon(
              1rem 0,
              calc(100% - 1rem) 0,
              100% 1rem,
              100% calc(100% - 1rem),
              calc(100% - 1rem) 100%,
              1rem 100%,
              0 calc(100% - 1rem),
              0 1rem
          );

          &:after {
            opacity: 0.2;
          }
        }

        .details__related-link-image, .details__related-link-placeholder {
          transition-duration: 5s;
          transform: scale(2);
        }
      }
    }
  }

  &--image {
    .details__close {
      color: #F5ECDA;
    }

    .details__text {
      padding-top: 1rem;
    }
  }

  &__intersection-guard {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
  }
}
</style>
