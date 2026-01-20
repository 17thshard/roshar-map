import isMobile from 'is-mobile'
import { LinearFilter, RGBAFormat, TextureLoader, WebGLUtils } from 'three'
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader'

const textureUrls = import.meta.glob('/src/assets/textures/**/*', {
  eager: true,
  query: '?url',
  import: 'default'
})

function resolveTextureUrl (relativePath) {
  const key = `/src/assets/textures/${relativePath}`
  const url = textureUrls[key]
  if (!url) {
    throw new Error(`Missing texture asset: ${relativePath}`)
  }
  return url
}

/**
 * Manages texture loading and texture paths.
 */
export default class TextureManager {
  /**
   * @param {object} renderer - The Three.js renderer.
   * @param {string} locale - The current locale.
   */
  constructor (renderer, locale) {
    const maxTextureSize = renderer.capabilities.maxTextureSize
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    this.useHq = maxTextureSize >= 8192 && !isMobile({ tablet: true, featureDetect: true }) && !isSafari
    this.webpPromise = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        this.webpSupported = true
        resolve()
      }
      img.onerror = () => {
        this.webpSupported = false
        resolve()
      }
      img.src = 'data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA=='
    })
    const context = renderer.getContext()
    this.utils = new WebGLUtils(context, renderer.extensions, renderer.capabilities)
    this.supportedCompressionFormats = context.getExtension('WEBGL_compressed_texture_s3tc')
      ? context.getParameter(context.COMPRESSED_TEXTURE_FORMATS)
      : []
    this.locale = locale
  }

  /**
   * Builds the path for a texture.
   * @param {string} prefix - Prefix for the texture name.
   * @param {string} name - Base name of the texture.
   * @param {boolean} localized - Whether the texture is localized.
   * @param {boolean} lossy - Whether to use lossy compression.
   * @param {string} compressedFormat - The compressed format (e.g., 'dxt').
   * @returns {string} - The constructed path.
   */
  buildPath (prefix, name, localized, lossy, compressedFormat) {
    const fallbackExt = lossy === true && (localized === undefined || localized === false) ? 'jpg' : 'png'
    const uncompressedExt = this.webpSupported ? 'webp' : fallbackExt
    const ext = this.supportsCompression(compressedFormat) ? 'dds' : uncompressedExt
    const base = `${prefix}${name}.${ext}`

    if (localized === undefined || localized === false) {
      return `${lossy ? 'lossy' : 'lossless'}/${base}`
    }

    return `localized/${this.locale}/${base}`
  }

  /**
   * Checks if a compression format is supported.
   * @param {string} format - The compression format.
   * @returns {boolean} - True if supported, false otherwise.
   */
  supportsCompression (format) {
    return format !== undefined && this.supportedCompressionFormats.includes(this.utils.convert(format))
  }

  /**
   * Loads a set of textures.
   * @param {object} textures - Object where keys are texture names and values are texture configurations.
   * @returns {Promise<object>} - Promise resolving to the loaded textures map.
   */
  load (textures) {
    const result = {}

    const textureLoader = new TextureLoader()
    const compressedTextureLoader = new DDSLoader()

    return this.webpPromise.then(() => new Promise((resolve, reject) => {
      Object.keys(textures).forEach((name) => {
        const texture = textures[name]

        const prefix = (texture.hqAvailable || (texture.hqWebpAvailable && this.webpSupported)) && this.useHq ? 'hq_' : ''
        const path = this.buildPath(prefix, name, texture.localized, texture.lossy, texture.compressedPixelFormat)

        const compressed = this.supportsCompression(texture.compressedPixelFormat)
        const loader = compressed ? compressedTextureLoader : textureLoader
        loader.load(
          resolveTextureUrl(path),
          (data) => {
            texture.loaded = true
            const basePixelFormat = texture.pixelFormat ?? RGBAFormat
            data.format = compressed ? texture.compressedPixelFormat : basePixelFormat
            data.minFilter = LinearFilter

            if (texture.options !== undefined) {
              Object.keys(texture.options).forEach((key) => {
                data[key] = texture.options[key]
              })
            }

            result[name] = data

            if (Object.keys(textures).every(t => textures[t].loaded === true)) {
              resolve(result)
            }
          },
          undefined,
          errorEvent => reject(new Error(`Could not load texture '${name}': ${errorEvent.message}`))
        )
      })
    }))
  }

  /**
   * Loads raw texture data.
   * @param {string} name - Texture name.
   * @param {boolean} hqAvailable - Whether high quality is available.
   * @param {boolean} localized - Whether it is localized.
   * @param {boolean} lossy - Whether it is lossy.
   * @param {string} channelsToKeep - String of channels to keep (e.g. "rgba").
   * @returns {Promise<{width: number, height: number, data: Uint8ClampedArray|Array}>} - The loaded data.
   */
  loadData (name, hqAvailable, localized, lossy, channelsToKeep) {
    const channels = {}
    channelsToKeep.split('').forEach((c) => {
      channels[c] = channelsToKeep.indexOf(c)
    })

    const channelNames = Object.keys(channels)

    return this.webpPromise.then(() => new Promise((resolve, reject) => {
      const image = new Image()

      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)

        const raw = ctx.getImageData(0, 0, canvas.width, canvas.height)

        canvas.remove()

        const data = channelNames.length < 4 ? new Array(channelNames.length * raw.width * raw.height) : raw.data

        if (channelNames.length < 4) {
          for (let i = 0; i < raw.data.length / 4; i++) {
            if (channels.r !== undefined) {
              data[i * channelNames.length + channels.r] = raw.data[i * 4]
            }
            if (channels.g !== undefined) {
              data[i * channelNames.length + channels.g] = raw.data[i * 4 + 1]
            }
            if (channels.b !== undefined) {
              data[i * channelNames.length + channels.b] = raw.data[i * 4 + 2]
            }
            if (channels.a !== undefined) {
              data[i * channelNames.length + channels.a] = raw.data[i * 4 + 3]
            }
          }
        }

        resolve({ width: raw.width, height: raw.height, data })
      }

      image.onerror = errorEvent => reject(new Error(`Could not load texture '${name}': ${errorEvent.message}`))

      const path = this.buildPath(hqAvailable && this.useHq ? 'hq_' : '', name, localized, false)

      image.src = resolveTextureUrl(path)
    }))
  }
}
