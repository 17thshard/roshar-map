/* eslint-disable no-console */
const fs = require('fs')
const parseSections = require('../src/parse-markdown-sections')

const destPath = './build/lang'

fs.mkdirSync(destPath, { recursive: true })

const langs = fs.readdirSync('./translations', { withFileTypes: true })
langs.forEach((entry) => {
  if (!entry.isDirectory()) {
    return
  }

  handleLang(entry.name)
})

function handleLang (lang) {
  console.log(`Compiling language JSON for locale '${lang}'`)

  const path = `./src/lang/${lang}.json`

  if (!fs.existsSync(path)) {
    console.error(`Could not find language JSON for locale '${lang}'`)
    process.exit(1)
  }

  const messages = JSON.parse(fs.readFileSync(path, 'utf8'))

  messages.events = buildLangEntries(lang, 'events', parseEventFile)
  messages.locations = buildLangEntries(lang, 'locations', parseStandardFile)
  messages.characters = buildLangEntries(lang, 'characters', parseStandardFile)
  messages.misc = buildLangEntries(lang, 'misc', parseStandardFile)

  const langDestPath = `${destPath}/${lang}.json`

  fs.writeFileSync(langDestPath, JSON.stringify(messages, undefined, 4))

  console.log(`Wrote language JSON for locale '${lang}' to '${langDestPath}'`)
}

function buildLangEntries (lang, type, parser) {
  const dirPath = `./translations/${lang}/${type}`

  if (!fs.existsSync(dirPath)) {
    return undefined
  }

  const result = {}

  console.log(`Compiling translations of ${type} for locale '${lang}'...`)

  fs.readdirSync(dirPath, { withFileTypes: true }).filter(e => e.isFile() && e.name.endsWith('.md')).forEach((entry) => {
    const entryId = entry.name.substring(0, entry.name.lastIndexOf('.md'))

    result[entryId] = parser(lang, type, entryId, fs.readFileSync(`${dirPath}/${entry.name}`, 'utf8'))
  })

  return result
}

function parseEventFile (lang, type, id, content) {
  if (!content.startsWith('#')) {
    console.error(`Translation of events entry ${id} for locale '${lang}' does not start with name as Markdown heading`)
    process.exit(1)
  }

  const { root, sections, metadata } = parseSections(content)

  if (root === undefined) {
    throw new Error(`Translation of ${type} entry ${id} for locale '${lang}' does not contain root section (started by level 1 heading)`)
  }

  const blurb = root.content.trim()
  const details = sections.details === undefined ? undefined : sections.details.content.trim()

  return { name: root.name, blurb, details, ...metadata }
}

function parseStandardFile (lang, type, id, content) {
  if (!content.startsWith('#')) {
    console.error(`Translation of ${type} entry ${id} for locale '${lang}' does not start with name as Markdown heading`)
    process.exit(1)
  }

  const { root, metadata } = parseSections(content)

  if (root === undefined) {
    throw new Error(`Translation of ${type} entry ${id} for locale '${lang}' does not contain root section (started by level 1 heading)`)
  }

  return { name: root.name, details: root.content.trim(), ...metadata }
}
