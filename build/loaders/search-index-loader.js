const lunr = require('lunr')
require('lunr-languages/lunr.stemmer.support')(lunr)

lunr.tokenizer.separator = /[\s-[\](){}]+/

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable()
  }

  const messages = typeof source === 'string' ? JSON.parse(source) : source

  const searchable = ['events', 'locations', 'characters', 'misc']
  const index = lunr(function () {
    const lunrLanguage = messages['search-language']
    if (lunrLanguage !== 'en') {
      require(`lunr-languages/lunr.${lunrLanguage}`)(lunr)
      this.use(lunr[lunrLanguage])
    }

    this.ref('id')
    this.field('name', { boost: 4 })
    this.field('details')

    searchable.forEach((entryType) => {
      const entries = messages[entryType] ?? []
      Object.keys(entries).forEach(id => this.add({ ...entries[id], id: `${entryType}/${id}` }))
    })
  })

  return JSON.stringify(index)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
