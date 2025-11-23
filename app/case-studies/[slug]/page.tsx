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
  const study = await loadCaseStudy(params.slug)
  if (!study) {
    return { title: 'Case study not found' }
  }

  return {
    title: `${study.meta.title} – Ryan Dharma`,
    description: study.meta.description ?? study.meta.summary,
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const study = await loadCaseStudy(params.slug)
  if (!study) {
    notFound()
  }

  return (
    <PostLayout
      label={study.meta.label}
      title={study.meta.title}
      summary={study.meta.summary ?? study.meta.description}
      author={study.meta.author}
      date={study.meta.date ? new Date(study.meta.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
      backHref={study.meta.backHref}
      backLabel={study.meta.backLabel}
    >
      {renderRichText(study.doc)}
    </PostLayout>
  )
}
