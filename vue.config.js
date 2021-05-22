const path = require('path')

module.exports = {
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.resolveLoader
      .modules
      .add(path.resolve(__dirname, 'build/loaders'))
      .end()

    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp|dds)(\?.*)?$/)
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

    if (process.env.NODE_ENV === 'production') {
      config.module
        .rule('images-srcset')
        .before('images')
        .test(/\.(png|jpe?g|webp|tiff?)$/i)
        .resourceQuery(/srcset/)
        .use('cache')
        .loader('cache-loader')
        .end()
        .use('srcset')
        .loader('webpack-image-srcset-loader')
        .options({
          sizes: ['1x', '2x'],
          esModule: false,
          scaleUp: false
        })

      config.module
        .rule('images-resize')
        .after('images')
        .test(/\.(png|jpe?g|webp|tiff?)$/i)
        .resourceQuery(/srcset/)
        .use('cache')
        .loader('cache-loader')
        .end()
        .use('resize')
        .loader('webpack-image-resize-loader')
        .end()
        .use('max-size')
        .loader(path.resolve('build/loaders/image-max-size-loader.js'))
        .options({ maxWidth: 1000 })
    } else {
      config.module
        .rule('images')
        .oneOf('srcset')
        .resourceQuery(/srcset/)
        .use('file-loader')
        .loader('file-loader')
        .options({
          context: './src/assets',
          name: 'img/[path][name].[hash:8].[ext]',
          postTransformPublicPath: p => `${p} + ' 1x'`
        })
        .end()
        .end()
        .oneOf('normal')
        .use('normal')
        .loader(
          config.module
            .rule('images')
            .use('url-loader')
            .get('loader')
        )
        .options(
          config.module
            .rule('images')
            .use('url-loader')
            .get('options')
        )

      config.module.rule('images').uses.delete('url-loader')
    }

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
