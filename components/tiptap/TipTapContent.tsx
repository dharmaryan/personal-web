'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

interface TipTapContentProps {
  content: string
}

const extensions = [
  StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
  Underline,
  Link.configure({
    openOnClick: true,
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
]

export default function TipTapContent({ content }: TipTapContentProps) {
  const editor = useEditor({
    extensions,
    content: safeParse(content),
    editable: false,
    editorProps: {
      attributes: {
        class: 'tiptap-output case-body',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.commands.setContent(safeParse(content))
  }, [editor, content])

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}

function safeParse(value: string | undefined) {
  if (!value) {
    return { type: 'doc', content: [{ type: 'paragraph' }] }
  }
  try {
    return JSON.parse(value)
  } catch (err) {
    return { type: 'doc', content: [{ type: 'paragraph' }] }
  }
}
