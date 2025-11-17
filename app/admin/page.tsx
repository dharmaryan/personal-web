import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { deletePostAction, togglePublishAction } from './actions'

export default async function AdminDashboard() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className='flex-1 bg-white px-6 py-16 text-slate-900'>
      <div className='mx-auto max-w-5xl'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm uppercase tracking-wide text-slate-400'>Admin</p>
            <h1 className='text-3xl font-semibold text-slate-900'>Posts</h1>
          </div>
          <Link
            href='/admin/new'
            className='inline-flex items-center rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white hover:bg-brand-blue/90'
          >
            New Post
          </Link>
        </div>
        <div className='mt-10 overflow-hidden rounded-3xl border border-slate-200'>
          <table className='min-w-full divide-y divide-slate-200 text-left text-sm'>
            <thead className='bg-slate-50 text-slate-500'>
              <tr>
                <th className='px-6 py-3 font-semibold'>Title</th>
                <th className='px-6 py-3 font-semibold'>Slug</th>
                <th className='px-6 py-3 font-semibold'>Status</th>
                <th className='px-6 py-3 font-semibold'>Created</th>
                <th className='px-6 py-3 font-semibold text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 text-slate-700'>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className='px-6 py-4 font-medium text-slate-900'>{post.title}</td>
                  <td className='px-6 py-4 text-slate-500'>{post.slug}</td>
                  <td className='px-6 py-4'>
                    <span className={post.published ? 'text-emerald-600' : 'text-slate-400'}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-slate-500'>
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-wrap items-center justify-end gap-3 text-sm'>
                      <Link href={`/admin/edit/${post.id}`} className='text-brand-blue hover:underline'>
                        Edit
                      </Link>
                      <form action={togglePublishAction}>
                        <input type='hidden' name='id' value={post.id} />
                        <input type='hidden' name='publish' value={(!post.published).toString()} />
                        <button type='submit' className='text-slate-500 hover:text-slate-900'>
                          {post.published ? 'Unpublish' : 'Publish'}
                        </button>
                      </form>
                      <form action={deletePostAction}>
                        <input type='hidden' name='id' value={post.id} />
                        <button type='submit' className='text-red-500 hover:text-red-700'>
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
