import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PostLayout from '@/components/PostLayout'
import TipTapContent from '@/components/tiptap/TipTapContent'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const post = await prisma.post.findUnique({ where: { slug: params.slug } })
    if (!post || !post.published) {
      return { title: 'Post not found' }
    }
    return {
      title: `${post.title} – Ryan Dharma`,
      description: post.subtitle ?? undefined,
    }
  } catch (_error) {
    return { title: 'Blog post – Ryan Dharma' }
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post || !post.published) {
    notFound()
  }

  return (
    <PostLayout
      label='BLOG'
      title={post.title}
      summary={post.subtitle ?? undefined}
      author={post.author}
      date={new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}
      backHref='/blog'
      backLabel='← Back to blog'
    >
      <TipTapContent content={post.content} />
    </PostLayout>
  )
}
