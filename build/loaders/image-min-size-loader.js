const fs = require('fs')
const sharp = require('sharp')
const loaderUtils = require('loader-utils')

class MinSizeError extends Error {
  constructor (message) {
    super(message)
    this.name = 'MinSizeError'
    this.stack = false
  }
}

async function checkSize (resourcePath, content, minWidth) {
  const sharpImage = sharp(Buffer.from(fs.readFileSync(resourcePath)))
  const { width: imageWidth } = await sharpImage.metadata()

  if (imageWidth < minWidth) {
    throw new MinSizeError(`Image must be at least ${minWidth}px wide!`)
  }

  return content
}

module.exports = function (content) {
  this.cacheable()
  const callback = this.async()

  const options = loaderUtils.getOptions(this)
  checkSize(this.resourcePath, content, options.minWidth)
    .then(result => callback(null, result))
    .catch(error => callback(error))
}

module.exports.raw = true
