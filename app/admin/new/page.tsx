import Link from 'next/link'
import PostEditorForm from '@/components/admin/PostEditorForm'
import { createPostAction } from '../actions'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function NewPostPage() {
  return (
    <main className='flex-1 bg-white px-6 py-16 text-slate-900'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-10 flex items-center justify-between'>
          <div>
            <p className='text-sm uppercase tracking-wide text-slate-400'>Admin</p>
            <h1 className='text-3xl font-semibold text-slate-900'>Create Post</h1>
          </div>
          <Link href='/admin' className='text-sm text-slate-500 hover:text-slate-900'>Back to dashboard</Link>
        </div>
        <PostEditorForm action={createPostAction}>
          <button
            type='submit'
            name='intent'
            value='draft'
            className='rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400'
          >
            Save Draft
          </button>
          <button
            type='submit'
            name='intent'
            value='publish'
            className='rounded-full bg-brand-blue px-6 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90'
          >
            Publish
          </button>
        </PostEditorForm>
      </div>
    </main>
  )
}
