import path from 'node:path'
import vue2 from '@vitejs/plugin-vue2'
import { VitePWA } from 'vite-plugin-pwa'
import { generatedAssetsPlugin } from './build/vite-plugin-generated-assets.mjs'

function normalizeBase(publicUrl) {
  if (!publicUrl) return '/'
  try {
    const u = new URL(publicUrl)
    return u.pathname.endsWith('/') ? u.pathname : `${u.pathname}/`
  } catch {
    // allow plain paths like "/roshar/"
    return publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`
  }
}

export default ({ mode }) => {
  const isDevBuild = mode === 'dev'
  const outDir = isDevBuild ? 'dist/dev' : 'dist/release'

  // Keep Vue CLI-style env names (VUE_APP_*) + MAP_DEBUG.
  const envPrefix = ['VUE_APP_', 'MAP_']

  const base = normalizeBase(process.env.VUE_APP_PUBLIC_URL || '/')

  return {
    base,
    envPrefix,
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "sass:color";\n',
        },
      },
    },
    plugins: [
      generatedAssetsPlugin(),
      vue2(),
      !isDevBuild &&
        VitePWA({
          filename: 'service-worker.js',
          registerType: 'autoUpdate',
          includeAssets: [
            'favicon.ico',
            'browserconfig.xml',
            'robots.txt',
            'img/icons/*',
            'img/opengraph.*',
          ],
          manifest: {
            name: 'Interactive Map & Timeline of Roshar',
            short_name: 'Roshar Map',
            theme_color: '#0f3562',
            background_color: '#0f3562',
            icons: [
              { src: 'img/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: 'img/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
              {
                src: 'img/icons/android-chrome-maskable-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
              },
              {
                src: 'img/icons/android-chrome-maskable-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
              },
            ],
          },
          workbox: {
            skipWaiting: true,
            clientsClaim: true,
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            runtimeCaching: [
              {
                urlPattern: ({ request }) => request.mode === 'navigate',
                handler: 'NetworkFirst',
              },
              {
                urlPattern: ({ request, url }) =>
                  request.destination === 'image' || /\.(?:webp|png|jpe?g|dds)$/.test(url.pathname),
                handler: 'CacheFirst',
              },
              {
                urlPattern: ({ url }) => /\/assets\/.*lang-.*\.js$/.test(url.pathname),
                handler: 'CacheFirst',
              },
            ],
          },
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
        '@generated': path.resolve(process.cwd(), 'build', 'generated'),
      },
      extensions: ['.mjs', '.js', '.json', '.vue'],
    },
    server: {
      port: 10010,
    },
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: false,
      target: 'es2015',
    },
  }
}


