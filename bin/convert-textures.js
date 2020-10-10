/* eslint-disable no-console */
const childProcess = require('child_process')
const imagemin = require('imagemin')
const imageminWebp = require('imagemin-webp')
const imageminZopfli = require('imagemin-zopfli')

const textures = {
  map_bg: { lossy: true },
  map: { hqAvailable: true },
  shadesmar_map_bg: { lossy: true },
  transition: {},
  text_pattern: {},
  map_text: { hqAvailable: true },
  shadesmar_map_text: { hqAvailable: true },
  hover_text: {},
  factions: { hqAvailable: true },
  oathgates_silver_kingdoms: { hqAvailable: true }
}

const basePath = './public/img/textures'
const webpOnly = process.argv.slice(2)[0] === '--webp-only'

Promise.all(Object.keys(textures).flatMap((name) => {
  const texture = textures[name]

  const files = [`${basePath}/${name}.png`]
  if (texture.hqAvailable === true) {
    files.push(`${basePath}/hq_${name}.png`)
  }

  const changedFiles = files.filter(path => childProcess.execSync(`git status -s ${path}`).toString().length > 0)

  if (changedFiles.length === 0) {
    console.log(`Files for texture '${name}' haven't changed, ignoring...`)
    return
  }

  console.log(`Optimizing and converting texture '${name}'...`)

  return (webpOnly ? new Promise(resolve => resolve()) : imagemin(changedFiles, {
    destination: basePath,
    plugins: [
      imageminZopfli({ more: true })
    ]
  })).then(() => {
    console.log(`Optimized PNGs for texture '${name}'`)

    return imagemin(changedFiles, {
      destination: basePath,
      plugins: [
        imageminWebp({ quality: texture.lossy === true ? 90 : 100, lossless: texture.lossy !== true })
      ]
    })
  }).then(() => {
    console.log(`Converted texture '${name}' to WEBP`)
  })
})).catch((error) => {
  console.error(error)
}).then(() => {
  console.log('All textures optimized and converted successfully')
})
