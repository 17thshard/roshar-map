const path = require('path')

module.exports = {
  publicPath: process.env.VUE_APP_PUBLIC_URL,
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.resolveLoader
      .modules
      .add(path.resolve(__dirname, 'build/loaders'))
      .end()

    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap((options) => {
        options.fallback.options.context = './src/assets'
        options.fallback.options.name = 'img/[path][name].[hash:8].[ext]'

        return options
      })
      .end()

    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp|dds)(\?.*)?$/)
      .end()

    config.module
      .rule('html-credits')
      .resourceQuery(/vue&type=template/)
      .use('credits-loader')
      .loader(path.resolve('build/loaders/credits-loader.js'))
      .end()

    config.module
      .rule('lang')
      .test(/\.lang\.json(\?.*)?$/)
      .use('lang-loader')
      .loader(path.resolve('build/loaders/lang-loader.js'))
      .end()
  },
  pwa: {
    name: 'Interactive Map & Timeline of Roshar',
    themeColor: '#0f3562',
    msTileColor: '#0f3562',
    manifestOptions: {
      background_color: '#0f3562'
    },
    iconPaths: {
      favicon32: null,
      favicon16: null,
      appleTouchIcon: null,
      maskIcon: null,
      msTileImage: null
    },
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      exclude: ['index.html', /.*\/textures\/.*\.(webp|png|jpg|dds)$/, /.*\/lang-.*\.js/],
      runtimeCaching: [
        {
          urlPattern: /^$|^\/$|\/#.*$/,
          handler: 'NetworkFirst'
        },
        {
          urlPattern: /.*\/textures\/.*\.(webp|png|jpg|dds)$/,
          handler: 'CacheFirst'
        },
        {
          urlPattern: /.*\/?js\/lang-.*\.js/,
          handler: 'CacheFirst'
        }
      ]
    }
  },
  pluginOptions: {
    ifdefConfig: {
      context: {
        MAP_DEBUG: process.env.MAP_DEBUG === 'true'
      }
    }
  }
}
