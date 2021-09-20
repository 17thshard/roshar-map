const lunr = require('lunr')
require('lunr-languages/lunr.stemmer.support')(lunr)

lunr.tokenizer.separator = /[\s-[\](){}]+/

function removeDuplicates (token, index, tokens) {
  const [position] = token.metadata.position

  for (let i = index - 1; i >= 0 && tokens[i].metadata.position[0] === position; i--) {
    if (tokens[i].toString() === token.toString()) {
      return null
    }
  }

  return token
}

lunr.Pipeline.registerFunction(removeDuplicates, 'remove-duplicates')

function nGramTokenizer (obj, metadata) {
  if (obj === null || obj === undefined) {
    return []
  }

  if (Array.isArray(obj)) {
    return obj.map(function (t) {
      return new lunr.Token(
        lunr.utils.asString(t).toLowerCase(),
        lunr.utils.clone(metadata)
      )
    })
  }

  const str = obj.toString().toLowerCase()
  const len = str.length
  const tokens = []

  for (let sliceEnd = 0, sliceStart = 0; sliceEnd <= len; sliceEnd++) {
    const char = str.charAt(sliceEnd)
    const sliceLength = sliceEnd - sliceStart

    if ((char.match(lunr.tokenizer.separator) || sliceEnd === len)) {
      if (sliceLength > 0) {
        const tokenMetadata = lunr.utils.clone(metadata) || {}
        tokenMetadata.position = [sliceStart, sliceLength]
        tokenMetadata.index = tokens.length

        const baseToken = str.slice(sliceStart, sliceEnd)
        if (baseToken.length <= 3) {
          tokens.push(new lunr.Token(baseToken, tokenMetadata))
        } else {
          for (let i = 3; i <= baseToken.length; i++) {
            const meta = lunr.utils.clone(tokenMetadata)
            meta.position = [sliceStart, i]
            meta.index = tokens.length

            tokens.push(new lunr.Token(baseToken.slice(0, i), meta))
          }
        }
      }

      sliceStart = sliceEnd + 1
    }
  }

  return tokens
}

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable()
  }

  const messages = typeof source === 'string' ? JSON.parse(source) : source

  const searchable = ['events', 'locations', 'characters', 'misc']
  const index = lunr(function () {
    const lunrLanguage = messages['search-language']
    this.tokenizer = nGramTokenizer
    if (lunrLanguage !== 'en') {
      require(`lunr-languages/lunr.${lunrLanguage}`)(lunr)
      this.use(lunr[lunrLanguage])
    }

    this.pipeline.add(removeDuplicates)

    this.ref('id')
    this.field('name', { boost: 10 })
    this.field('details')

    searchable.forEach((entryType) => {
      const entries = messages[entryType] ?? []
      Object.keys(entries).forEach(id => this.add({ ...entries[id], id: `${entryType}/${id}` }, { boost: entryType !== 'events' ? 2 : 1 }))
    })
  })

  return JSON.stringify(index)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
