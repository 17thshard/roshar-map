/* eslint-disable no-console */
const childProcess = require('child_process')
const { lstatSync, readdirSync } = require('fs')
const path = require('path')
const imagemin = require('imagemin')
const imageminWebp = require('imagemin-webp')
const imageminZopfli = require('imagemin-zopfli')

const isDirectory = source => lstatSync(path.resolve(source)).isDirectory()

const textures = {
  map_bg: { lossy: true },
  map: { hqAvailable: true },
  shadesmar_map_bg: { lossy: true },
  transition: {},
  text_pattern: {},
  map_text: { hqAvailable: true, localized: true },
  shadesmar_map_text: { hqAvailable: true, localized: true },
  hover_text: { localized: true },
  factions: { hqAvailable: true },
  oathgates_text: { hqAvailable: true, localized: true },
  silver_kingdoms: { hqAvailable: true },
  silver_kingdoms_text: { hqAvailable: true, localized: true }
}

const basePath = './src/assets/textures'
const webpOnly = process.argv.slice(2)[0] === '--webp-only'
const locales = readdirSync(path.resolve(`${basePath}/localized`)).filter(locale => isDirectory(`${basePath}/localized/${locale}`))

Promise.all(Object.keys(textures).flatMap((name) => {
  const texture = textures[name]
  const transformed = []

  if (texture.localized) {
    locales.forEach((locale) => {
      const files = [`${basePath}/localized/${locale}/${name}.png`]
      if (texture.hqAvailable === true) {
        files.push(`${basePath}/localized/${locale}/hq_${name}.png`)
      }
      transformed.push({ ...texture, name: `${name}[${locale}]`, files, destination: `${basePath}/localized/${locale}` })
    })
  } else {
    const files = [`${basePath}/${name}.png`]
    if (texture.hqAvailable === true) {
      files.push(`${basePath}/hq_${name}.png`)
    }
    transformed.push({ ...texture, name, files, destination: basePath })
  }

  return transformed
}).flatMap((texture) => {
  const { name } = texture

  const changedFiles = texture.files.filter(path => childProcess.execSync(`git status -s ${path}`).toString().length > 0)

  if (changedFiles.length === 0) {
    console.log(`Files for texture '${name}' haven't changed, ignoring...`)
    return
  }

  console.log(`Optimizing and converting texture '${name}'...`)

  return (webpOnly ? new Promise(resolve => resolve()) : imagemin(changedFiles, {
    destination: texture.destination,
    plugins: [
      imageminZopfli({ more: true })
    ]
  })).then(() => {
    console.log(`Optimized PNGs for texture '${name}'`)

    return imagemin(changedFiles, {
      destination: texture.destination,
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
