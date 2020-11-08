module.exports = function parseSections (content, ignoreOutsideOfSections) {
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

    if (currentSection === undefined && ignoreOutsideOfSections === true) {
      return
    } else if (currentSection === undefined) {
      throw new Error('Line found outside of section')
    }

    currentSection.content += line + '\n'
  })

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
