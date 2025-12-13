 
const fs = require('fs')

const events = JSON.parse(fs.readFileSync('./src/store/events.json', 'utf8')).map(e => e.id)
const locations = JSON.parse(fs.readFileSync('./src/store/locations.json', 'utf8')).map(l => l.id)
const characters = JSON.parse(fs.readFileSync('./src/store/characters.json', 'utf8')).map(l => l.id)
const misc = JSON.parse(fs.readFileSync('./src/store/misc.json', 'utf8')).map(l => l.id)
const allReference = new Set([
  ...events.map(name => `events/${name}`),
  ...locations.map(name => `locations/${name}`),
  ...characters.map(name => `characters/${name}`),
  ...misc.map(name => `misc/${name}`)
])

let errors = false

const langs = fs.readdirSync('./translations', { withFileTypes: true })
langs.forEach((entry) => {
  if (!entry.isDirectory()) {
    return
  }

  checkLang(entry.name)
})

if (errors) {
  console.error('Not all translations were valid!')
  process.exit(1)
}

function checkLang(lang) {
  console.log(`Validating translations for locale '${lang}'`)

  checkLangFiles(lang, 'events', events)
  checkLangFiles(lang, 'locations', locations)
  checkLangFiles(lang, 'characters', characters)
  checkLangFiles(lang, 'misc', misc)
}

function checkLangFiles(lang, type, reference) {
  const dirPath = `./translations/${lang}/${type}`

  if (!fs.existsSync(dirPath)) {
    return
  }

  fs.readdirSync(dirPath, { withFileTypes: true }).filter(e => e.isFile() && e.name.endsWith('.md')).forEach((entry) => {
    const entryId = entry.name.substring(0, entry.name.lastIndexOf('.md'))

    if (!reference.includes(entryId)) {
      console.error(`Found translation for unknown ${type} entry '${entryId}' in locale '${lang}'`)
      errors = true
    }
    const fullPath = `${dirPath}/${entry.name}`
    const content = fs.readFileSync(fullPath).toString()
    const links = [...content.matchAll(/[^_]\[[^\]]*\]\(([^)]*)\)/g)].flat().filter((_, i) => i % 2 === 1)
    links.forEach((link) => {
      if (!link.startsWith('http') && !allReference.has(link)) {
        console.error(`Found broken link ${link} in file ${fullPath}`)
        errors = true
      }
    })
  })
}
