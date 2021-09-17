const sharp = require('sharp')
const loaderUtils = require('loader-utils')

async function resize (content, maxWidth) {
  const sharpImage = sharp(Buffer.from(content))
  const { width: imageWidth } = await sharpImage.metadata()

  if (imageWidth <= maxWidth) {
    return content
  }

  return await sharpImage.resize({ width: maxWidth }).toBuffer()
}

module.exports = function (content) {
  const callback = this.async()

  resize(content, loaderUtils.getOptions(this).maxWidth || 1000)
    .then(result => callback(null, result))
    .catch(error => callback(error, undefined))
}

module.exports.raw = true
