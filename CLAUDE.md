# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Soma Capital technical assessment: a Next.js 16 todo app with SQLite/Prisma backend, featuring due dates, Pexels image previews, and a task dependency system (circular dependency prevention, critical path analysis, earliest start dates, and dependency graph visualization).

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint check
- `npm run lint:fix` — ESLint autofix
- `npm run format` — Prettier check
- `npm run format:fix` — Prettier autofix
- `npm run db:migrate` — apply schema changes and regenerate client (`prisma migrate dev`)
- `npm run db:generate` — regenerate Prisma client without migrating
- `npm run db:studio` — GUI for browsing the SQLite database
- `npm run db:sqlite` — open raw SQLite shell on `prisma/dev.db`

## Environment

- Node 20 (managed via mise)
- `DATABASE_URL` in `.env` — SQLite connection string, used by `prisma.config.ts`
- `PEXELS_API_KEY` in `.env` — required for image search (get from https://www.pexels.com/api/)
- Optional: direnv with `.envrc` to auto-load env vars

## Architecture

Next.js App Router with source files under `src/`. The home page (`src/app/page.tsx`) is an async **server component** that queries Prisma directly, computes graph metrics, and passes data down to client components.

**Data layer:** Prisma 7 ORM with SQLite. Schema in `prisma/schema.prisma`. Generated client outputs to `src/generated/prisma/`. Prisma config (datasource URL) in `prisma.config.ts`. Singleton client in `src/lib/prisma.ts` (cached on `global` to survive HMR).

**Data model:** Two tables — `Todo` (tasks) and `TodoRelationship` (directed dependency edges). The relationship is a digraph: `dependentId` depends on `dependencyId`. A todo's `dependencies` are what it waits on; `dependents` are what waits on it.

**API routes:**

- `src/app/api/todos/route.ts` — `GET` (list all) and `POST` (create with title + optional dueDate)
- `src/app/api/todos/[id]/route.ts` — `DELETE` by id

**Dependency graph system (`src/lib/graph/`):**

- `types.ts` — branded `TodoId` type, `AdjacencyList`, `buildAdjacencyList()` from relationship rows
- `topological-sort.ts` — Kahn's algorithm for topological ordering
- `cycle-detection.ts` — DFS-based cycle check (used client-side before adding edges)
- `critical-path.ts` — longest-chain critical path and earliest-start-date calculation

**Frontend:**

- UI components via shadcn/ui (radix-nova style, Zinc base color) in `src/components/ui/`
- Task-specific components in `src/components/tasks/` — TanStack React Table data table with toolbar, inline add row, dependency selector (with client-side cycle detection), and React Flow dependency graph
- Tab navigation between table and graph views, persisted in URL via `nuqs`

**Path alias:** `@/*` maps to `src/*` (configured in `tsconfig.json`). Relative imports (`./`, `../`) are **banned by ESLint** in `src/` — always use `@/` aliases.

## Pre-commit Hooks

Uses `prek` (a pre-commit hook runner). Config in `prek.toml`. Hooks run ESLint + Prettier autofix on staged files, plus YAML/TOML/JSON validation and whitespace fixes. Install hooks with `npm run prek:install`.

## Notes

- The `.env` and `.envrc` files are gitignored; `.env.example` and `.envrc.example` are committed.
- The SQLite database file (`prisma/dev.db`) is committed. After schema changes, run `npm run db:migrate`.
- No test framework is set up.
- Prettier: 120 char line width, double quotes, trailing commas. Config in `.prettierrc`.
- Next.js config enables `typedRoutes` and allows `images.pexels.com` as a remote image pattern.
