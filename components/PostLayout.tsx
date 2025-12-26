import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface PostLayoutProps {
  label?: string
  title: string
  summary?: string
  author: string
  date: string
  backHref: string
  backLabel: string
  authorImage?: string
  children: ReactNode
}

export default function PostLayout({
  label = 'CASE STUDY',
  title,
  summary,
  author,
  date,
  backHref,
  backLabel,
  authorImage = '/ryan-dharma-headshot.jpg',
  children,
}: PostLayoutProps) {
  return (
    <main className='flex-1 bg-white text-zinc-700'>
      <section className='bg-white'>
        <div className='mx-auto max-w-3xl px-4 pt-20 pb-10'>
          <p className='mb-6 text-sm font-semibold uppercase tracking-wider text-zinc-500'>{label}</p>
          <h1 className='mb-4 text-4xl font-bold leading-tight text-zinc-950 md:text-5xl'>{title}</h1>
          {summary && <p className='mb-4 text-lg text-zinc-700'>{summary}</p>}
          <div className='mt-8 mb-8 flex items-center gap-4'>
            <Image src={authorImage} alt={author} width={48} height={48} className='rounded-full' />
            <div className='space-y-1 text-sm'>
              <p className='font-semibold text-zinc-950'>{author}</p>
              <p className='text-zinc-500'>{date}</p>
            </div>
          </div>
          <Link
            href={backHref}
            className='inline-flex items-center gap-2 text-sm text-zinc-700'
          >
            {backLabel}
          </Link>
          <hr className='my-12 border-zinc-200' />
        </div>
      </section>

      <section className='bg-white'>
        {/* Remove extra top padding so the divider-to-heading spacing matches the divider-to-back-link spacing. */}
        <div className='mx-auto max-w-3xl px-4 pt-0 pb-24'>
          <article>
            <div className='case-body'>
              {children}
              <hr className='my-12 border-zinc-200' />
              <div className='sm:flex sm:items-center sm:justify-between'>
                <p className='text-base font-semibold text-zinc-950'>Enjoyed this piece?</p>
                {/* Suppress only the hover underline for the CTA while keeping other button styles intact. */}
                <Link
                  href='/'
                  className='mt-4 inline-flex items-center rounded-md border border-zinc-900 bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:border-blue-600 hover:bg-blue-600 hover:no-underline sm:mt-0'
                >
                  <span className='text-white'>View my main site</span>
                </Link>
              </div>
              <hr className='my-12 border-zinc-200' />
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
