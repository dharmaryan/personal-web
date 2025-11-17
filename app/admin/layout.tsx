import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
