const path = require('path')
const fs = require('fs')
const markdown = require('simple-markdown')
const parseSections = require('./parse-markdown-sections')

const targetText = '<!-- CREDITS_TEXT -->'

module.exports = function (content) {
  if (!content.includes(targetText)) {
    return content
  }

  this.addDependency(path.resolve(__dirname, '../../README.md'))

  const readme = parseSections(fs.readFileSync('README.md', 'utf8'), true)

  if (readme.sections.credits === undefined) {
    this.emitError(new Error('README file doesn\'t contain credits section'))
    return
  }

  const markdownRules = {
    ...markdown.defaultRules,
    paragraph: {
      ...markdown.defaultRules.paragraph,
      html (node, output, state) {
        return markdown.htmlTag('p', output(node.content, state))
      }
    }
  }

  const parser = markdown.parserFor(markdownRules)
  const renderer = markdown.outputFor(markdownRules, 'html')
  const html = renderer(parser(readme.sections.credits.content))

  return content.replace(targetText, html)
}
