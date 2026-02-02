# Pathshala

[![Build and Push Dockploy Image](https://github.com/mrzahidxy/learning-social-app/actions/workflows/dockpoly.yaml/badge.svg)](https://github.com/mrzahidxy/learning-social-app/actions/workflows/dockpoly.yaml)
[![Version](https://img.shields.io/github/package-json/v/mrzahidxy/learning-social-app)](https://github.com/mrzahidxy/learning-social-app/blob/main/package.json)
[![Node](https://img.shields.io/badge/node-20.x-339933)](https://nodejs.org/)

Pathshala is a learning platform built with SvelteKit, Prisma, and Supabase. It supports author-led articles, reader subscriptions ("flows"), and admin moderation.

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
- Tailwind CSS
- Vite, Playwright, Vitest

## Requirements

- Node.js 20.x
- npm 9+ (bundled with Node)
- A PostgreSQL database (local or hosted)
- Supabase project (Auth + Storage enabled)

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

Initialize the database (first time only):

```sh
npx prisma migrate dev
```

Optional: seed sample data:

```sh
npm run seed
```

Run the app:

```sh
npm run dev
```

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run check` - type-check and sync SvelteKit
- `npm run lint` - format check + lint
- `npm run format` - format the codebase
- `npm run test:unit` - unit tests (Vitest)
- `npm run test:e2e` - end-to-end tests (Playwright)
- `npm run test` - unit + e2e tests
- `npm run seed` - seed the database

## Configuration

Environment variables:

- `PUBLIC_SUPABASE_URL` - Supabase project URL (build-time)
- `PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (build-time)
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase key (runtime)
- `DATABASE_URL` - Prisma database URL
- `DIRECT_URL` - Prisma direct connection URL (non-pooled)

Notes:

- `PUBLIC_*` variables are baked into the client bundle; change requires rebuild.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and out of client code.

## Usage

Local development:

```sh
npm run dev
```

Production preview:

```sh
npm run build
npm run preview
```

Docker build and run:

```sh
docker build \
  --build-arg PUBLIC_SUPABASE_URL=... \
  --build-arg PUBLIC_SUPABASE_ANON_KEY=... \
  -t pathshala:local .

docker run --rm -p 3000:3000 \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e DATABASE_URL=... \
  -e DIRECT_URL=... \
  pathshala:local
```

## CI/CD

GitHub Actions builds and pushes a Docker image on every push to `main` and on manual dispatch via the workflow in `.github/workflows/dockpoly.yaml`.

## Screenshots

Screenshots are not yet included. If you add UI captures, place them in `static/` and link them here.

## Troubleshooting

- **Supabase auth fails**: Verify `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are set and match your Supabase project.
- **Server errors related to admin calls**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set at runtime, not in client code.
- **Prisma connection errors**: Check `DATABASE_URL` and `DIRECT_URL`, and confirm the database is reachable.
- **Playwright errors**: Run `npx playwright install` after dependencies are installed.
- **Node version mismatches**: Use Node 20.x (aligns with Docker base image).

## Contributing

1. Create a feature branch from `main`.
2. Run `npm run check`, `npm run lint`, and `npm run test` before opening a PR.
3. Keep PRs focused and include a clear description of changes.

## Changelog

- **0.0.1** - Initial development baseline (current `package.json` version).

## Acknowledgments

- SvelteKit, Prisma, and Supabase communities
- Playwright and Vitest teams for testing tools

## Contact

- Maintainer: @mrzahidxy
- Issues: GitHub Issues on this repository
