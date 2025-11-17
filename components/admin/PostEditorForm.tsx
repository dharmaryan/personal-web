'use client'

import { useState } from 'react'
import ImageUploader from './ImageUploader'
import TipTapEditor from '../tiptap/TipTapEditor'
import type { ReactNode } from 'react'

interface PostEditorFormProps {
  action: (formData: FormData) => Promise<void> | void
  initialData?: {
    id?: string
    title?: string
    subtitle?: string | null
    author?: string
    coverImage?: string | null
    content?: string
  }
  children: ReactNode
}

const emptyDoc = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] })

export default function PostEditorForm({ action, initialData, children }: PostEditorFormProps) {
  const [content, setContent] = useState(initialData?.content ?? emptyDoc)
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '')

  return (
    <form action={action} className='space-y-6'>
      {initialData?.id && <input type='hidden' name='id' value={initialData.id} />}
      <div>
        <label className='block text-sm font-semibold text-slate-900'>Title</label>
        <input
          name='title'
          defaultValue={initialData?.title ?? ''}
          required
          className='mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30'
          placeholder='Untitled post'
        />
      </div>
      <div>
        <label className='block text-sm font-semibold text-slate-900'>Subtitle</label>
        <textarea
          name='subtitle'
          defaultValue={initialData?.subtitle ?? ''}
          className='mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30'
          rows={2}
        />
      </div>
      <div>
        <label className='block text-sm font-semibold text-slate-900'>Author</label>
        <input
          name='author'
          defaultValue={initialData?.author ?? ''}
          required
          className='mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30'
        />
      </div>
      <div>
        <label className='block text-sm font-semibold text-slate-900'>Cover Image</label>
        <ImageUploader value={coverImage} onChange={setCoverImage} />
        <input type='hidden' name='coverImage' value={coverImage} />
      </div>
      <div>
        <label className='block text-sm font-semibold text-slate-900'>Content</label>
        <TipTapEditor value={content} onChange={setContent} />
        <input type='hidden' name='content' value={content} />
      </div>
      <div className='flex flex-wrap items-center gap-3'>{children}</div>
    </form>
  )
}
