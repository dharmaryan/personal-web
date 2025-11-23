import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PostLayout from '@/components/PostLayout'
import { renderRichText } from '@/components/richtext/renderRichText'
import { listCaseStudySlugs, loadCaseStudy } from '@/lib/caseStudies'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = await listCaseStudySlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await loadCaseStudy(params.slug)
  if (!post) {
    return { title: 'Post not found' }
  }
  return {
    title: `${post.meta.title} – Ryan Dharma`,
    description: post.meta.description ?? post.meta.summary,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await loadCaseStudy(params.slug)
  if (!post) {
    notFound()
  }

  return (
    <PostLayout
      label='BLOG'
      title={post.meta.title}
      summary={post.meta.summary ?? post.meta.description}
      author={post.meta.author}
      date={post.meta.date ? new Date(post.meta.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
      backHref='/blog'
      backLabel='← Back to blog'
    >
      {renderRichText(post.doc)}
    </PostLayout>
  )
}
