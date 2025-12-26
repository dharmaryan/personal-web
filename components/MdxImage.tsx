import type { ImgHTMLAttributes } from 'react'

export default function MdxImage({ title, alt = '', className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const resolvedClassName = ['h-auto max-w-full rounded-lg border border-zinc-200', className].filter(Boolean).join(' ')
  return (
    <figure>
      {/* Render markdown images as semantic figures with captions from the title string. */}
      <img {...props} alt={alt} title={title} className={resolvedClassName} />
      {title ? <figcaption>{title}</figcaption> : null}
    </figure>
  )
}
