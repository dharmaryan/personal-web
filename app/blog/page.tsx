import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

type BlogPostSummary = {
  id: string
  title: string
  slug: string
  subtitle: string | null
  author: string
  coverImage: string | null
  createdAt: Date
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function loadPublishedPosts(): Promise<BlogPostSummary[]> {
  try {
    return await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch (_error) {
    return []
  }
}

export const metadata: Metadata = {
  title: 'Blog – Ryan Dharma',
}

export default async function BlogIndexPage() {
  const posts = await loadPublishedPosts()

  return (
    <main className='flex-1 bg-white px-6 py-16 text-slate-900'>
      <div className='mx-auto max-w-4xl'>
        <p className='text-sm uppercase tracking-widest text-slate-400'>Blog</p>
        <h1 className='mt-3 text-4xl font-semibold text-slate-900'>Writing</h1>
        <p className='mt-3 text-base text-slate-600'>Dispatches on RevOps, GTM systems, and building outbound funnels.</p>
        <div className='mt-12 space-y-10'>
          {posts.length === 0 && <p className='text-slate-500'>No published posts yet.</p>}
          {posts.map((post) => (
            <article key={post.id} className='rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md'>
              <Link href={`/blog/${post.slug}`} className='block'>
                {post.coverImage && (
                  <div className='mb-4 overflow-hidden rounded-2xl border border-slate-100'>
                    <Image src={post.coverImage} alt={post.title} width={1200} height={630} className='h-64 w-full object-cover' />
                  </div>
                )}
                <p className='text-xs uppercase tracking-widest text-slate-400'>
                  {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <h2 className='mt-2 text-2xl font-semibold text-slate-900'>{post.title}</h2>
                {post.subtitle && <p className='mt-3 text-base text-slate-600'>{post.subtitle}</p>}
                <p className='mt-4 text-sm text-slate-500'>By {post.author}</p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
