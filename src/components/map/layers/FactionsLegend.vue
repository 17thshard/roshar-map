<template>
  <ul class="factions-legend">
    <li
      v-for="faction in ['coalition', 'odium', 'neutral']"
      :key="faction"
      :class="['factions-legend__entry', `factions-legend__entry--${faction}`]"
      :aria-label="$t(`factions.${faction}.style`)"
    >
      {{ $t(`factions.${faction}.name`) }}
    </li>
  </ul>
</template>

<script>
export default {
  name: 'FactionsLegend'
}
</script>

<style lang="scss">
.factions-legend {
  list-style-type: none;
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 14px;
  filter: drop-shadow(0 0.5rem 1rem rgba(0, 0, 0, 0.5));

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    background: #F5ECDA url(../../../assets/paper.png);
    clip-path: polygon(0.5rem 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% calc(100% - 0.5rem), calc(100% - 0.5rem) 100%, 0.5rem 100%, 0 calc(100% - 0.5rem), 0 0.5rem);
  }

  &__entry {
    display: flex;
    align-items: center;
    padding: 0.25rem 0;
    position: relative;
    z-index: 1;

    &:before {
      content: '';
      width: 1rem;
      height: 1rem;
      box-sizing: border-box;
      flex-shrink: 0;
      transform: rotate(45deg);
      $border-color: color.adjust(#0f3562, $saturation: -10%);
      box-shadow: inset 0 -1px $border-color, inset 0 1px $border-color, inset -1px 0 $border-color, inset 1px 0 $border-color;

      [dir=ltr] & {
        margin-right: 0.5rem;
      }

      [dir=rtl] & {
        margin-left: 0.5rem;
      }
    }

    &--coalition:before {
      background-color: rgb(32, 137, 227);
      background-image: linear-gradient(45deg, rgb(136, 67, 19) 25%, transparent 25%),
      linear-gradient(-45deg, rgb(136, 67, 19) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgb(136, 67, 19) 75%),
      linear-gradient(-45deg, transparent 75%, rgb(136, 67, 19) 75%);
      background-position: 0 0.5rem, 0 0.5rem, 0 -0.5rem, 0 -0.5rem;
      background-size: 1rem 1rem;
    }

    &--odium:before {
      background: rgb(239, 187, 21);
    }

    &--neutral:before {
      background: rgb(35, 211, 156);
    }
  }
}
</style>
