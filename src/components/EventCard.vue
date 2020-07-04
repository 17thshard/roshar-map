<template>
  <div :class="['event-card', { 'event-card--image': event.image !== undefined }]">
    <div class="event-card__content">
      <img
        v-if="event.image !== undefined"
        :src="`${imageBaseUrl}/${event.image}`"
        :alt="event.name"
        class="event-card__image"
      >
      <h2 class="event-card__name">
        {{ event.name }}
      </h2>
      <div class="event-card__text">
        Event description
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  computed: {
    imageBaseUrl () {
      return `${process.env.BASE_URL}events`
    }
  }
}
</script>

<style lang="scss">
.event-card {
  position: absolute;
  bottom: 100%;
  width: 350px;
  max-width: 90%;
  z-index: 5;
  filter: drop-shadow(0 -0.5rem 1rem rgba(0, 0, 0, 0.5));
  box-sizing: border-box;
  color: #1f1b17;
  transition: all 0.2s ease-in-out;

  &--image {
    .event-card__content {
      padding-top: 3rem;
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
    clip-path: polygon(1rem 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%, 0 1rem);
  }

  &__content {
    position: relative;
    z-index: 6;
    padding: 1rem 0;
  }

  &__image {
    position: absolute;
    width: 86px;
    top: -43px;
    left: 50%;
    margin-left: -43px;
    border-radius: 100%;
    border: 4px solid #F5ECDA;
    box-sizing: border-box;
    opacity: 0;
    animation: event-card__image-enter 0.5s ease-out;
    animation-delay: 1.5s;
    animation-fill-mode: forwards;

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
    font-size: 1.25rem;
    font-weight: 600;
    font-variant: small-caps;
    margin: 0;
    text-align: center;
  }

  &__text {
    font-size: 0.8rem;
    padding: 0.5rem 0.5rem 0;
  }
}
</style>
