import type { ComponentProps } from 'react'

function MDXImage({ title, alt, ...props }: ComponentProps<'img'>) {
  // Wrap markdown images with a figure + caption using the title attribute from MDX.
  return (
    <figure className='my-8 space-y-4'>
      <img
        {...props}
        alt={alt ?? ''}
        title={title}
        className='w-full rounded-2xl border border-zinc-200 object-cover'
      />
      {title ? <figcaption className='text-sm text-slate-500'>{title}</figcaption> : null}
    </figure>
  )
}

export const mdxComponents = {
  img: MDXImage,
}
