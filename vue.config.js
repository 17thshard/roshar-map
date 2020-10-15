module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap((options) => {
        options.fallback.options.context = './src/assets'
        options.fallback.options.name = 'img/[path][name].[hash:8].[ext]'

        return options
      })
  },
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
      exclude: ['index.html', /.*\/textures\/.*\.(webp|png)$/, /.*\/lang-.*\.js/],
      runtimeCaching: [
        {
          urlPattern: /^$|^\/$|\/#.*$/,
          handler: 'NetworkFirst'
        },
        {
          urlPattern: /.*\/textures\/.*\.(webp|png)$/,
          handler: 'CacheFirst'
        },
        {
          urlPattern: /.*\/?js\/lang-.*\.js/,
          handler: 'CacheFirst'
        }
      ]
    }
  }
}
