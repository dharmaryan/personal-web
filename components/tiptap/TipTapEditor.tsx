'use client'

import { useCallback, useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

interface TipTapEditorProps {
  value: string
  onChange: (content: string) => void
}

const defaultDoc = { type: 'doc', content: [{ type: 'paragraph' }] }

const extensions = [
  StarterKit.configure({
    heading: {
      levels: [2, 3, 4],
    },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      class: 'text-brand-blue underline underline-offset-4',
    },
  }),
  Image.configure({
    allowBase64: true,
    HTMLAttributes: {
      class: 'rounded-2xl border border-slate-200 shadow-sm my-6',
    },
  }),
  Placeholder.configure({
    placeholder: 'Start writing your post…',
  }),
]

export default function TipTapEditor({ value, onChange }: TipTapEditorProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const editor = useEditor({
    extensions,
    content: safeParse(value),
    editorProps: {
      attributes: {
        class: 'tiptap-editor case-body focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
  })

  useEffect(() => {
    if (!editor) return
    const json = safeParse(value)
    editor.commands.setContent(json)
  }, [editor, value])

  const exec = useCallback(
    (command: (editor: Editor) => void) => () => {
      if (!editor) return
      command(editor)
    },
    [editor],
  )

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!mounted || !editor) {
    return <div className='rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500'>Loading editor…</div>
  }

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600'>
        <button type='button' onClick={exec((ed) => ed.chain().focus().toggleBold().run())} className={buttonClass(editor.isActive('bold'))}>
          Bold
        </button>
        <button type='button' onClick={exec((ed) => ed.chain().focus().toggleItalic().run())} className={buttonClass(editor.isActive('italic'))}>
          Italic
        </button>
        <button type='button' onClick={exec((ed) => ed.chain().focus().toggleUnderline().run())} className={buttonClass(editor.isActive('underline'))}>
          Underline
        </button>
        <button type='button' onClick={exec((ed) => ed.chain().focus().toggleHeading({ level: 2 }).run())} className={buttonClass(editor.isActive('heading', { level: 2 }))}>
          H2
        </button>
        <button type='button' onClick={exec((ed) => ed.chain().focus().toggleHeading({ level: 3 }).run())} className={buttonClass(editor.isActive('heading', { level: 3 }))}>
          H3
        </button>
        <button type='button' onClick={exec((ed) => ed.chain().focus().toggleBulletList().run())} className={buttonClass(editor.isActive('bulletList'))}>
          Bullets
        </button>
        <button type='button' onClick={exec((ed) => ed.chain().focus().toggleOrderedList().run())} className={buttonClass(editor.isActive('orderedList'))}>
          Numbers
        </button>
        <button type='button' onClick={exec((ed) => ed.chain().focus().toggleBlockquote().run())} className={buttonClass(editor.isActive('blockquote'))}>
          Quote
        </button>
        <button type='button' onClick={exec((ed) => ed.chain().focus().toggleCodeBlock().run())} className={buttonClass(editor.isActive('codeBlock'))}>
          Code
        </button>
        <button type='button' onClick={setLink} className={buttonClass(editor.isActive('link'))}>
          Link
        </button>
        <button type='button' onClick={addImage} className='rounded-full border border-slate-200 px-3 py-1 hover:border-slate-400'>
          Image
        </button>
        <button type='button' onClick={exec((ed) => ed.chain().focus().unsetAllMarks().clearNodes().run())} className='rounded-full border border-slate-200 px-3 py-1 hover:border-slate-400'>
          Clear
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

const buttonClass = (active: boolean) =>
  `rounded-full border px-3 py-1 transition ${active ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-slate-200 hover:border-slate-400'}`

function safeParse(value: string | undefined) {
  if (!value) return defaultDoc
  try {
    return JSON.parse(value)
  } catch (err) {
    return defaultDoc
  }
}
