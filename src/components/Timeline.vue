<template>
  <div class="timeline" />
</template>

<script>
export default {
  name: 'Timeline',
  data () {
    return {
      events: []
    }
  }
}
</script>

<style lang="scss">
.timeline {
  min-height: 140px;
  background: #F5ECDA url(../assets/paper.png);
}
</style>
