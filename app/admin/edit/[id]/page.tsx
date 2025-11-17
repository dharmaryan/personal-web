import Link from 'next/link'
import { notFound } from 'next/navigation'
import PostEditorForm from '@/components/admin/PostEditorForm'
import { prisma } from '@/lib/prisma'
import { deletePostAction, updatePostAction } from '../../actions'

export const dynamic = 'force-dynamic'

interface EditPageProps {
  params: { id: string }
}

export default async function EditPostPage({ params }: EditPageProps) {
  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) {
    notFound()
  }

  return (
    <main className='flex-1 bg-white px-6 py-16 text-slate-900'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-10 flex items-center justify-between'>
          <div>
            <p className='text-sm uppercase tracking-wide text-slate-400'>Admin</p>
            <h1 className='text-3xl font-semibold text-slate-900'>Edit Post</h1>
          </div>
          <Link href='/admin' className='text-sm text-slate-500 hover:text-slate-900'>Back to dashboard</Link>
        </div>
        <PostEditorForm
          action={updatePostAction}
          initialData={{
            id: post.id,
            title: post.title,
            subtitle: post.subtitle,
            author: post.author,
            coverImage: post.coverImage,
            content: post.content,
          }}
        >
          <button
            type='submit'
            name='intent'
            value='save'
            className='rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400'
          >
            Save Changes
          </button>
          <button
            type='submit'
            name='intent'
            value={post.published ? 'unpublish' : 'publish'}
            className='rounded-full bg-brand-blue px-6 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90'
          >
            {post.published ? 'Unpublish' : 'Publish'}
          </button>
        </PostEditorForm>
        <form action={deletePostAction} className='mt-6'>
          <input type='hidden' name='id' value={post.id} />
          <button type='submit' className='text-sm text-red-500 hover:text-red-700'>Delete post</button>
        </form>
      </div>
    </main>
  )
}
