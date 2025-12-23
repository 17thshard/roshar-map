<template>
  <div class="error-screen">
    <div class="error-screen__icon">
      <div class="error-screen__icon-container">
        <img class="error-screen__icon-image" src="@/assets/logos/knight-radiant-ancient-broken.svg" alt="A broken logo of the knights radiant" aria-hidden="true">
      </div>
    </div>
    <Markdown class="error-screen__text" :content="$t('ui.error-screen.message')" />
    <Markdown class="error-screen__report" :content="$t('ui.error-screen.report-intro')">
      <a class="error-screen__report-button" href="https://github.com/Palanaeum/roshar-map/issues/new">
        <VueFeather type="github" :size="20" />
        {{ $t('ui.error-screen.report-button') }}
      </a>
    </Markdown>
  </div>
</template>

<script>
import VueFeather from 'vue-feather'
import Markdown from '@/components/Markdown.vue'

export default {
  name: 'ErrorScreen',
  components: { VueFeather, Markdown }
}
</script>

<style lang="scss">
.error-screen {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 0;
  right: 0;
  background: color.adjust(#0f3562, $lightness: -10%);
  box-shadow: inset 0 -3vw 20vw rgba(0, 0, 0, 0.5);
  color: #cfddf1;
  text-align: center;
  z-index: 100;
  font-variant: small-caps;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  padding: 1rem;

  @media (max-width: 960px) {
    font-size: 1.5rem;
  }

  &__icon {
    position: relative;
    box-sizing: border-box;
    width: 600px;
    max-width: 95%;

    @media (max-width: 960px) {
      max-width: 400px;
    }

    @media (max-width: 500px) {
      max-width: 95%;
    }

    @media (max-height: 640px) {
      width: calc(100vh - 50px);
    }

    &-container {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
    }

    .error-screen__icon-image {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  &__text {
    p {
      margin: 0 1rem;
    }

    a {
      display: inline-block;
      text-decoration: none;
      transition: all 0.2s ease-in-out;
      color: #cfddf1;
      padding: 0.125rem 0.25rem;
      background-color: transparent;
      background-image: linear-gradient(0deg, #cfddf1 0%, #cfddf1 100%);
      background-repeat: no-repeat;
      background-size: 100% 0.1em;
      background-position: 50% 100%;

      &:hover, &:focus, &:active {
        color: #0f3562;
        background-size: 100% 100%;
      }
    }
  }

  &__report {
    margin-top: 2rem;
    font-variant: none;
    font-size: 0.8em;

    p {
      margin: 0 1rem;
    }

    &-button {
      display: flex !important;
      align-items: center;
      justify-content: center;
      border: 2px solid #cfddf1;
      font-variant: small-caps;
      color: inherit;
      text-decoration: none;
      font-size: 1em;
      padding: 0.75rem 1rem;
      position: relative;
      border-radius: 3px;
      transition: all 0.3s ease-in-out;
      background-image: linear-gradient(0deg, #cfddf1 0%, #cfddf1 100%);
      background-repeat: no-repeat;
      background-size: 100% 0 !important;
      background-position: 50% 100%;
      margin: 1rem 1rem 0;

      &:hover, &:active, &:focus {
        color: #0f3562;
        background-size: 100% 100% !important;
      }

      .feather {
        margin-right: 0.5em;
      }
    }
  }
}
</style>
