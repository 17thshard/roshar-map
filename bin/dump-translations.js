 
const fs = require('fs')

const events = JSON.parse(fs.readFileSync('./src/store/events.json', 'utf8'))
fs.mkdirSync(`./translations/en/events`, { recursive: true })
events.forEach((event) => {
  const path = `./translations/en/events/${event.id}.md`

  if (fs.existsSync(path)) {
    return
  }

  fs.writeFileSync(
    path,
    `# ${event.id}\nBlurb\n\n## Details\nDetails\n##Metadata\n| Field | Value |\n| ----- | ----- |\n| chapter | n/a |\n`
  )

  console.log(`Created new translation file for event ${event.id}`)
})

function dump (type) {
  const entries = JSON.parse(fs.readFileSync(`./src/store/${type}.json`, 'utf8'))
  fs.mkdirSync(`./translations/en/${type}`, { recursive: true })
  entries.forEach((entry) => {
    const path = `./translations/en/${type}/${entry.id}.md`

    if (fs.existsSync(path)) {
      return
    }

    fs.writeFileSync(path, `# ${entry.id}\nDetails\n`)

    console.log(`Created new translation file for ${type} entry ${entry.id}`)
  })
}

dump('locations')
dump('characters')
dump('misc')
