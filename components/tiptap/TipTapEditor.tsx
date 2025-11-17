'use client'

import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { docToMarkdown, markdownToDoc } from '@/lib/richText'
import { renderRichText } from '../richtext/renderRichText'

interface TipTapEditorProps {
  value: string
  onChange: (content: string) => void
}

export default function TipTapEditor({ value, onChange }: TipTapEditorProps) {
  const [markdown, setMarkdown] = useState(() => docToMarkdown(value))

  useEffect(() => {
    setMarkdown(docToMarkdown(value))
  }, [value])

  const previewDoc = useMemo(() => markdownToDoc(markdown), [markdown])

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextMarkdown = event.target.value
    setMarkdown(nextMarkdown)
    const doc = markdownToDoc(nextMarkdown)
    onChange(JSON.stringify(doc))
  }

  return (
    <div className='space-y-4'>
      <textarea
        className='h-64 w-full rounded-2xl border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30'
        value={markdown}
        onChange={handleChange}
        placeholder='Write your post using Markdown syntax...'
      />
      <p className='text-xs text-slate-500'>Use Markdown headings (##), lists (- item), blockquotes (&gt;), and code fences (``` ) to structure your post.</p>
      <div className='rounded-2xl border border-slate-200 bg-white p-4'>
        <p className='text-xs font-semibold uppercase tracking-wide text-slate-400'>Live preview</p>
        <div className='case-body mt-4'>{renderRichText(previewDoc)}</div>
      </div>
    </div>
  )
}
