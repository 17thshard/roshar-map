<template>
  <div class="go-to-date__wrapper" @click.self="close">
    <form class="go-to-date" @submit.prevent="submit">
      <h2>
        {{ $t('ui.go-to-date.heading') }}

        <button type="button" class="go-to-date__close" :title="$t('ui.close')" @click="close">
          <XIcon />
        </button>
      </h2>
      <section class="go-to-date__fields">
        <div class="go-to-date__field go-to-date__field--wide">
          <label for="go-to-date__year">{{ $t('ui.go-to-date.fields.year.label') }}</label>
          <input
            id="go-to-date__year"
            ref="year"
            v-model="year"
            type="number"
            step="1"
            :placeholder="$t('ui.go-to-date.fields.year.placeholder')"
          >
          <div class="go-to-date__field-focus" />
        </div>
        <div class="go-to-date__field">
          <label for="go-to-date__month">{{ $t('ui.go-to-date.fields.month.label') }}</label>
          <input
            id="go-to-date__month"
            v-model="month"
            type="number"
            min="1"
            max="10"
            step="1"
            :placeholder="$t('ui.go-to-date.fields.month.placeholder')"
            @input="limitToRange('month', 1, 10, $event)"
          >
          <div class="go-to-date__field-focus" />
        </div>
        <div class="go-to-date__field">
          <label for="go-to-date__week">{{ $t('ui.go-to-date.fields.week.label') }}</label>
          <input
            id="go-to-date__week"
            v-model="week"
            type="number"
            min="1"
            max="10"
            step="1"
            :placeholder="$t('ui.go-to-date.fields.week.placeholder')"
            @input="limitToRange('week', 1, 10, $event)"
          >
          <div class="go-to-date__field-focus" />
        </div>
        <div class="go-to-date__field">
          <label for="go-to-date__day">{{ $t('ui.go-to-date.fields.day.label') }}</label>
          <input
            id="go-to-date__day"
            v-model="day"
            type="number"
            min="1"
            max="5"
            step="1"
            :placeholder="$t('ui.go-to-date.fields.day.placeholder')"
            @input="limitToRange('day', 1, 5, $event)"
          >
          <div class="go-to-date__field-focus" />
        </div>
        <button type="submit">
          <ArrowLeftIcon v-if="$store.state.flipDirectionalIcons" />
          <ArrowRightIcon v-else />
        </button>
      </section>
      <section v-if="error !== null" class="go-to-date__error">
        {{ $t(`ui.go-to-date.errors.${error}`) }}
      </section>
    </form>
  </div>
</template>

<script>
import { ArrowRightIcon, ArrowLeftIcon, XIcon } from 'vue-feather-icons'

export default {
  name: 'GoToDate',
  components: { ArrowRightIcon, ArrowLeftIcon, XIcon },
  data () {
    return {
      year: null,
      month: null,
      week: null,
      day: null,
      error: null
    }
  },
  mounted () {
    this.$refs.year.focus()
    document.addEventListener('keyup', this.closeOnEscape)
  },
  destroyed () {
    document.removeEventListener('keyup', this.closeOnEscape)
  },
  methods: {
    closeOnEscape (event) {
      if (event.key === 'Escape') {
        this.close()
      }
    },
    close () {
      this.$store.commit('closeGoToDate')
    },
    submit () {
      const year = this.parseValue(this.year)
      const month = this.parseValue(this.month)
      const week = this.parseValue(this.week)
      const day = this.parseValue(this.day)

      if (year === null) {
        this.error = 'year-required'
        return
      }

      if (month === null && (week !== null || day !== null)) {
        this.error = 'month-required'
        return
      }

      if (week === null && day !== null) {
        this.error = 'week-required'
        return
      }

      this.error = null

      const date = [year, month, week, day]
      for (let i = date.length - 1; i >= 0; i--) {
        if (date[i] === null) {
          date.splice(i, 1)
        } else {
          break
        }
      }

      this.$emit('submit', date)

      this.close()
    },
    parseValue (value) {
      if (value === undefined || value === null || (typeof value === 'string' && value.trim().length === 0)) {
        return null
      }

      return value instanceof Number ? value : Number.parseInt(value)
    },
    limitToRange (field, min, max, event) {
      const value = event.target.value

      if (value === undefined || value === null || value.trim().length === 0) {
        return
      }

      const numericValue = Number.parseInt(value)

      if (numericValue === 0) {
        return
      }

      this[field] = Math.max(min, Math.min(numericValue, max))
    }
  }
}
</script>

<style lang="scss">
.go-to-date {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: auto;
  box-sizing: border-box;

  &-enter-active {
    transition: opacity 0.5s ease-out;

    .go-to-date {
      transition: transform 0.3s ease-out;
    }
  }

  &-leave-active {
    transition: opacity 0.5s ease-in;

    .go-to-date {
      transition: transform 0.3s ease-in;
    }
  }

  &-enter, &-leave-to {
    opacity: 0;

    .go-to-date {
      transform: translateY(-80px);
    }
  }

  &-enter-to, &-leave {
    opacity: 1;

    .go-to-date {
      transform: translateY(0);
    }
  }

  &__wrapper {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  h2 {
    font-size: 1.5rem;
    font-variant: small-caps;
    color: #f6f8fa;
    text-shadow: 0 2px 0 rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;

    [dir=ltr] & {
      margin: 0 3.5rem 0 0.5rem;
    }

    [dir=rtl] & {
      margin: 0 0.5rem 0 3.5rem;
    }
  }

  &__close {
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    transition: color 0.2s ease-in-out;
    color: #f6f8fa;
    border-radius: 100%;
    padding: 0.25rem;
    line-height: 1;
    display: flex;

    [dir=ltr] & {
      margin-left: auto;
    }

    [dir=rtl] & {
      margin-right: auto;
    }

    &:hover, &:active, &:focus {
      color: #ffad00 !important;
    }
  }

  &__error {
    position: absolute;
    align-self: center;
    background: #ff462e;
    top: 100%;
    margin-top: 1rem;
    color: #f6f8fa;
    font-size: 0.8rem;
    text-align: center;
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.5);
    border-radius: 3px;
    max-width: calc(100% - 2rem);
    padding: 0.5rem;
  }

  &__fields {
    display: flex;
    align-items: center;

    @media (max-width: 500px) {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-row-gap: 0.25rem;
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 100%;
      appearance: none;
      border: none;
      background: color.adjust(#0f3562, $lightness: 10%);
      color: #f6f8fa;
      padding: 0;
      margin: 0.5rem;
      cursor: pointer;
      outline: none;
      box-sizing: border-box;
      white-space: nowrap;
      box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.5);
      transition: 0.2s ease-in-out background;

      &:hover, &:active, &:focus {
        background: color.adjust(#0f3562, $lightness: 20%);
      }

      @media (max-width: 500px) {
        grid-column: 1 / span 3;
        margin: 1rem auto 0.5rem;
      }
    }
  }

  &__field {
    position: relative;
    margin: 0.5rem;
    filter: drop-shadow(0 0.25rem 0.5rem rgba(0, 0, 0, 0.5));
    width: 4.5rem;

    &--wide {
      width: 7rem;

      @media (max-width: 500px) {
        grid-column: 1 / span 3;
        width: calc(100% - 1rem);
      }
    }

    $focus-height: 0.3rem;
    $focus-color: color.adjust(#0f3562, $lightness: 20%);
    $focus-diagonal-size: $focus-height + 0.353rem;

    label {
      position: absolute;
      top: 100%;
      margin-top: 0.25rem;
      left: 0.5rem;
      font-size: 0.7rem;
      font-family: sans-serif;
      color: #f6f8fa;
      text-transform: uppercase;
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.75);
    }

    &-focus {
      position: absolute;
      pointer-events: none;
      bottom: 0;
      left: 0;
      right: 0;
      height: $focus-height * 3;
      transition: box-shadow 0.2s ease-in-out;
      box-shadow: inset 0 0 0 $focus-color;
      clip-path: polygon(
          0 0,
          100% 0,
          100% calc(100% - 0.5rem),
          calc(100% - 0.5rem) 100%,
          0.5rem 100%,
          0 calc(100% - 0.5rem)
      );

      &:before, &:after {
        position: absolute;
        content: '';
        bottom: 0;
        width: 2rem;
        height: 0.353rem;
        background: $focus-color;
        transform-origin: 50% 100%;
        transition: height 0.2s ease-in-out;
      }

      &:before {
        left: -1rem;
        transform: rotate(45deg);
      }

      &:after {
        right: -1rem;
        transform: rotate(-45deg);
      }
    }

    input[type=number] {
      position: relative;
      width: 100%;
      box-sizing: border-box;
      background: #F5ECDA url(../assets/paper.png);
      color: #242629;
      border: none;
      font-size: 1rem;
      padding: 1rem;
      text-align: center;
      outline: none;
      font-family: 'Libre Baskerville', serif;
      -moz-appearance: textfield;
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

      &::-webkit-outer-spin-button, &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &:focus + .go-to-date__field-focus {
        box-shadow: inset 0 (-$focus-height) 0 $focus-color;

        &:before, &:after {
          height: $focus-diagonal-size;
        }
      }
    }
  }
}
</style>
