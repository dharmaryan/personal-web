'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createSlugCandidate } from '@/lib/slugify'

async function ensureUniqueSlug(title: string, postId?: string) {
  const base = createSlugCandidate(title)
  let slug = base
  let counter = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (!existing || existing.id === postId) {
      return slug
    }
    slug = `${base}-${counter}`
    counter += 1
  }
}

function parseBoolean(value: FormDataEntryValue | null, fallback: boolean) {
  if (value === null) return fallback
  if (typeof value === 'string') {
    return value === 'true'
  }
  return fallback
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim()
}

export async function createPostAction(formData: FormData) {
  const title = getString(formData, 'title')
  const subtitle = getString(formData, 'subtitle') || null
  const author = getString(formData, 'author')
  const coverImage = getString(formData, 'coverImage') || null
  const content = getString(formData, 'content')
  const intent = getString(formData, 'intent')

  if (!title || !author || !content) {
    throw new Error('Title, author, and content are required')
  }

  const slug = await ensureUniqueSlug(title)
  const published = intent === 'publish'

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      subtitle,
      author,
      coverImage,
      content,
      published,
    },
  })

  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  redirect(published ? `/blog/${post.slug}` : `/admin/edit/${post.id}`)
}

export async function updatePostAction(formData: FormData) {
  const id = getString(formData, 'id')
  if (!id) {
    throw new Error('Post ID missing')
  }
  const title = getString(formData, 'title')
  const subtitle = getString(formData, 'subtitle') || null
  const author = getString(formData, 'author')
  const coverImage = getString(formData, 'coverImage') || null
  const content = getString(formData, 'content')
  const intent = getString(formData, 'intent')

  if (!title || !author || !content) {
    throw new Error('Title, author, and content are required')
  }

  const slug = await ensureUniqueSlug(title, id)

  let published: boolean | undefined
  if (intent === 'publish') {
    published = true
  } else if (intent === 'unpublish') {
    published = false
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      subtitle,
      author,
      coverImage,
      content,
      ...(published !== undefined ? { published } : {}),
    },
  })

  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  redirect(`/admin/edit/${post.id}`)
}

export async function deletePostAction(formData: FormData) {
  const id = getString(formData, 'id')
  if (!id) {
    throw new Error('Post ID missing')
  }

  const post = await prisma.post.delete({ where: { id } })
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  redirect('/admin')
}

export async function togglePublishAction(formData: FormData) {
  const id = getString(formData, 'id')
  const publishValue = formData.get('publish')
  if (!id) {
    throw new Error('Post ID missing')
  }
  const publish = parseBoolean(publishValue, false)

  const post = await prisma.post.update({
    where: { id },
    data: { published: publish },
  })

  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  redirect('/admin')
}
