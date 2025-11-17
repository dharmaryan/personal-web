import type { RichTextDoc } from '@/lib/richText'
import { parseDoc } from '@/lib/richText'
import { renderRichText } from '../richtext/renderRichText'

interface TipTapContentProps {
  content: string
}

export default function TipTapContent({ content }: TipTapContentProps) {
  const doc: RichTextDoc = parseDoc(content)
  return <div className='case-body'>{renderRichText(doc)}</div>
}
