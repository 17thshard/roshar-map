const fs = require('fs')
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

  this.async()

  const messages = typeof source === 'string' ? JSON.parse(source) : source
  const load = async (key) => {
    const path = await new Promise((resolve, reject) => this.resolve(
      this.rootContext,
      `@/store/${key}.json`,
      (error, result) => error !== null ? reject(error) : resolve(result)
    ))
    this.addDependency(path)
    return JSON.parse(fs.readFileSync(path)).reduce(
      (acc, entry) => {
        acc[entry.id] = entry
        return acc
      },
      {}
    )
  }

  async function buildIndex () {
    const searchable = (await Promise.all(['events', 'locations', 'characters', 'misc'].map(async key => ({
      key,
      value: await load(key)
    })))).reduce(
      (acc, entry) => {
        acc[entry.key] = entry.value
        return acc
      },
      {}
    )
    return lunr(function () {
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
      this.field('artist')

      Object.entries(searchable).forEach(([entryType, entryData]) => {
        const entries = messages[entryType] ?? []
        Object.keys(entries).forEach((id) => {
          const entry = entryData[id]
          let artist
          if (entry !== undefined && entry.image !== undefined && entry.image.credits !== undefined) {
            const markdownResult = /^\[([^\]]+)]\(.*\)$/.exec(entry.image.credits)
            artist = markdownResult !== null ? markdownResult[1] : entry.image.credits
          }
          this.add(
            { ...entries[id], id: `${entryType}/${id}`, artist },
            { boost: entryType !== 'events' ? 2 : 1 }
          )
        })
      })
    })
  }

  buildIndex()
    .then(index =>
      this.callback(
        null,
        JSON.stringify(index)
          .replace(/\u2028/g, '\\u2028')
          .replace(/\u2029/g, '\\u2029')
      )
    )
    .catch(error => this.callback(error))
}
