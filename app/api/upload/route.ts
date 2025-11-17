import { NextResponse } from 'next/server'

type BlobPutFunction = (path: string, file: File, options: { access: 'public'; token: string }) => Promise<{ url: string }>

async function loadBlobClient(): Promise<{ put: BlobPutFunction } | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const required = eval('require')('@vercel/blob') as Partial<{ put: BlobPutFunction }>
    if (typeof required?.put === 'function') {
      return { put: required.put }
    }
  } catch (error) {
    console.warn('Vercel Blob client is unavailable in this environment.')
  }
  return null
}

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

  const blobClient = await loadBlobClient()
  if (!blobClient) {
    return NextResponse.json({ error: 'Blob client unavailable' }, { status: 500 })
  }

  const blob = await blobClient.put(`blog/${Date.now()}-${file.name}`, file, {
    access: 'public',
    token,
  })

  return NextResponse.json({ url: blob.url })
}
