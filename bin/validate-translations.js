/* eslint-disable no-console */
const fs = require('fs')

const events = JSON.parse(fs.readFileSync('./src/store/events.json', 'utf8')).map(e => e.id)
const locations = JSON.parse(fs.readFileSync('./src/store/locations.json', 'utf8')).map(l => l.id)

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

function checkLang (lang) {
  console.log(`Validating translations for locale '${lang}'`)

  checkLangFiles(lang, 'events', events)
  checkLangFiles(lang, 'locations', locations)
}

function checkLangFiles (lang, type, reference) {
  const dirPath = `./translations/${lang}/${type}`

  if (!fs.existsSync(dirPath)) {
    return
  }

  fs.readdirSync(dirPath, { withFileTypes: true }).filter(e => e.isFile() && e.name.endsWith('.md')).forEach((entry) => {
    const entryId = entry.name.substring(0, entry.name.lastIndexOf('.md'))

    if (!reference.includes(entryId)) {
      console.error(`Found ${type} translation for unknown ID '${entryId}' in locale '${lang}'`)
      errors = true
    }
  })
}
