<script>
import markdown from 'simple-markdown'

const LINK_INSIDE = '(?:\\[[^\\]]*\\]|[^\\[\\]]|\\](?=[^\\[]*\\]))*'
const LINK_HREF_AND_TITLE = '\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+[\'"]([\\s\\S]*?)[\'"])?\\s*'

const rules = {
  paragraph: markdown.defaultRules.paragraph,
  blockQuote: markdown.defaultRules.blockQuote,
  newline: markdown.defaultRules.newline,
  escape: markdown.defaultRules.escape,
  em: markdown.defaultRules.em,
  strong: markdown.defaultRules.strong,
  u: markdown.defaultRules.u,
  internalLink: {
    order: markdown.defaultRules.link.order - 1,
    match: markdown.inlineRegex(new RegExp(
      '^#\\[(' + LINK_INSIDE + ')\\]\\(' + LINK_HREF_AND_TITLE + '\\)'
    )),
    parse (capture, parse, state) {
      return {
        content: parse(capture[1], state),
        target: markdown.unescapeUrl(capture[2]),
        title: capture[3]
      }
    }
  },
  link: markdown.defaultRules.link,
  br: markdown.defaultRules.br,
  text: markdown.defaultRules.text
}

const parser = markdown.parserFor(rules)

function renderNode (node, h, route) {
  switch (node.type) {
    case 'strong':
    case 'em':
    case 'strike':
    case 'u':
      return h(node.type, node.content.map(child => renderNode(child, h, route)))
    case 'blockQuote':
      return h('blockquote', node.content.map(child => renderNode(child, h, route)))
    case 'paragraph':
      return h('p', node.content.map(child => renderNode(child, h, route)))
    case 'internalLink':
      return h(
        'router-link',
        {
          props: {
            to: `/${route.params.locale}/${node.target}`
          }
        },
        node.content.map(child => renderNode(child, h, route))
      )
    case 'link':
      return h(
        'a',
        {
          attrs: {
            href: node.target,
            title: node.title,
            target: '_blank',
            rel: 'noopener'
          }
        },
        node.content.map(child => renderNode(child, h, route))
      )
    case 'text':
      return node.content
    case 'br':
      return h('br')
    case 'newline':
      return undefined
  }

  // eslint-disable-next-line no-console
  console.error('Could not map Markdown element', node)

  return h('span')
}

export default {
  name: 'Markdown',
  props: {
    tag: {
      type: String,
      default: () => 'div'
    },
    content: {
      type: String,
      required: true
    },
    inline: {
      type: Boolean
    }
  },
  render (h) {
    const parsed = parser(this.content, { inline: this.inline })
    const children = parsed.map(node => renderNode(node, h, this.$route))

    children.push(' ', ...(this.$slots.default || []))

    return h(this.tag, { class: 'markdown' }, children)
  }
}
</script>
