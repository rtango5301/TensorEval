# Repository Guidelines

## Project Structure & Module Organization

TensorEval is a Next.js 15 App Router application. Routes and layouts live in `src/app/`; authenticated pages are grouped under `src/app/(authenticated)/`, while API handlers live in `src/app/api/`. Landing-page sections and shared components are in `src/components/`, with reusable primitives in `src/components/ui/` and shell components in `src/components/layouts/`. Put data access, authentication, validation, and integrations under `src/lib/`; React hooks belong in `src/hooks/`. Static files and canonical branding assets are stored in `public/`, especially `public/brand/`. Supabase configuration lives in `supabase/`.

## Build, Test, and Development Commands

- `npm install` — install dependencies and initialize Husky hooks.
- `npm run dev` — start the local application at `http://localhost:3000`.
- `npm run dev:clean` — clear `.next` and restart when the development cache is stale.
- `npm run format:check` — validate Prettier formatting.
- `npm run lint` — run ESLint with Next.js and TypeScript rules.
- `npm run typecheck` — run strict TypeScript checks without emitting files.
- `npm run build` — perform the production Next.js build.
- `npm run format` — apply Prettier formatting.

Stop the exact development-server process after local QA.

## Coding Style & Naming Conventions

Use TypeScript, two-space indentation, single quotes, semicolons, and a 100-character print width. Prettier and EditorConfig are authoritative. Prefer Server Components; add `'use client'` only for state, effects, browser APIs, or animation. Name React components in PascalCase, hooks as `useThing`, and utilities in camelCase. Reuse `cn()` and semantic CSS variables from `src/app/globals.css` instead of duplicating class-merging or color logic.

## Testing Guidelines

There is no committed automated test suite or coverage threshold. Validate changes with format, lint, typecheck, and build checks, then exercise affected routes locally. Playwright specifications, configuration, reports, and screenshots are local-only and must not be committed. Check responsive behavior, keyboard focus, console errors, and authenticated redirects when relevant.

## Commit & Pull Request Guidelines

Use focused Conventional Commit-style subjects such as `feat:`, `fix:`, `style:`, or `chore:`. Ask before running Git mutations. PRs should explain scope and user impact, link relevant issues, list verification performed, and include before/after screenshots for visual changes. Keep generated artifacts, environment files, and unrelated untracked work out of commits.

## Security & Agent Notes

Copy `.env.example` to `.env.local`; never commit secrets or service-role keys. At session start, scan for duplicate files such as `file 2.tsx` or `file copy.tsx`, and request confirmation before removing them.
