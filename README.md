# Pathshala

Pathshala is a learning platform built with SvelteKit, Prisma, and Supabase. It supports author-led articles, reader subscriptions, and admin moderation.

## Features

- Supabase magic-link authentication
- Reader and author roles with profile management
- Article browsing, author pages, and related content
- Subscriptions ("flows") to follow authors
- Admin tools for publishing control
- Supabase Storage uploads for profile images

## Tech stack

- SvelteKit + Svelte 5
- Prisma + PostgreSQL
- Supabase (Auth, Storage)
- Vite, Playwright, Vitest

## Getting started

Install dependencies:

```sh
npm install
```

Create a `.env` file with these variables:

```sh
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
DIRECT_URL=...
```

Run the app:

```sh
npm run dev
```

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run test` - unit + e2e tests
