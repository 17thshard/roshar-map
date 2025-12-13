<script>
import markdown from 'simple-markdown'

const LINK_INSIDE = '(?:\\[[^\\]]*\\]|[^\\[\\]]|\\](?=[^\\[]*\\]))*'
const LINK_HREF_AND_TITLE = '\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+[\'"]([\\s\\S]*?)[\'"])?\\s*'

const rules = {
  paragraph: markdown.defaultRules.paragraph,
  blockQuote: markdown.defaultRules.blockQuote,
  newline: markdown.defaultRules.newline,
  escape: markdown.defaultRules.escape,
  inlineTranslatorNote: {
    order: markdown.defaultRules.em.order - 1,
    match: markdown.inlineRegex(/^_\[tn]\(((?:\\[\s\S]|[^\\])+?)\)_/),
    parse (capture, parse, state) {
      return {
        content: parse(capture[1], state)
      }
    }
  },
  translatorNote: {
    order: markdown.defaultRules.paragraph.order - 1,
    match: markdown.blockRegex(/^ *(`{3,}|~{3,}) *tn *\n([\s\S]+?)\n?\1 *(?:\n *)+\n/),
    parse (capture, parse, state) {
      return {
        content: markdown.parseBlock(parse, capture[2], state)
      }
    }
  },
  em: markdown.defaultRules.em,
  strong: markdown.defaultRules.strong,
  u: markdown.defaultRules.u,
  smallCaps: {
    order: markdown.defaultRules.em.order,
    match: markdown.inlineRegex(/^\^((?:\\[\s\S]|[^\\])+?)\^/),
    parse (capture, parse, state) {
      return {
        content: parse(capture[1], state)
      }
    }
  },
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

const advancedRules = {
  ...rules,
  list: markdown.defaultRules.list,
  heading: markdown.defaultRules.heading,
  forceBr: {
    order: markdown.defaultRules.br.order,
    match: markdown.inlineRegex(/^<br>/),
    parse: () => ({})
  }
}

const parser = markdown.parserFor(rules)
const advancedParser = markdown.parserFor(advancedRules)

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
    },
    advanced: {
      type: Boolean
    }
  },
  methods: {
    renderNode (node, h, route) {
      switch (node.type) {
        case 'strong':
        case 'em':
        case 'strike':
        case 'u':
          return h(node.type, node.content.map(child => this.renderNode(child, h, route)))
        case 'blockQuote':
          return h('blockquote', node.content.map(child => this.renderNode(child, h, route)))
        case 'paragraph':
          return h('p', node.content.map(child => this.renderNode(child, h, route)))
        case 'smallCaps':
          return h('span', { class: 'markdown__small-caps' }, node.content.map(child => this.renderNode(child, h, route)))
        case 'translatorNote':
          return h(
            'div',
            { class: ['markdown__translator-note'] },
            [
              h(
                'span',
                { class: 'markdown__translator-note-marker', attrs: { title: this.$t('ui.translatorNote.full') } },
                this.$t('ui.translatorNote.full')
              ),
              ...node.content.map(child => this.renderNode(child, h, route))
            ]
          )
        case 'inlineTranslatorNote':
          return h(
            'span',
            { class: ['markdown__inline-translator-note'] },
            [
              '(',
              h(
                'abbr',
                { class: 'markdown__inline-translator-note-marker', attrs: { title: this.$t('ui.translatorNote.full') } },
                this.$t('ui.translatorNote.abbreviation')
              ),
              ' ',
              h('span', { class: 'markdown__inline-translator-note-content' }, node.content.map(child => this.renderNode(child, h, route))),
              ')'
            ]
          )
        case 'internalLink':
          return h(
            'router-link',
            {
              props: {
                to: `/${route.params.locale}/${node.target}`
              }
            },
            node.content.map(child => this.renderNode(child, h, route))
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
            node.content.map(child => this.renderNode(child, h, route))
          )
        case 'list':
          return h(node.ordered ? 'ol' : 'ul', node.items.map(item => h('li', item.map(child => this.renderNode(child, h, route)))))
        case 'heading':
          return h(`h${node.level}`, node.content.map(child => this.renderNode(child, h, route)))
        case 'text':
          return node.content
        case 'forceBr':
        case 'br':
          return h('br')
        case 'newline':
          return undefined
      }

       
      console.error('Could not map Markdown element', node)

      return h('span')
    }
  },
  render (h) {
    const parsed = (this.advanced ? advancedParser : parser)(this.content, { inline: this.inline })
    const children = parsed.map(node => this.renderNode(node, h, this.$route))

    if (this.$slots.prefix) {
      children.unshift(this.$slots.prefix, ' ')
    }

    children.push(' ', ...(this.$slots.default || this.$slots.suffix || []))

    return h(this.tag, { class: 'markdown' }, children)
  }
}
</script>

<style lang="scss">
.markdown {
  a {
    display: inline;
    color: inherit;
    text-decoration: none;
    transition: all 0.2s ease-in-out;
    background-image: linear-gradient(0deg, #0f3562 0%, #0f3562 100%);
    background-repeat: no-repeat;
    background-size: 100% 0.1em;
    background-position: 50% 100%;

    &:hover, &:active, &:focus {
      color: #f6f8fa;
      background-size: 100% 100%;
    }
  }

  &__small-caps {
    font-variant: small-caps;
  }

  &__translator-note {
    font-size: 0.9em;
    padding: 1em 0.5em;
    border-top: 2px solid rgba(0, 0, 0, 0.2);
    border-bottom: 2px solid rgba(0, 0, 0, 0.2);

    &-marker {
      float: left;
      line-height: 1;
      margin-right: 5px;
      font-size: 0.9em;
      font-family: sans-serif;
      color: #f6f8fa;
      background: #0f3562;
      padding: 0.5em 5px;
      border-radius: 3px;
      text-decoration: none;
    }

    & > *:nth-child(2) {
      margin-top: 0;
    }

    & > *:last-child {
      margin-bottom: 0;
    }
  }

  .markdown__inline-translator-note {
    font-size: 0.9em;

    &-marker {
      font-size: 0.9em;
      font-family: sans-serif;
      color: #f6f8fa;
      background: #0f3562;
      padding: 0.2em 5px;
      margin-left: 2px;
      border-radius: 3px;
      text-decoration: none;
      cursor: help;
    }

    &-content {
      font-style: italic;
    }
  }

  blockquote {
    position: relative;
    font-size: 1.2em;
    line-height: 1.7;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    font-style: italic;

    &:before {
      content: '“';
      position: absolute;
      top: 0.5rem;
      line-height: 1;
      font-size: 3rem;
      color: color.adjust(#1c1d26, $lightness: 40%);

      [dir=ltr] & {
        left: -1.7rem;
      }

      [dir=rtl] & {
        right: -1rem;
      }
    }

    &:after {
      content: '”';
      position: absolute;
      bottom: -1.5rem;
      line-height: 1;
      font-size: 3rem;
      color: color.adjust(#1c1d26, $lightness: 40%);

      [dir=ltr] & {
        right: -1rem;
      }

      [dir=rtl] & {
        left: -1.7rem;
      }
    }
  }

  ul {
    & > li {
      margin-top: 0.5rem;

      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
