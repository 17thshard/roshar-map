module.exports = {
  pwa: {
    name: 'Roshar Map',
    themeColor: '#0f3562',
    msTileColor: '#0f3562',
    manifestOptions: {
      background_color: '#0f3562'
    },
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      exclude: ['index.html'],
      runtimeCaching: [
        {
          urlPattern: new RegExp('/$'),
          handler: ({ event }) => {
            // eslint-disable-next-line no-undef
            const strategy = new workbox.strategies.NetworkFirst()
            return strategy.makeRequest({
              request: '/index.html',
              event
            })
          }
        }
      ]
    }
  }
}
