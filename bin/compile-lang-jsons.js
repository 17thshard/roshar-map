/* eslint-disable no-console */
const fs = require('fs')

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

  return { name: root.name, details: root.content.trim(), ...metadata }
}

function parseSections (content) {
  let root
  const sections = {}
  const lines = content.split('\n')

  let currentSection
  lines.forEach((line) => {
    const headerMatch = line.trim().match(/^(#+)\s+(.*?)$/)
    if (headerMatch != null) {
      const [, hashes, name] = headerMatch

      if (hashes.length === 1) {
        currentSection = { name: name.trim(), content: '' }

        root = currentSection
      } else {
        currentSection = { content: '' }
        sections[name.toLowerCase().trim()] = currentSection
      }

      return
    }

    if (currentSection === undefined) {
      throw new Error('Line found outside of section')
    }

    currentSection.content += line + '\n'
  })

  if (root === undefined) {
    throw new Error('Markdown file did not contain root section (started by level 1 heading)')
  }

  const metadata = {}
  if (sections.metadata) {
    sections.metadata.content.split('\n').filter(line => line.trim().startsWith('|')).slice(2).forEach((line) => {
      const match = line.trim().match(/^\|([^|]+)\|([^|]+)\|$/)

      if (match !== null) {
        metadata[match[1].trim()] = match[2].trim()
      }
    })
  }

  return { root, sections, metadata }
}
