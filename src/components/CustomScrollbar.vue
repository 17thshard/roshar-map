<template>
  <OverlayScrollbarsComponent
    ref="os"
    :options="finalOptions"
    :events="events"
    class="custom-scrollbar"
    defer
  >
    <slot />
  </OverlayScrollbarsComponent>
</template>

<script>
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import 'overlayscrollbars/styles/overlayscrollbars.css';
import { useI18n } from 'vue-i18n'

export default {
  name: 'CustomScrollbar',
  components: {
    OverlayScrollbarsComponent
  },
  setup () {
    const { t } = useI18n()
    return { t }
  },
  props: {
    options: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    events() {
      return {
        scroll: (instance, event) => {
          this.$emit('scroll', event);
        }
      };
    },
    finalOptions() {
      // Basic deep merge for the structure we care about
      const defaults = {
        overflow: {
          x: 'hidden',
          y: 'scroll'
        },
        scrollbars: {
          theme: 'os-theme-roshar',
          autoHide: 'leave',
          clickScroll: true
        }
      };

      const opts = { ...defaults, ...this.options };
      if (this.options.overflow) {
        opts.overflow = { ...defaults.overflow, ...this.options.overflow };
      }
      if (this.options.scrollbars) {
        opts.scrollbars = { ...defaults.scrollbars, ...this.options.scrollbars };
      }
      return opts;
    }
  },
  methods: {
    osInstance() {
      return this.$refs.os?.osInstance();
    },
    getElement() {
      return this.$refs.os?.getElement();
    }
  }
}
</script>

<style>
.os-theme-roshar {
  --os-size: 0.5rem;
  --os-handle-bg: rgba(72, 45, 0, 0.5);
  --os-handle-bg-hover: rgba(72, 45, 0, 0.7);
  --os-handle-bg-active: rgba(72, 45, 0, 0.7);
  --os-handle-border-radius: 0.25rem;
  --os-track-bg: transparent;
  --os-padding-perpendicular: 0;
  --os-padding-axis: 0;
}
</style>
