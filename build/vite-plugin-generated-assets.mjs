import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// CJS deps
const markdown = require('simple-markdown')
const lunr = require('lunr')
require('lunr-languages/lunr.stemmer.support')(lunr)
const parseSections = require('./loaders/parse-markdown-sections')

lunr.tokenizer.separator = /[\s-[\](){}]+/

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function writeFileIfChanged(filePath, content) {
  ensureDir(path.dirname(filePath))

  try {
    const existing = fs.readFileSync(filePath, 'utf8')
    if (existing === content) return false
  } catch {
    // doesn't exist
  }

  fs.writeFileSync(filePath, content)
  return true
}

function removeDuplicates(token, index, tokens) {
  const [position] = token.metadata.position
  for (let i = index - 1; i >= 0 && tokens[i].metadata.position[0] === position; i--) {
    if (tokens[i].toString() === token.toString()) return null
  }
  return token
}

lunr.Pipeline.registerFunction(removeDuplicates, 'remove-duplicates')

function nGramTokenizer(obj, metadata) {
  if (obj === null || obj === undefined) return []
  if (Array.isArray(obj)) {
    return obj.map((t) => new lunr.Token(lunr.utils.asString(t).toLowerCase(), lunr.utils.clone(metadata)))
  }

  const str = obj.toString().toLowerCase()
  const len = str.length
  const tokens = []

  for (let sliceEnd = 0, sliceStart = 0; sliceEnd <= len; sliceEnd++) {
    const char = str.charAt(sliceEnd)
    const sliceLength = sliceEnd - sliceStart

    if ((char.match(lunr.tokenizer.separator) || sliceEnd === len)) {
      if (sliceLength > 0) {
        const tokenMetadata = lunr.utils.clone(metadata) || {}
        tokenMetadata.position = [sliceStart, sliceLength]
        tokenMetadata.index = tokens.length

        const baseToken = str.slice(sliceStart, sliceEnd)
        if (baseToken.length <= 3) {
          tokens.push(new lunr.Token(baseToken, tokenMetadata))
        } else {
          for (let i = 3; i <= baseToken.length; i++) {
            const meta = lunr.utils.clone(tokenMetadata)
            meta.position = [sliceStart, i]
            meta.index = tokens.length
            tokens.push(new lunr.Token(baseToken.slice(0, i), meta))
          }
        }
      }
      sliceStart = sliceEnd + 1
    }
  }

  return tokens
}

function buildLangEntries(rootDir, lang, type, parser) {
  const dirPath = path.join(rootDir, 'translations', lang, type)
  if (!fs.existsSync(dirPath)) return undefined

  const result = {}
  fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(e => e.isFile() && e.name.endsWith('.md'))
    .forEach((entry) => {
      const filePath = path.join(dirPath, entry.name)
      const entryId = entry.name.substring(0, entry.name.lastIndexOf('.md'))
      result[entryId] = parser(lang, type, entryId, fs.readFileSync(filePath, 'utf8'))
    })

  return result
}

function parseEventFile(lang, type, id, content) {
  if (!content.startsWith('#')) {
    throw new Error(`Translation of ${type} entry ${id} for locale '${lang}' does not start with name as Markdown heading`)
  }
  const { root, sections, metadata } = parseSections(content)
  if (root === undefined) {
    throw new Error(`Translation of ${type} entry ${id} for locale '${lang}' does not contain root section (started by level 1 heading)`)
  }
  const blurb = root.content.trim()
  const details = sections.details === undefined ? undefined : sections.details.content.trim()
  return { name: root.name, blurb, details, ...metadata }
}

function parseStandardFile(lang, type, id, content) {
  if (!content.startsWith('#')) {
    throw new Error(`Translation of ${type} entry ${id} for locale '${lang}' does not start with name as Markdown heading`)
  }
  const { root, metadata } = parseSections(content)
  if (root === undefined) {
    throw new Error(`Translation of ${type} entry ${id} for locale '${lang}' does not contain root section (started by level 1 heading)`)
  }
  return { name: root.name, details: root.content.trim(), ...metadata }
}

function generateLang(rootDir) {
  const langDir = path.join(rootDir, 'src', 'lang')
  const outDir = path.join(rootDir, 'build', 'generated', 'lang')
  ensureDir(outDir)

  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.lang.json'))
  let changed = 0

  files.forEach((fileName) => {
    const lang = path.basename(fileName, '.lang.json')
    const baseMessages = JSON.parse(fs.readFileSync(path.join(langDir, fileName), 'utf8'))

    baseMessages.events = buildLangEntries(rootDir, lang, 'events', parseEventFile)
    baseMessages.locations = buildLangEntries(rootDir, lang, 'locations', parseStandardFile)
    baseMessages.characters = buildLangEntries(rootDir, lang, 'characters', parseStandardFile)
    baseMessages.misc = buildLangEntries(rootDir, lang, 'misc', parseStandardFile)

    const didWrite = writeFileIfChanged(path.join(outDir, fileName), JSON.stringify(baseMessages, null, 2))
    if (didWrite) changed++
  })

  return { files: files.length, changed }
}

function generateCredits(rootDir) {
  const readmePath = path.join(rootDir, 'README.md')
  const readme = parseSections(fs.readFileSync(readmePath, 'utf8'), true)

  if (readme.sections.credits === undefined) {
    throw new Error('README file does not contain credits section')
  }

  const markdownRules = {
    ...markdown.defaultRules,
    paragraph: {
      ...markdown.defaultRules.paragraph,
      html(node, output, state) {
        return markdown.htmlTag('p', output(node.content, state))
      },
    },
  }

  const parser = markdown.parserFor(markdownRules)
  const renderer = markdown.outputFor(markdownRules, 'html')
  const html = renderer(parser(readme.sections.credits.content))

  const outPath = path.join(rootDir, 'build', 'generated', 'credits.js')
  const didWrite = writeFileIfChanged(outPath, `export default ${JSON.stringify(html)};\n`)
  return { changed: didWrite ? 1 : 0 }
}

function loadStoreMap(rootDir, key) {
  const filePath = path.join(rootDir, 'src', 'store', `${key}.json`)
  const list = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return list.reduce((acc, entry) => {
    acc[entry.id] = entry
    return acc
  }, {})
}

function generateSearchIndex(rootDir) {
  const langDir = path.join(rootDir, 'build', 'generated', 'lang')
  const outDir = path.join(rootDir, 'build', 'generated', 'search-index')
  ensureDir(outDir)

  const store = {
    events: loadStoreMap(rootDir, 'events'),
    locations: loadStoreMap(rootDir, 'locations'),
    characters: loadStoreMap(rootDir, 'characters'),
    misc: loadStoreMap(rootDir, 'misc'),
  }

  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.lang.json'))
  let changed = 0

  files.forEach((fileName) => {
    const lang = path.basename(fileName, '.lang.json')
    const messages = JSON.parse(fs.readFileSync(path.join(langDir, fileName), 'utf8'))

    const index = lunr(function () {
      const lunrLanguage = messages['search-language']
      this.tokenizer = nGramTokenizer

      if (lunrLanguage && lunrLanguage !== 'en') {
        // best-effort; if missing we still build an index
        try {
          require(`lunr-languages/lunr.${lunrLanguage}`)(lunr)
          this.use(lunr[lunrLanguage])
        } catch {}
      }

      this.pipeline.add(removeDuplicates)
      this.ref('id')
      this.field('name', { boost: 10 })
      this.field('details')
      this.field('artist')

      Object.entries(store).forEach(([entryType, entryData]) => {
        const entries = messages[entryType] ?? []
        Object.keys(entries).forEach((id) => {
          const entry = entryData[id]
          let artist
          if (entry !== undefined && entry.image !== undefined && entry.image.credits !== undefined) {
            const markdownResult = /^\[([^\]]+)]\(.*\)$/.exec(entry.image.credits)
            artist = markdownResult !== null ? markdownResult[1] : entry.image.credits
          }

          this.add(
            { ...entries[id], id: `${entryType}/${id}`, artist },
            { boost: entryType !== 'events' ? 2 : 1 }
          )
        })
      })
    })

    const didWrite = writeFileIfChanged(path.join(outDir, `${lang}.json`), JSON.stringify(index))
    if (didWrite) changed++
  })

  return { files: files.length, changed }
}

async function runGenerate({ rootDir, logger, what }) {
  // `what` is a Set of 'lang' | 'credits' | 'search'
  const start = Date.now()
  try {
    let changed = 0

    if (what.has('lang')) {
      const res = generateLang(rootDir)
      changed += res.changed
      // search index depends on generated lang files; if we generated lang, also generate search.
      what.add('search')
      logger?.info?.(`[generated-assets] lang: ${res.files} file(s), ${res.changed} updated`)
    }

    if (what.has('credits')) {
      const res = generateCredits(rootDir)
      changed += res.changed
      logger?.info?.(`[generated-assets] credits: ${res.changed ? 'updated' : 'unchanged'}`)
    }

    if (what.has('search')) {
      const res = generateSearchIndex(rootDir)
      changed += res.changed
      logger?.info?.(`[generated-assets] search-index: ${res.files} file(s), ${res.changed} updated`)
    }

    logger?.info?.(`[generated-assets] done in ${Date.now() - start}ms${changed ? '' : ' (no changes)'}`)
    return { changed }
  } catch (e) {
    logger?.error?.(`[generated-assets] failed: ${e?.stack || e}`)
    throw e
  }
}

export function generatedAssetsPlugin() {
  let config
  let rootDir

  // Simple debounce across rapid file changes (e.g. git checkout).
  let pending = null
  let queuedWhat = new Set()

  const queue = (what, server) => {
    what.forEach(w => queuedWhat.add(w))
    if (pending) clearTimeout(pending)
    pending = setTimeout(async () => {
      const toRun = queuedWhat
      queuedWhat = new Set()
      pending = null
      const res = await runGenerate({ rootDir, logger: config?.logger, what: toRun })
      if (server && res.changed > 0) server.ws.send({ type: 'full-reload' })
    }, 80)
  }

  return {
    name: 'roshar-map:generated-assets',
    enforce: 'pre',
    configResolved(resolved) {
      config = resolved
      rootDir = resolved.root || process.cwd()
    },
    async buildStart() {
      // Always ensure generated assets are up to date for both `vite build` and `vite dev`.
      await runGenerate({ rootDir, logger: config?.logger, what: new Set(['lang', 'credits', 'search']) })
    },
    async configureServer(server) {
      // Watch sources and regenerate on change.
      const watchTargets = [
        path.join(rootDir, 'src', 'lang'),
        path.join(rootDir, 'translations'),
        path.join(rootDir, 'src', 'store'),
        path.join(rootDir, 'README.md'),
        path.join(rootDir, 'build', 'loaders', 'parse-markdown-sections.js'),
      ]

      server.watcher.add(watchTargets)

      const onFsEvent = (file) => {
        const normalized = file.replaceAll('\\', '/')
        if (normalized.includes('/build/generated/')) return

        if (normalized.endsWith('/README.md')) {
          queue(new Set(['credits']), server)
          return
        }
        if (normalized.includes('/src/store/') && normalized.endsWith('.json')) {
          queue(new Set(['search']), server)
          return
        }
        if ((normalized.includes('/src/lang/') && normalized.endsWith('.lang.json')) || normalized.includes('/translations/') || normalized.endsWith('/parse-markdown-sections.js')) {
          queue(new Set(['lang']), server)
          return
        }
      }

      // chokidar events
      server.watcher.on('add', onFsEvent)
      server.watcher.on('change', onFsEvent)
      server.watcher.on('unlink', onFsEvent)
    },
  }
}


