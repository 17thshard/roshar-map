<template>
  <div class="loading-indicator">
    <div class="loading-indicator__icon" />
    <div class="loading-indicator__text">
      {{ $t('ui.loading') }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingIndicator'
}
</script>

<style lang="scss">
.loading-indicator {
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

  &__icon {
    position: relative;
    box-sizing: border-box;
    padding: 1rem;
    width: 600px;
    max-width: 95%;

    @media (max-height: 640px) {
      width: calc(100vh - 50px);
    }

    &:before {
      content: '';
      display: block;
      width: 100%;
      background: repeating-linear-gradient(
          -65deg,
          rgba(#cfddf1, 0.5) 0%,
          rgba(#cfddf1, 0.5) 47%,
          rgba(#cfddf1, 1) 50%,
          rgba(#cfddf1, 0.5) 53%,
          rgba(#cfddf1, 0.5) 100%
      ) 330% 0;
      padding-bottom: 100%;
      mask-image: url('../assets/logos/knight-radiant-ancient.svg');
      mask-size: 100% 100%;
      -webkit-mask-image: url('../assets/logos/knight-radiant-ancient.svg');
      -webkit-mask-size: 100% 100%;
      animation: loading-indicator__icon 2s linear infinite;
      background-size: 200% 200%;
    }

    @keyframes loading-indicator__icon {
      0% {
        background-position: 330% 0;
      }
      100% {
        background-position: 130% 0;
      }
    }
  }

  &__text {
    animation: loading__text 5s ease-in-out infinite;

    @keyframes loading__text {
      0% {
        transform: scale(1)
      }

      50% {
        transform: scale(1.1);
      }

      100% {
        transform: scale(1)
      }
    }
  }
}
</style>
