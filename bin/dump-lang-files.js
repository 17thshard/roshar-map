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

const locations = JSON.parse(fs.readFileSync('./src/store/locations.json', 'utf8'))
Object.values(locations).forEach((location) => {
  const path = `./translations/en/locations/${location.id}.md`

  if (fs.existsSync(path)) {
    return
  }

  fs.writeFileSync(path, `# ${location.id}\nDetails\n`)

  console.log(`Created new translation file for location ${location.id}`)
})
