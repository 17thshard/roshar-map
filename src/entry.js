// Single HTML entry for Vite; we select the Vue entrypoint by Vite mode.
// - `vite --mode dev` -> src/dev.js
// - default / production -> src/main.js

if (import.meta.env.MODE === 'dev') {
  import('./dev.js')
} else {
  import('./main.js')
}


