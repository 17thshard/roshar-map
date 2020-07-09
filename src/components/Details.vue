<template>
  <div
    :class="[
      'details',
      {
        'details--vertical-overflow': verticalOverflow
      }
    ]"
  >
    <button class="details__close" title="Close" @click="$store.commit('closeDetails')">
      <XIcon />
    </button>
    <div class="details__content" :style="{ width }">
      <div class="details__image-container">
        <div class="details__image" :style="{ width }">
          <div
            class="details__image-aspect-maintainer"
            :style="{ paddingBottom: `${(imageAspect * 100).toFixed(4)}%` }"
          >
            <img
              ref="image"
              src="/locations/kharbranth.jpg"
              alt="Details"
              @load="onImageLoaded"
            >
          </div>
        </div>
      </div>
      <Scrollbar
        :ops="{
          vuescroll: { wheelScrollDuration: 400 },
          bar: { background: '#45423d', opacity: 0.5, size: '0.5rem' },
          rail: { size: '0.5rem', gutterOfSide: '0' }
        }"
        @handle-scroll="updateOverflow"
      >
        <div class="details__scroller" :style="{ paddingTop: '500px' }">
          <div class="details__text-container">
            <div class="details__text">
              <h2>Kharbranth</h2>
              <p>
                Kharbranth, City of Bells, is an independent city-state on Roshar, ruled by King Taravangian. It is one of the five Vorin
                nations
                and home to the Palanaeum, the largest library on Roshar. Kharbranth is known for the quality of its hospitals, and people
                come
                from all over the world to study medicine from Kharbranth's surgeons. The Kharbranthian royal colors are burnt orange and
                white,
                and have become synonymous around Roshar as the colors of surgeons, medicine, and healing.
              </p>
              <p>
                Kharbranth, City of Bells, is an independent city-state on Roshar, ruled by King Taravangian. It is one of the five Vorin
                nations
                and home to the Palanaeum, the largest library on Roshar. Kharbranth is known for the quality of its hospitals, and people
                come
                from all over the world to study medicine from Kharbranth's surgeons. The Kharbranthian royal colors are burnt orange and
                white,
                and have become synonymous around Roshar as the colors of surgeons, medicine, and healing.
              </p>
              <p>
                Kharbranth, City of Bells, is an independent city-state on Roshar, ruled by King Taravangian. It is one of the five Vorin
                nations
                and home to the Palanaeum, the largest library on Roshar. Kharbranth is known for the quality of its hospitals, and people
                come
                from all over the world to study medicine from Kharbranth's surgeons. The Kharbranthian royal colors are burnt orange and
                white,
                and have become synonymous around Roshar as the colors of surgeons, medicine, and healing.
              </p>
              <p>
                Kharbranth, City of Bells, is an independent city-state on Roshar, ruled by King Taravangian. It is one of the five Vorin
                nations
                and home to the Palanaeum, the largest library on Roshar. Kharbranth is known for the quality of its hospitals, and people
                come
                from all over the world to study medicine from Kharbranth's surgeons. The Kharbranthian royal colors are burnt orange and
                white,
                and have become synonymous around Roshar as the colors of surgeons, medicine, and healing.
              </p>
              <p>
                Kharbranth, City of Bells, is an independent city-state on Roshar, ruled by King Taravangian. It is one of the five Vorin
                nations
                and home to the Palanaeum, the largest library on Roshar. Kharbranth is known for the quality of its hospitals, and people
                come
                from all over the world to study medicine from Kharbranth's surgeons. The Kharbranthian royal colors are burnt orange and
                white,
                and have become synonymous around Roshar as the colors of surgeons, medicine, and healing.
              </p>
              <p>
                Kharbranth, City of Bells, is an independent city-state on Roshar, ruled by King Taravangian. It is one of the five Vorin
                nations
                and home to the Palanaeum, the largest library on Roshar. Kharbranth is known for the quality of its hospitals, and people
                come
                from all over the world to study medicine from Kharbranth's surgeons. The Kharbranthian royal colors are burnt orange and
                white,
                and have become synonymous around Roshar as the colors of surgeons, medicine, and healing.
              </p>
              <p>
                Kharbranth, City of Bells, is an independent city-state on Roshar, ruled by King Taravangian. It is one of the five Vorin
                nations
                and home to the Palanaeum, the largest library on Roshar. Kharbranth is known for the quality of its hospitals, and people
                come
                from all over the world to study medicine from Kharbranth's surgeons. The Kharbranthian royal colors are burnt orange and
                white,
                and have become synonymous around Roshar as the colors of surgeons, medicine, and healing.
              </p>
              <p>
                Kharbranth, City of Bells, is an independent city-state on Roshar, ruled by King Taravangian. It is one of the five Vorin
                nations
                and home to the Palanaeum, the largest library on Roshar. Kharbranth is known for the quality of its hospitals, and people
                come
                from all over the world to study medicine from Kharbranth's surgeons. The Kharbranthian royal colors are burnt orange and
                white,
                and have become synonymous around Roshar as the colors of surgeons, medicine, and healing.
              </p>
              <p>
                Kharbranth, City of Bells, is an independent city-state on Roshar, ruled by King Taravangian. It is one of the five Vorin
                nations
                and home to the Palanaeum, the largest library on Roshar. Kharbranth is known for the quality of its hospitals, and people
                come
                from all over the world to study medicine from Kharbranth's surgeons. The Kharbranthian royal colors are burnt orange and
                white,
                and have become synonymous around Roshar as the colors of surgeons, medicine, and healing.
              </p>
            </div>
          </div>
        </div>
      </Scrollbar>
    </div>
  </div>
</template>

<script>
import Scrollbar from 'vuescroll/dist/vuescroll-native'
import { XIcon } from 'vue-feather-icons'

export default {
  name: 'Details',
  components: { XIcon, Scrollbar },
  data () {
    return {
      imageAspect: 1,
      verticalOverflow: true
    }
  },
  computed: {
    width () {
      return this.imageAspect < 1 ? `${(500 / this.imageAspect).toFixed(4)}px` : undefined
    }
  },
  methods: {
    onImageLoaded () {
      this.imageAspect = this.$refs.image.naturalHeight / this.$refs.image.naturalWidth
    },
    updateOverflow (event) {
      this.verticalOverflow = event.process < 1
    }
  }
}
</script>

<style lang="scss">
.details {
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  position: absolute;
  max-height: 70%;
  max-width: 90%;
  z-index: 60;
  filter: drop-shadow(0 0.5rem 1rem rgba(0, 0, 0, 0.5));
  overflow: hidden;

  &-enter-active {
    transition: max-width 1s ease-out, max-height 1s ease-out;
  }

  &-enter {
    max-width: 0;

    .details__image-container {
      max-width: 0;
    }

    .details__text-container {
      box-shadow: 0 0 0 rgba(0, 0, 0, 1.0);
    }

    .details__text {
      opacity: 0;
      transform: translateY(50px);
    }
  }

  &-leave-active {
    transition: opacity 0.5s ease-in;
  }

  &-leave-from {
    opacity: 1;
  }

  &-leave-to {
    opacity: 0;
  }

  &__content {
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    position: relative;
    background: #F5ECDA url(../assets/paper.png);
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
    min-height: 0;
  }

  &__image {
    position: relative;
    width: 350px;

    &-container {
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      transition: max-width 0.5s ease-in-out;
      transition-delay: 0.2s;
      max-width: 100%;
      z-index: 59;
      pointer-events: none;
    }

    img {
      position: absolute;
      display: block;
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
  }

  &__content:after {
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
  }

  &--vertical-overflow .details__content:after {
    opacity: 1;
  }

  &__scroller {
    box-sizing: border-box;
    z-index: 61;
  }

  .__rail-is-vertical {
    z-index: 61 !important;
  }

  .__panel {
    z-index: 60 !important;
  }

  .__view {
    z-index: 60 !important;
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

    &-container {
      background: #F5ECDA url(../assets/paper.png);
      z-index: 60;
      transition: box-shadow 0.5s ease-out;
      transition-delay: 0.3s;
      box-shadow: 0 0 2rem rgba(0, 0, 0, 1.0);
    }

    h2 {
      margin: 0;
    }
  }

  &__close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    transition: color 0.2s ease-in-out, opacity 0.5s ease-in-out;
    z-index: 62;

    &:hover, &:active, &:focus {
      color: #ffad00;
    }
  }
}
</style>
