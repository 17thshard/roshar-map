const path = require('path')
const fs = require('fs')
const parseSections = require('./parse-markdown-sections')

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable()
  }

  const lang = path.basename(this.resource, '.lang.json')

  const build = buildLangEntries.bind(this)
  const standardParser = parseStandardFile.bind(this)
  const eventParser = parseEventFile.bind(this)

  // Eval is safe here since we're getting things directly from the JSON "loader"
  // eslint-disable-next-line no-eval
  const messages = typeof source === 'string' ? JSON.parse(source) : source

  messages.events = build(lang, 'events', eventParser)
  messages.locations = build(lang, 'locations', standardParser)
  messages.characters = build(lang, 'characters', standardParser)
  messages.misc = build(lang, 'misc', standardParser)

  return JSON.stringify(messages)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function buildLangEntries (lang, type, parser) {
  const dirPath = path.resolve(__dirname, '..', '..', 'translations', lang, type)

  this.addContextDependency(dirPath)

  if (!fs.existsSync(dirPath)) {
    return undefined
  }

  const result = {}

  fs.readdirSync(dirPath, { withFileTypes: true }).filter(e => e.isFile() && e.name.endsWith('.md')).forEach((entry) => {
    const filePath = path.resolve(dirPath, entry.name)
    const entryId = entry.name.substring(0, entry.name.lastIndexOf('.md'))

    this.addDependency(filePath)

    result[entryId] = parser(lang, type, entryId, fs.readFileSync(filePath, 'utf8'))
  })

  return result
}

function parseEventFile (lang, type, id, content) {
  if (!content.startsWith('#')) {
    this.emitError(new Error(`Translation of events entry ${id} for locale '${lang}' does not start with name as Markdown heading`))
    return undefined
  }

  const { root, sections, metadata } = parseSections(content)

  if (root === undefined) {
    this.emitError(new Error(`Translation of ${type} entry ${id} for locale '${lang}' does not contain root section (started by level 1 heading)`))
    return undefined
  }

  const blurb = root.content.trim()
  const details = sections.details === undefined ? undefined : sections.details.content.trim()

  return { name: root.name, blurb, details, ...metadata }
}

function parseStandardFile (lang, type, id, content) {
  if (!content.startsWith('#')) {
    this.emitError(new Error(`Translation of events entry ${id} for locale '${lang}' does not start with name as Markdown heading`))
    return undefined
  }

  const { root, metadata } = parseSections(content)

  if (root === undefined) {
    this.emitError(new Error(`Translation of ${type} entry ${id} for locale '${lang}' does not contain root section (started by level 1 heading)`))
    return undefined
  }

  return { name: root.name, details: root.content.trim(), ...metadata }
}
