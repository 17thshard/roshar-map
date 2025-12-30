<template>
  <div class="measurement-result">
    <div class="measurement-result__content">
      <button class="measurement-result__close" :title="$t('ui.close')" @click="$emit('close')">
        <VueFeather type="x" />
      </button>
      <h2>{{ $t('ui.measurement.title') }}</h2>
      <Markdown :content="$t('ui.measurement.explanation')" />
      <table>
        <tr v-if="measurement.start">
          <th>{{ $t('ui.measurement.labels.start') }}</th>
          <td>{{ formatLocation(measurement.start) }}</td>
        </tr>
        <tr v-if="measurement.end">
          <th>{{ $t('ui.measurement.labels.end') }}</th>
          <td>{{ formatLocation(measurement.end) }}</td>
        </tr>
        <tr v-if="measurement.distance !== undefined && measurement.distance !== null">
          <th>{{ $t('ui.measurement.labels.distance') }}</th>
          <td>{{ $t('ui.measurement.distance', { distanceKm: measurement.distance.toFixed(0), distanceMi: mileDistance.toFixed(0) }) }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import VueFeather from 'vue-feather'
import Markdown from '@/components/Markdown.vue'

export default {
  name: 'MeasurementResult',
  components: { Markdown, VueFeather },
  props: {
    measurement: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  computed: {
    mileDistance () {
      return this.measurement.distance * 0.621
    }
  },
  methods: {
    formatLocation (location) {
      return this.$t(
        'ui.measurement.coordinates.full',
        {
          latitude: this.formatRadians(location.lat, 'north', 'south'),
          longitude: this.formatRadians(location.lng, 'east', 'west')
        }
      )
    },
    formatRadians (radians, positive, negative) {
      const degrees = Math.abs(radians) * 100 / Math.PI
      const direction = radians < 0 ? negative : positive

      return this.$t(`ui.measurement.coordinates.${direction}`, { degrees: degrees.toFixed(2) })
    }
  }
}
</script>

<style lang="scss">
.measurement-result {
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 14px;
  filter: drop-shadow(0 0.5rem 1rem rgba(0, 0, 0, 0.5));
  cursor: auto;
  max-width: 300px;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    background: #F5ECDA url(../../assets/paper.png);
    clip-path: polygon(0.5rem 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% calc(100% - 0.5rem), calc(100% - 0.5rem) 100%, 0.5rem 100%, 0 calc(100% - 0.5rem), 0 0.5rem);
  }

  &__content {
    position: relative;
    z-index: 1;

    h2 {
      margin: 0;
    }

    p {
      margin: 0.5rem 0;
    }

    table {
      width: 100%;
      border-spacing: 0;

      th {
        width: 35%;
        text-align: left;
        padding-right: 0.25rem;
      }
    }
  }

  &__close {
    position: absolute;
    top: 0;
    right: 0;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    opacity: 0.5;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
