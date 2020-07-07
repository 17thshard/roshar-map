<template>
  <div class="loading-indicator">
    <svg width="50%" height="50%" viewBox="0 0 1200 1200">
      <mask id="clip">
        <image xlink:href="@/assets/loading.svg" />
      </mask>
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="75%" x2="100%" y2="100%">
          <stop
            offset="-100%"
            stop-color="#cfddf1"
            stop-opacity="0.5"
          >
            <animate
              attributeName="offset"
              values="-1; 0; 1"
              dur="3s"
              begin="-0.5s"
              repeatCount="indefinite"
            />
          </stop>

          <stop
            offset="-55%"
            stop-color="#cfddf1"
            stop-opacity="0.5"
          >
            <animate
              attributeName="offset"
              values="-0.55; 0.45; 1.45"
              dur="3s"
              begin="-0.5s"
              repeatCount="indefinite"
            />
          </stop>

          <stop
            offset="-50%"
            stop-color="#cfddf1"
            stop-opacity="1"
          >
            <animate
              attributeName="offset"
              values="-0.5; 0.5; 1.5"
              dur="3s"
              begin="-0.5s"
              repeatCount="indefinite"
            />
          </stop>

          <stop
            offset="-45%"
            stop-color="#cfddf1"
            stop-opacity="0.5"
          >
            <animate
              attributeName="offset"
              values="-0.45; 0.55; 1.55"
              dur="3s"
              begin="-0.5s"
              repeatCount="indefinite"
            />
          </stop>

          <stop
            offset="0%"
            stop-color="#cfddf1"
            stop-opacity="0.5"
          >
            <animate
              attributeName="offset"
              values="0; 1; 2"
              dur="3s"
              begin="-0.5s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>

      <rect width="1200" height="1200" fill="url(#logo-gradient)" mask="url(#clip)" />
    </svg>
    Loading...
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
  background: darken(#0f3562, 10%);
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
}
</style>
