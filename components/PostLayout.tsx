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
    <main className='page-transition flex-1 bg-white text-slate-700'>
      <section className='bg-white'>
        <div className='mx-auto max-w-3xl px-4 pt-20 pb-10'>
          <p className='mb-6 text-sm font-semibold uppercase tracking-wider text-slate-400'>{label}</p>
          <h1 className='mb-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl'>{title}</h1>
          {summary && <p className='mb-4 text-lg text-slate-600'>{summary}</p>}
          <div className='mt-8 mb-8 flex items-center gap-4'>
            <Image src={authorImage} alt={author} width={48} height={48} className='rounded-full' />
            <div className='space-y-1 text-sm'>
              <p className='font-semibold text-slate-900'>{author}</p>
              <p className='text-slate-500'>{date}</p>
            </div>
          </div>
          <Link
            href={backHref}
            className='inline-flex items-center gap-2 text-sm text-slate-600 transition duration-200 hover:text-slate-900'
          >
            {backLabel}
          </Link>
          <hr className='my-12 border-slate-200' />
        </div>
      </section>

      <section className='bg-white'>
        <div className='mx-auto max-w-3xl px-4 pt-10 pb-24'>
          <article>
            <div className='case-body'>
              {children}
              <hr className='my-12 border-slate-200' />
              <div className='sm:flex sm:items-center sm:justify-between'>
                <p className='text-base font-semibold text-slate-900'>Enjoyed this piece?</p>
                <Link
                  href='/'
                  className='mt-4 inline-flex items-center rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-brand-blue/90 sm:mt-0'
                >
                  View my main site
                </Link>
              </div>
              <hr className='my-12 border-slate-200' />
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
