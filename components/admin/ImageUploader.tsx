'use client'

import { useState, type ChangeEvent } from 'react'

interface ImageUploaderProps {
  value: string
  onChange: (value: string) => void
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      const data = await response.json()
      onChange(data.url)
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='space-y-3'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
        <input type='file' accept='image/*' onChange={handleFileChange} className='text-sm' />
        {uploading && <p className='text-sm text-slate-500'>Uploading…</p>}
        {error && <p className='text-sm text-red-600'>{error}</p>}
      </div>
      <div>
        <label className='block text-sm font-medium text-slate-700'>Cover image URL</label>
        <input
          type='text'
          className='mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40'
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder='https://'
        />
      </div>
      {value && (
        <div className='overflow-hidden rounded-2xl border border-slate-200'>
          <img src={value} alt='Cover preview' className='h-48 w-full object-cover' />
        </div>
      )}
    </div>
  )
}
