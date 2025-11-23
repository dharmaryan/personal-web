import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { listCaseStudies } from '@/lib/caseStudies'

export const metadata: Metadata = {
  title: 'Blog – Ryan Dharma',
}

export default async function BlogIndexPage() {
  const posts = await listCaseStudies()

  return (
    <main className='flex-1 bg-white px-6 py-16 text-slate-900'>
      <div className='mx-auto max-w-4xl'>
        <p className='text-sm uppercase tracking-widest text-slate-400'>Blog</p>
        <h1 className='mt-3 text-4xl font-semibold text-slate-900'>Writing</h1>
        <p className='mt-3 text-base text-slate-600'>Dispatches on RevOps, GTM systems, and building outbound funnels.</p>
        <div className='mt-12 space-y-10'>
          {posts.length === 0 && <p className='text-slate-500'>No published posts yet.</p>}
          {posts.map((post) => (
            <article key={post.slug} className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md'>
              <Link href={`/case-studies/${post.slug}`} className='block'>
                {'coverImage' in post.meta && post.meta.coverImage ? (
                  <div className='mb-4 overflow-hidden rounded-2xl border border-slate-100'>
                    <Image src={post.meta.coverImage as string} alt={post.meta.title} width={1200} height={630} className='h-64 w-full object-cover' />
                  </div>
                ) : null}
                {post.meta.date && (
                  <p className='text-xs uppercase tracking-widest text-slate-400'>
                    {new Date(post.meta.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                <h2 className='mt-2 text-2xl font-semibold text-slate-900'>{post.meta.title}</h2>
                {post.meta.summary && <p className='mt-3 text-base text-slate-600'>{post.meta.summary}</p>}
                <p className='mt-4 text-sm text-slate-500'>By {post.meta.author}</p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
