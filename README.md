# Personal Web + Blog CMS

This repo contains the Next.js App Router site for Ryan Dharma. The landing page and existing case studies stay untouched while a lightweight blogging CMS now powers `/blog` and the `/admin` tools.

## Prerequisites

- Node.js 18+
- SQLite 3 (used locally by Prisma)

## Environment variables

Create an `.env` file based on `.env.example` and set:

```
DATABASE_URL="file:./prisma/dev.db"
ADMIN_PASSWORD="super-secure-password"
BLOB_READ_WRITE_TOKEN="<vercel blob read/write token>"
```

The `ADMIN_PASSWORD` gates the `/admin` routes via middleware. The blob token is required for image uploads from the TipTap editor.

## Database & Prisma

1. Install dependencies: `npm install`
2. Apply the existing migration (or generate a new SQLite database) with:
   ```
   npx prisma migrate dev --name init
   ```
   This seeds `prisma/dev.db` with the `Post` table defined in `prisma/schema.prisma`.
3. Generate the Prisma client if needed: `npx prisma generate`

## Local development

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

- `/blog` lists all published posts.
- `/blog/[slug]` renders a single post using the shared `PostLayout`.
- `/admin/login` prompts for the password from `ADMIN_PASSWORD`.
- `/admin` exposes CRUD controls plus links to `/admin/new` and `/admin/edit/[id]` which include the TipTap editor, Vercel Blob uploads, and publish workflows.

Image uploads go through `POST /api/upload`, which stores files in Vercel Blob and returns the public URL that TipTap uses.
