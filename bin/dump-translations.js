/* eslint-disable no-console */
const fs = require('fs')

const events = JSON.parse(fs.readFileSync('./src/store/events.json', 'utf8'))
events.forEach((event) => {
  const path = `./translations/en/events/${event.id}.md`

  if (fs.existsSync(path)) {
    return
  }

  let data = `# ${event.id}\nBlurb\n`

  if (event.details) {
    data += '\n## Details\nDetails\n'
  }

  fs.writeFileSync(path, data)

  console.log(`Created new translation file for event ${event.id}`)
})

function dump (type) {
  const entries = JSON.parse(fs.readFileSync(`./src/store/${type}.json`, 'utf8'))
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
