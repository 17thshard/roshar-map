<template>
  <div class="first-visit-window">
    <button class="first-visit-window__close" :title="$t('ui.dismiss')" @click="dismiss">
      <VueFeather type="x" />
    </button>
    <div class="first-visit-window__icon" />
    <Markdown class="first-visit-window__text" :content="$t('ui.first-visit.intro')">
      <template #prefix>
        <p class="first-visit-window__heading">
          {{ $t('ui.first-visit.heading') }}
        </p>
      </template>
    </Markdown>
    <div class="first-visit-window__buttons">
      <button @click="dismiss">
        {{ $t('ui.dismiss') }}
      </button>
      <button @click="explainDates">
        {{ $t('ui.first-visit.calendar') }}
      </button>
      <button @click="startTutorial">
        {{ $t('ui.first-visit.tutorial') }}
      </button>
    </div>
  </div>
</template>

<script>
import VueFeather from 'vue-feather'
import Markdown from '@/components/Markdown.vue'
export default {
  name: 'FirstVisitWindow',
  components: { Markdown, VueFeather },
  methods: {
    dismiss () {
      window.localStorage.tutorialDone = 'true'
      this.$emit('close')
    },
    explainDates () {
      this.$store.commit('openCalendarGuide')
      if (this.$gtag) {
        this.$gtag.event('first_visit_done', { event_category: 'engagement', event_label: 'calendar_guide' })
        this.$gtag.pageview({ page_title: 'Calendar Guide', page_path: '/calendar-guide', page_location: '' })
      }
    },
    startTutorial () {
      window.localStorage.tutorialStarted = 'true'
      this.$emit('open-tutorial')
      this.$emit('close')
      if (this.$gtag) {
        this.$gtag.event('first_visit_done', { event_category: 'engagement', event_label: 'tutorial' })
      }
    }
  }
}
</script>

<style lang="scss">
.first-visit-window {
  position: fixed;
  top: 2rem;
  left: 2rem;
  right: 2rem;
  z-index: 60;
  margin: 0;
  padding: 1rem;
  font-size: 14px;
  filter: drop-shadow(0 0.5rem 1rem rgba(0, 0, 0, 0.5));
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  grid-column-gap: 0.5rem;
  max-width: 350px;

  @media (max-width: 640px) {
    top: 6rem;
  }

  &-enter-active {
    transition: all 0.5s ease-out;
    transition-delay: 1.5s;
  }

  &-leave-active {
    transition: all 0.3s ease-in;
  }

  &-enter-from, &-leave-to {
    opacity: 0;
    transform: translateY(-50px);
  }

  &-enter-to, &-leave-from {
    opacity: 1;
    transform: translateY(0);
  }

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

  &__icon {
    position: relative;
    z-index: 1;
    width: 64px;
    height: 64px;
    background-color: #0f3562;
    mask-image: url('../assets/logos/knight-radiant-ancient.svg');
    mask-size: 100% 100%;
    -webkit-mask-image: url('../assets/logos/knight-radiant-ancient.svg');
    -webkit-mask-size: 100% 100%;
  }

  &__text {
    position: relative;
    z-index: 1;
  }

  &__heading {
    margin: 0;
    font-size: 1.5em;
    font-weight: bold;
    font-variant: small-caps;
  }

  &__buttons {
    text-align: center;
    position: relative;
    z-index: 1;
    grid-column: 1 / span 2;

    button {
      display: inline-block;
      color: inherit;
      text-decoration: none;
      transition: all 0.2s ease-in-out;
      font-size: 1em;
      appearance: none;
      outline: none;
      box-sizing: border-box;
      border: none;
      background-color: transparent;
      background-image: linear-gradient(0deg, #0f3562 0%, #0f3562 100%);
      background-repeat: no-repeat;
      background-size: 100% 0.1em;
      background-position: 50% 100%;
      cursor: pointer;
      padding: 0.125rem 0.25rem;
      margin: 0 0.25rem;

      &:last-child {
        margin-right: 0;
      }

      &:hover, &:active, &:focus {
        color: #f6f8fa;
        background-size: 100% 100%;
      }
    }
  }

  &__close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #242629;
    padding: 0.25rem;
    z-index: 2;
    transition: color 0.2s ease-in-out;

    &:hover, &:active, &:focus {
      color: #0f3562;
    }
  }
}
</style>
