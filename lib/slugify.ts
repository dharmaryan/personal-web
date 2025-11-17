const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function createSlugCandidate(title: string) {
  const base = slugify(title)
  return base.length ? base : 'post'
}
