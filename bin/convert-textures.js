const imagemin = require('imagemin')
const imageminWebp = require('imagemin-webp')

const textures = {
  map_bg: { hqWebpAvailable: true, lossy: true },
  map: { hqAvailable: true },
  shadesmar_map_bg: { lossy: true },
  transition: {},
  text_pattern: {},
  map_text: { hqAvailable: true },
  shadesmar_map_text: { hqAvailable: true },
  hover_text: {}
}

const basePath = './public/img/textures'

Promise.all(Object.keys(textures).flatMap((name) => {
  const texture = textures[name]

  const files = [`${basePath}/${name}.png`]
  if (texture.hqAvailable === true) {
    files.push(`${basePath}/hq_${name}.png`)
  }

  return imagemin(files, {
    destination: basePath,
    plugins: [imageminWebp({ quality: texture.lossy === true ? 90 : 100, lossless: texture.lossy !== true })]
  })
})).catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
}).then(() => {
  // eslint-disable-next-line no-console
  console.log('All textures converted successfully')
})
