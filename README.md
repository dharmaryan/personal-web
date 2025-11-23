# Personal Web

This repo contains the Next.js App Router site for Ryan Dharma. The landing page and case studies are fully static and powered by MDX content—no database or admin CMS is required.

## Content

- Case studies live in `content/case-studies/*.mdx`.
- Each file uses frontmatter for metadata (e.g. `slug`, `title`, `summary`, `description`, `author`, `date`, `backHref`, `backLabel`, `label`).
- The body of the MDX file renders inside the shared `PostLayout` component.

### Adding a new case study

1. Create a new file in `content/case-studies/` (for example, `content/case-studies/new-piece.mdx`).
2. Add frontmatter with the slug and display fields:
   ```mdx
   ---
   slug: "new-piece"
   title: "Great New Piece"
   summary: "Short teaser for the article."
   description: "SEO-friendly description."
   author: "Ryan Dharma"
   date: "2025-01-01"
   backHref: "/"
   backLabel: "← Back to main site"
   label: "CASE STUDY"
   ---
   
   ## Heading
   Body content in MDX goes here.
   ```
3. The page becomes available at `/case-studies/<slug>` and is also listed under `/blog`.

## Local development

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

- `/case-studies/[slug]` renders a case study from the MDX content.
- `/blog` lists the available case studies using the same MDX source.
