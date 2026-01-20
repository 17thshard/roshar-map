<template>
  <div :class="['settings', { 'settings--open': open }]">
    <transition name="settings__content">
      <div
        v-if="open"
        class="settings__content"
      >
        <div :class="['settings__bar', { 'settings__bar--active': scrolled }]">
          <h2>{{ $t('ui.settings') }}</h2>

          <button
            class="settings__close"
            :title="$t('ui.close')"
            @click="$emit('close')"
          >
            <VueFeather
              type="x"
              :size="20"
            />
          </button>
        </div>

        <CustomScrollbar
          ref="scroller"
          class="settings__scroller"
          @scroll="onScroll"
        >
          <section class="settings__layers">
            <h3 data-tutorial-id="settings-layers">
              {{ $t('ui.layers') }}
            </h3>
            <label
              v-for="(layerActive, layer) in store.layersActive"
              :key="layer"
              :for="`settings__layer--${layer}`"
              class="settings__layer"
            >
              <input
                :id="`settings__layer--${layer}`"
                type="checkbox"
                :checked="layerActive"
                @input="store.toggleLayer({ layer, value: $event.target.checked })"
              >
              <span :class="['settings__layer-check', { 'settings__layer-check--temporary': isLayerEnabledTemporarily(layer) }]" />
              {{ $t(`layers.${layer}`) }}
            </label>
          </section>

          <section
            class="settings__filters"
            :style="{ paddingBottom: `${separateHeight + 56}px` }"
          >
            <h3 data-tutorial-id="settings-filters">
              {{ $t('ui.filters') }}
            </h3>
            <div
              v-for="category in tagCategories"
              :key="category.id"
            >
              <h4>
                {{ $t(`tagCategories.${category.id}`) }}
              </h4>
              <ul class="settings__tag-list">
                <li
                  v-for="tag in category.tags"
                  :key="tag.id"
                >
                  <div :class="['settings__options', `settings__options--${buildTagState(tag.id)}`]">
                    <button
                      class="settings__options-button"
                      :title="$t('ui.enable')"
                      @click="enableTag(tag.id)"
                    >
                      <VueFeather
                        type="eye"
                        :size="14"
                      />
                    </button>
                    <button
                      class="settings__options-button"
                      :title="$t('ui.display-separately')"
                      @click="enableTagSeparation(tag.id)"
                    >
                      <VueFeather
                        type="git-branch"
                        :size="14"
                      />
                    </button>
                    <button
                      class="settings__options-button"
                      :title="$t('ui.disable')"
                      @click="disableTag(tag.id)"
                    >
                      <VueFeather
                        type="eye-off"
                        :size="14"
                      />
                    </button>
                  </div>
                  {{ $t(`tags.${tag.id}`) }}
                </li>
              </ul>
            </div>
          </section>
        </CustomScrollbar>

        <section class="settings__separate-timelines-container">
          <h3 data-tutorial-id="settings-separate-timelines">
            {{ $t('ui.separate-timelines') }}
          </h3>
          <SeparateTimelineOverview :height="separateHeight" />
          <i18n-t
            v-if="filter.separateTags.length === 0"
            keypath="ui.add-timeline"
            tag="div"
            scope="global"
            class="settings__separate-timelines-empty"
          >
            <template #timeline-icon>
              <VueFeather
                type="git-branch"
                :size="14"
              />
            </template>
          </i18n-t>
        </section>
      </div>
    </transition>
  </div>
</template>

<script>
import VueFeather from 'vue-feather'
import { mapState } from 'pinia'
import { useMainStore } from '@/stores/main'
import { useI18n } from 'vue-i18n'
import tagCategories from '@/stores/tags.json'
import SeparateTimelineOverview from '@/components/SeparateTimelineOverview.vue'
import CustomScrollbar from '@/components/CustomScrollbar.vue'

export default {
  name: 'Settings',
  components: { VueFeather, SeparateTimelineOverview, CustomScrollbar },
  props: {
    open: Boolean
  },
  emits: ['close'],
  setup () {
    const { t } = useI18n({ useScope: 'global' })
    const store = useMainStore()
    return { t, store }
  },
  data () {
    return {
      scrolled: false,
      tagCategories
    }
  },
  computed: {
    ...mapState(useMainStore, ['events', 'filter', 'openedMenu']),
    separateHeight () {
      return Math.max(92, (this.filter.separateTags.length + 1) * 24 + 64)
    }
  },
  watch: {
    active (value) {
      if (value) {
        this.scrolled = false
      }
    }
  },
  methods: {
    onScroll (event) {
      this.scrolled = event.target.scrollTop > 0
    },
    buildTagState (tag) {
      if (this.filter.separateTags.includes(tag)) {
        return 'separate'
      }

      return this.filter.tags.includes(tag) ? 'disabled' : 'enabled'
    },
    enableTag (tag) {
      this.store.enableTag(tag)
    },
    disableTag (tag) {
      this.store.disableTag(tag)
    },
    enableTagSeparation (tag) {
      this.store.enableTagSeparation(tag)
      if (this.$gtag) {
        this.$gtag.event('settings_separate', { event_category: 'engagement', event_label: tag })
      }
    },
    isLayerEnabledTemporarily (layer) {
      const activeEvent = this.store.activeEvent
      if (activeEvent !== null) {
        if (layer === 'shadesmar') {
          return activeEvent.shadesmar === true
        } else if (layer === 'factions') {
          return activeEvent.specialEffect === 'factions'
        }
      }

      if (this.$route.name === 'locations') {
        const activeLocation = this.store.mappings.locations[this.$route.params.id]

        return layer === 'shadesmar' && activeLocation.shadesmar === true
      }

      return false
    }
  }
}
</script>

<style lang="scss">
.settings {
  position: fixed;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 60;
  width: 350px;
  max-width: 100%;

  [dir=ltr] & {
    right: 0;
  }

  [dir=rtl] & {
    left: 0;
  }

  &__content {
    z-index: 50;
    position: absolute;
    background: #F5ECDA url(../assets/paper.png);
    right: 0;
    left: 0;
    box-sizing: border-box;
    top: 0;
    bottom: 0;
    pointer-events: auto;
    box-shadow: 0 0 2rem rgba(0, 0, 0, 0.5);
    font-size: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &-enter-active, &-leave-active {
      z-index: 60;
      transition: clip-path 0.5s ease-in-out;
    }

    [dir=ltr] & {
      &-enter-from, &-leave-to {
        clip-path: circle(1px at calc(100% - 6.5rem) 3.25rem);
      }

      &-enter-to, &-leave-from {
        clip-path: circle(100vh at 5.5rem 3.25rem);
      }
    }

    [dir=rtl] & {
      &-enter-from, &-leave-to {
        clip-path: circle(1px at 6.5rem 3.25rem);
      }

      &-enter-to, &-leave-from {
        clip-path: circle(100vh at 5.5rem 3.25rem);
      }
    }

    h3 {
      margin: 0 0 0.5rem;
      display: inline-block;
    }

    h4 {
      font-family: sans-serif;
      text-transform: uppercase;
      font-size: 0.8em;
      margin: 0;
    }
  }

  &--open {
    z-index: 60;
  }

  &__bar {
    display: flex;
    align-items: center;
    background: rgba(#F5ECDA, 0);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0.5);
    transition: all 0.2s ease-in-out;
    padding: 1.5rem 1rem;

    h2 {
      margin: 0;
    }

    &--active {
      background: #F5ECDA;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    }
  }

  &__close {
    display: block;
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    transition: color 0.2s ease-in-out;
    padding: 0;
    height: 24px;

    [dir=ltr] & {
      margin-left: auto;
    }

    [dir=rtl] & {
      margin-right: auto;
    }

    &:hover, &:active, &:focus {
      color: #ffad00;
    }
  }

  &__scroller {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    flex: 1;
    min-height: 0;
    max-height: 100%;

    [dir=rtl] & {
      direction: rtl;
    }
  }

  &__filters, &__layers {
    padding: 0 1rem 2rem;
    width: 350px;
    max-width: 100%;
    box-sizing: border-box;
  }

  &__layers {
    padding-bottom: 1rem;
  }

  &__layer {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.25rem 0;

    input {
      display: none;
    }

    &-check {
      display: block;
      width: 1rem;
      height: 1rem;
      background: color.adjust(#F5ECDA, $lightness: -30%);
      padding: 0.25rem;
      box-sizing: border-box;
      position: relative;

      [dir=ltr] & {
        margin-right: 0.5rem;
      }

      [dir=rtl] & {
        margin-left: 0.5rem;
      }

      &:after {
        display: block;
        content: '';
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        background: #0a3972;
        transform-origin: 50% 50%;
        transform: rotate(45deg) scale(0);
        opacity: 0;
        transition: all 0.2s ease-in-out;
      }

      &--temporary:after {
        opacity: 0.5;
        transform: rotate(45deg) scale(1);
      }
    }

    input:checked + &-check:after {
      opacity: 1;
      transform: rotate(45deg) scale(1);
    }
  }

  &__tag-list {
    padding: 0;
    list-style-type: none;
    margin: 0.5rem 0;

    li {
      display: flex;
      align-items: center;
      padding: 0.25rem 0;
    }
  }

  &__options {
    position: relative;
    display: flex;
    align-items: stretch;
    clip-path: polygon(0.25rem 0, calc(100% - 0.25rem) 0, 100% 0.25rem, 100% calc(100% - 0.25rem), calc(100% - 0.25rem) 100%, 0.25rem 100%, 0 calc(100% - 0.25rem), 0 0.25rem);

    [dir=ltr] & {
      margin-right: 0.5rem;
    }

    [dir=rtl] & {
      margin-left: 0.5rem;
    }

    &-button {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      appearance: none;
      outline: none;
      box-sizing: border-box;
      border: none;
      background: none;
      margin: 0;
      padding: 0.4rem 0.5rem;
      color: #f6f8fa;
      background: color.adjust(#0f3562, $saturation: -10%);
      width: 30px;

      .feather {
        position: relative;
        z-index: 1;
      }

      &:hover, &:active, &:focus {
        background: color.adjust(#0f3562, $lightness: 5%);
      }
    }

    &:after {
      content: '';
      position: absolute;
      width: 30px;
      top: 0;
      bottom: 0;
      background: color.adjust(#0f3562, $lightness: 10%);
      z-index: 0;
      transition: left 0.3s ease-in-out, right 0.3s ease-in-out;
      pointer-events: none;
    }

    [dir=ltr] & {
      &--enabled:after {
        left: 0;
      }

      &--separate:after {
        left: 30px;
      }

      &--disabled:after {
        left: 60px;
      }
    }

    [dir=rtl] & {
      &--enabled:after {
        right: 0;
      }

      &--separate:after {
        right: 30px;
      }

      &--disabled:after {
        right: 60px;
      }
    }
  }

  &__separate-timelines-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem 0.5rem 0;
    background: #F5ECDA url(../assets/paper.png);
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    z-index: 2;
  }

  &__separate-timelines-empty {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    text-align: center;
    color: #9e8d6d;
    pointer-events: none;

    .feather {
      vertical-align: middle;
      display: inline-block;
      position: relative;
      top: 0.09rem;
    }
  }
}
</style>
