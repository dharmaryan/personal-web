import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

async function loginAction(formData: FormData) {
  'use server'

  const password = formData.get('password')
  const expected = process.env.ADMIN_PASSWORD

  if (!expected) {
    throw new Error('ADMIN_PASSWORD not set')
  }

  if (typeof password !== 'string' || password !== expected) {
    redirect('/admin/login?error=1')
  }

  cookies().set('admin-auth', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  redirect('/admin')
}

interface LoginPageProps {
  searchParams: Record<string, string | undefined>
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const hasError = Boolean(searchParams?.error)

  return (
    <main className='flex flex-1 items-center justify-center bg-white px-6 py-24 text-slate-900'>
      <form action={loginAction} className='w-full max-w-md rounded-3xl border border-slate-200 p-8 shadow-sm'>
        <h1 className='text-2xl font-semibold text-slate-900'>Admin Login</h1>
        <p className='mt-2 text-sm text-slate-500'>Enter the admin password to continue.</p>
        <label className='mt-8 block text-sm font-medium text-slate-900'>Password</label>
        <input
          type='password'
          name='password'
          required
          className='mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30'
        />
        {hasError && <p className='mt-2 text-sm text-red-600'>Incorrect password. Please try again.</p>}
        <button
          type='submit'
          className='mt-6 w-full rounded-full bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:bg-brand-blue/90'
        >
          Sign in
        </button>
      </form>
    </main>
  )
}
