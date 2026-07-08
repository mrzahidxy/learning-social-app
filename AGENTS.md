# AGENTS.md

## Project
Pathshala is a SvelteKit learning/social app using Prisma, PostgreSQL, Supabase, Tailwind, and Vite.

## Commands
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Type/check project: `npm run check`
- Run tests: `npm run test`
- Seed database: `npm run seed`
- Generate Prisma client: `npx prisma generate`

## Coding Guidelines
- Keep changes simple and focused.
- Avoid over-engineering.
- Prefer readable code over clever abstractions.
- Do not introduce new dependencies unless clearly needed.
- Preserve existing formatting and project style.
- Use TypeScript types where useful, but avoid unnecessary complexity.

## Environment
Required environment variables are documented in `.env.example`.
Do not commit real secrets from `.env`.

## Prisma
- Schema file: `prisma/schema.prisma`
- Seed file: `prisma/seed.ts`
- Seed data should be realistic and minimal.
- Current seed expectation: 3 reader users, 2 authors, and 1 admin.

