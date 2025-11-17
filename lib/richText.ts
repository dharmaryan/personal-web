export type RichTextMark = {
  type: string
  attrs?: Record<string, unknown>
}

export interface RichTextNode {
  type: string
  attrs?: Record<string, any>
  text?: string
  content?: RichTextNode[]
  marks?: RichTextMark[]
}

export interface RichTextDoc {
  type: 'doc'
  content: RichTextNode[]
}

const EMPTY_PARAGRAPH: RichTextNode = { type: 'paragraph', content: [] }
const EMPTY_DOC: RichTextDoc = { type: 'doc', content: [EMPTY_PARAGRAPH] }

export const EMPTY_DOC_STRING = JSON.stringify(EMPTY_DOC)

export function parseDoc(content?: string | null): RichTextDoc {
  if (!content) {
    return cloneDoc(EMPTY_DOC)
  }
  try {
    const parsed = JSON.parse(content) as RichTextDoc
    if (parsed && parsed.type === 'doc') {
      return parsed
    }
  } catch (err) {
    return cloneDoc(EMPTY_DOC)
  }
  return cloneDoc(EMPTY_DOC)
}

export function docToMarkdown(content?: string): string {
  const doc = parseDoc(content)
  return (doc.content || [])
    .map((node) => renderNodeToMarkdown(node))
    .filter(Boolean)
    .join('\n\n')
}

export function markdownToDoc(markdown: string): RichTextDoc {
  if (!markdown.trim()) {
    return cloneDoc(EMPTY_DOC)
  }
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const nodes: RichTextNode[] = []
  let index = 0
  while (index < lines.length) {
    const rawLine = lines[index]
    const line = rawLine.trim()
    if (!line) {
      index += 1
      continue
    }

    if (line.startsWith('```')) {
      const { node, nextIndex } = parseCodeBlock(lines, index)
      nodes.push(node)
      index = nextIndex
      continue
    }

    if (/^#{1,4}\s+/.test(line)) {
      const level = Math.min(line.match(/^#+/)![0].length, 4)
      nodes.push(createHeading(level, line.replace(/^#{1,4}\s+/, '')))
      index += 1
      continue
    }

    if (line.startsWith('>')) {
      const { node, nextIndex } = parseBlockquote(lines, index)
      nodes.push(node)
      index = nextIndex
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const { node, nextIndex } = parseOrderedList(lines, index)
      nodes.push(node)
      index = nextIndex
      continue
    }

    if (line.startsWith('- ')) {
      const { node, nextIndex } = parseBulletList(lines, index)
      nodes.push(node)
      index = nextIndex
      continue
    }

    if (/^!\[[^\]]*\]\([^\)]+\)/.test(line)) {
      nodes.push(parseImage(line))
      index += 1
      continue
    }

    const { node, nextIndex } = parseParagraph(lines, index)
    nodes.push(node)
    index = nextIndex
  }

  if (!nodes.length) {
    nodes.push(cloneNode(EMPTY_PARAGRAPH))
  }

  return { type: 'doc', content: nodes }
}

function parseParagraph(lines: string[], startIndex: number) {
  const buffer: string[] = []
  let pointer = startIndex
  while (pointer < lines.length) {
    const current = lines[pointer]
    if (!current.trim()) break
    buffer.push(current)
    pointer += 1
  }
  const text = buffer.join(' ').trim()
  return {
    node: createParagraph(text),
    nextIndex: pointer,
  }
}

function parseBulletList(lines: string[], startIndex: number) {
  const items: RichTextNode[] = []
  let pointer = startIndex
  while (pointer < lines.length) {
    const current = lines[pointer]
    if (!current.trim() || !current.trimStart().startsWith('- ')) break
    const text = current.trim().replace(/^-\s+/, '')
    items.push(createListItem(text))
    pointer += 1
  }
  return {
    node: { type: 'bulletList', content: items },
    nextIndex: pointer,
  }
}

function parseOrderedList(lines: string[], startIndex: number) {
  const items: RichTextNode[] = []
  let pointer = startIndex
  while (pointer < lines.length) {
    const current = lines[pointer]
    if (!current.trim() || !/^\d+\.\s+/.test(current.trim())) break
    const text = current.trim().replace(/^\d+\.\s+/, '')
    items.push(createListItem(text))
    pointer += 1
  }
  return {
    node: { type: 'orderedList', content: items },
    nextIndex: pointer,
  }
}

function parseBlockquote(lines: string[], startIndex: number) {
  const paragraphs: RichTextNode[] = []
  let pointer = startIndex
  while (pointer < lines.length) {
    const current = lines[pointer]
    if (!current.trim() || !current.trimStart().startsWith('>')) break
    const text = current.trim().replace(/^>\s?/, '')
    paragraphs.push(createParagraph(text))
    pointer += 1
  }
  return {
    node: { type: 'blockquote', content: paragraphs },
    nextIndex: pointer,
  }
}

function parseCodeBlock(lines: string[], startIndex: number) {
  const firstLine = lines[startIndex]
  const language = firstLine.replace(/```/, '').trim()
  const buffer: string[] = []
  let pointer = startIndex + 1
  while (pointer < lines.length && !lines[pointer].startsWith('```')) {
    buffer.push(lines[pointer])
    pointer += 1
  }
  if (pointer < lines.length) {
    pointer += 1
  }
  return {
    node: {
      type: 'codeBlock',
      attrs: language ? { language } : undefined,
      content: [createText(buffer.join('\n'))],
    },
    nextIndex: pointer,
  }
}

function parseImage(line: string): RichTextNode {
  const match = line.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]+)")?\)/)
  if (!match) {
    return { type: 'paragraph', content: [createText(line)] }
  }
  const [, alt, src, title] = match
  return {
    type: 'image',
    attrs: { src, alt, title },
  }
}

function createParagraph(text: string): RichTextNode {
  if (!text) return cloneNode(EMPTY_PARAGRAPH)
  return { type: 'paragraph', content: [createText(text)] }
}

function createHeading(level: number, text: string): RichTextNode {
  return { type: 'heading', attrs: { level }, content: [createText(text.trim())] }
}

function createListItem(text: string): RichTextNode {
  return { type: 'listItem', content: [createParagraph(text)] }
}

function createText(text: string): RichTextNode {
  return { type: 'text', text }
}

function renderNodeToMarkdown(node?: RichTextNode | null): string {
  if (!node) return ''
  switch (node.type) {
    case 'paragraph':
      return renderInlineContent(node.content)
    case 'heading': {
      const level = clampHeadingLevel(node.attrs?.level)
      return `${'#'.repeat(level)} ${renderInlineContent(node.content)}`.trim()
    }
    case 'bulletList':
      return (node.content || [])
        .map((item) => `- ${renderInlineContent(item.content)}`.trim())
        .join('\n')
    case 'orderedList':
      return (node.content || [])
        .map((item, idx) => `${idx + 1}. ${renderInlineContent(item.content)}`.trim())
        .join('\n')
    case 'blockquote':
      return (node.content || [])
        .map((child) => renderInlineContent(child.content))
        .map((line) => `> ${line}`.trim())
        .join('\n')
    case 'codeBlock': {
      const code = renderInlineContent(node.content)
      const lang = typeof node.attrs?.language === 'string' ? node.attrs?.language : ''
      return ['```' + lang, code, '```'].join('\n')
    }
    case 'image': {
      const alt = (node.attrs?.alt as string) || ''
      const src = (node.attrs?.src as string) || ''
      const title = node.attrs?.title ? ` "${node.attrs.title}"` : ''
      if (!src) return ''
      return `![${alt}](${src}${title})`
    }
    case 'listItem':
      return renderInlineContent(node.content)
    default:
      return ''
  }
}

function renderInlineContent(content?: RichTextNode[]): string {
  if (!content || !content.length) return ''
  return content
    .map((node) => {
      if (node.type === 'text') {
        return applyMarks(node.text ?? '', node.marks)
      }
      if (node.type === 'hardBreak') {
        return '\n'
      }
      return renderNodeToMarkdown(node)
    })
    .join('')
}

function applyMarks(text: string, marks?: RichTextMark[]): string {
  if (!marks || !marks.length) return text
  return marks.reduce((value, mark) => {
    switch (mark.type) {
      case 'bold':
        return `**${value}**`
      case 'italic':
        return `*${value}*`
      case 'underline':
        return `<u>${value}</u>`
      case 'code':
        return '`' + value + '`'
      case 'link': {
        const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '#'
        return `[${value}](${href})`
      }
      default:
        return value
    }
  }, text)
}

function clampHeadingLevel(level?: number) {
  if (!level) return 2
  return Math.min(Math.max(level, 1), 4)
}

function cloneDoc(doc: RichTextDoc): RichTextDoc {
  return JSON.parse(JSON.stringify(doc)) as RichTextDoc
}

function cloneNode(node: RichTextNode): RichTextNode {
  return JSON.parse(JSON.stringify(node)) as RichTextNode
}
