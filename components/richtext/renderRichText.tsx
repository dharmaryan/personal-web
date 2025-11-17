import { Fragment } from 'react'
import type { ReactNode } from 'react'
import type { RichTextDoc, RichTextMark, RichTextNode } from '@/lib/richText'

export function renderRichText(doc: RichTextDoc): ReactNode {
  const nodes = doc.content || []
  return nodes.map((node, index) => renderNode(node, `node-${index}`))
}

function renderNode(node: RichTextNode, key: string): ReactNode {
  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key}>
          {renderInline(node.content, `${key}-inline`)}
        </p>
      )
    case 'heading': {
      const level = clampHeadingLevel(node.attrs?.level)
      const HeadingTag = (`h${level}` as keyof JSX.IntrinsicElements)
      return (
        <HeadingTag key={key}>
          {renderInline(node.content, `${key}-inline`)}
        </HeadingTag>
      )
    }
    case 'bulletList':
      return (
        <ul key={key}>
          {(node.content || []).map((child, idx) => renderListItem(child, `${key}-item-${idx}`))}
        </ul>
      )
    case 'orderedList':
      return (
        <ol key={key}>
          {(node.content || []).map((child, idx) => renderListItem(child, `${key}-item-${idx}`))}
        </ol>
      )
    case 'blockquote':
      return (
        <blockquote key={key} className='border-l-4 border-slate-200 pl-4 italic text-slate-600'>
          {(node.content || []).map((child, idx) => renderNode(child, `${key}-quote-${idx}`))}
        </blockquote>
      )
    case 'codeBlock':
      return (
        <pre key={key} className='mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm text-white'>
          <code>{(node.content && node.content[0]?.text) || ''}</code>
        </pre>
      )
    case 'image': {
      const src = node.attrs?.src as string | undefined
      if (!src) return null
      const alt = (node.attrs?.alt as string) || ''
      const caption = (node.attrs?.title as string) || ''
      return (
        <figure key={key} className='my-8 space-y-4'>
          <img src={src} alt={alt} className='w-full rounded-2xl border border-slate-200 object-cover shadow-lg' />
          {caption && <figcaption className='text-sm text-slate-500'>{caption}</figcaption>}
        </figure>
      )
    }
    case 'listItem':
      return renderListItem(node, key)
    default:
      return null
  }
}

function renderListItem(node: RichTextNode, key: string): ReactNode {
  return (
    <li key={key}>
      {renderInline(node.content, `${key}-inline`)}
    </li>
  )
}

function renderInline(content: RichTextNode[] | undefined, keyPrefix: string): ReactNode {
  if (!content || !content.length) return null
  return content.map((node, index) => {
    const key = `${keyPrefix}-${index}`
    if (node.type === 'text') {
      return applyMarks(node.text ?? '', node.marks, key)
    }
    if (node.type === 'hardBreak') {
      return <br key={key} />
    }
    return <Fragment key={key}>{renderNode(node, key)}</Fragment>
  })
}

function applyMarks(value: string, marks: RichTextMark[] | undefined, key: string): ReactNode {
  if (!marks || !marks.length) {
    return <Fragment key={key}>{value}</Fragment>
  }
  return marks.reduce<ReactNode>((content, mark, index) => {
    const markKey = `${key}-mark-${index}`
    switch (mark.type) {
      case 'bold':
        return <strong key={markKey}>{content}</strong>
      case 'italic':
        return <em key={markKey}>{content}</em>
      case 'underline':
        return <span key={markKey} className='underline'>{content}</span>
      case 'code':
        return (
          <code key={markKey} className='rounded bg-slate-100 px-1 py-0.5 text-sm text-slate-700'>
            {content}
          </code>
        )
      case 'link': {
        const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '#'
        return (
          <a key={markKey} href={href} className='text-brand-blue underline underline-offset-4'>
            {content}
          </a>
        )
      }
      default:
        return <Fragment key={markKey}>{content}</Fragment>
    }
  }, <Fragment key={key}>{value}</Fragment>)
}

function clampHeadingLevel(level?: number) {
  if (!level) return 2
  return Math.min(Math.max(level, 1), 4)
}
