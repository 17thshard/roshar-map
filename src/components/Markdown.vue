<script>
import markdown from 'simple-markdown'

const rules = {
  paragraph: markdown.defaultRules.paragraph,
  newline: markdown.defaultRules.newline,
  escape: markdown.defaultRules.escape,
  em: markdown.defaultRules.em,
  strong: markdown.defaultRules.strong,
  u: markdown.defaultRules.u,
  br: markdown.defaultRules.br,
  text: markdown.defaultRules.text
}

const parser = markdown.parserFor(rules)

function renderNode (node, h) {
  switch (node.type) {
    case 'strong':
    case 'em':
    case 'strike':
    case 'u':
      return h(node.type, node.content.map(child => renderNode(child, h)))
    case 'blockQuote':
      return h('blockquote', node.content.map(child => renderNode(child, h)))
    case 'paragraph':
      return h('p', node.content.map(child => renderNode(child, h)))
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
  functional: true,
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
  render (h, context) {
    const parsed = parser(context.props.content, { inline: context.props.inline })
    const children = parsed.map(node => renderNode(node, h))

    children.push(' ', ...(context.slots().default || []))

    return h(context.props.tag, { ...context.data, class: ['markdown', context.data.class] }, children)
  }
}
</script>
