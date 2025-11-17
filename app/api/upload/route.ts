import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN' }, { status: 500 })
  }

  const blob = await put(`blog/${Date.now()}-${file.name}`, file, {
    access: 'public',
    token,
  })

  return NextResponse.json({ url: blob.url })
}
