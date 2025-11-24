import fs from 'fs/promises'
import path from 'path'
import { markdownToDoc, type RichTextDoc } from './richText'

const CASE_STUDIES_DIR = path.join(process.cwd(), 'content', 'case-studies')

type Frontmatter = {
  slug?: string
  title?: string
  summary?: string
  description?: string
  author?: string
  date?: string
  backHref?: string
  backLabel?: string
  label?: string
  coverImage?: string
}

export interface CaseStudy {
  slug: string
  meta: Required<Pick<Frontmatter, 'title'>> &
    Omit<Frontmatter, 'title' | 'slug'> & {
      slug: string
      author: string
      backHref: string
      backLabel: string
      label: string
    }
  doc: RichTextDoc
}

function parseFrontmatter(source: string): { meta: Frontmatter; body: string } {
  if (!source.startsWith('---')) {
    return { meta: {}, body: source }
  }

  const endMarkerIndex = source.indexOf('\n---', 3)
  if (endMarkerIndex === -1) {
    return { meta: {}, body: source }
  }

  const rawMeta = source.slice(3, endMarkerIndex).trim()
  const body = source.slice(endMarkerIndex + 4).replace(/^\s+/, '')
  const meta: Frontmatter = {}

  for (const line of rawMeta.split(/\r?\n/)) {
    const [rawKey, ...rest] = line.split(':')
    if (!rawKey || !rest.length) continue
    const key = rawKey.trim() as keyof Frontmatter
    const value = rest.join(':').trim().replace(/^['"]|['"]$/g, '')
    meta[key] = value
  }

  return { meta, body }
}

async function loadCaseStudySource(slug: string) {
  const filePath = path.join(CASE_STUDIES_DIR, `${slug}.mdx`)
  try {
    const source = await fs.readFile(filePath, 'utf-8')
    return source
  } catch (_error) {
    return null
  }
}

export async function listCaseStudySlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(CASE_STUDIES_DIR)
    return entries.filter((file) => file.endsWith('.mdx')).map((file) => file.replace(/\.mdx$/, ''))
  } catch (_error) {
    return []
  }
}

export async function loadCaseStudy(slug: string): Promise<CaseStudy | null> {
  const source = await loadCaseStudySource(slug)
  if (!source) return null

  const { meta: parsedMeta, body } = parseFrontmatter(source)

  const title = parsedMeta.title ?? slug
  const author = parsedMeta.author ?? 'Ryan Dharma'
  const backHref = parsedMeta.backHref ?? '/'
  const backLabel = parsedMeta.backLabel ?? '← Back to main site'
  const label = parsedMeta.label ?? 'CASE STUDY'

  return {
    slug,
    meta: {
      ...parsedMeta,
      slug,
      title,
      author,
      backHref,
      backLabel,
      label,
    },
    doc: markdownToDoc(body),
  }
}

export async function listCaseStudies(): Promise<CaseStudy[]> {
  const slugs = await listCaseStudySlugs()
  const studies = await Promise.all(slugs.map((slug) => loadCaseStudy(slug)))
  return studies.filter((study): study is CaseStudy => Boolean(study)).sort((a, b) => {
    const dateA = a.meta.date ? new Date(a.meta.date).getTime() : 0
    const dateB = b.meta.date ? new Date(b.meta.date).getTime() : 0
    return dateB - dateA
  })
}
