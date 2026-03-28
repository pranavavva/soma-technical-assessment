# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Soma Capital technical assessment: a Next.js 16 todo app with SQLite/Prisma backend. The task is to extend it with due dates, Pexels image previews, and a task dependency system (with circular dependency prevention, critical path, earliest start dates, and dependency graph visualization).

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint check
- `npm run lint:fix` — ESLint autofix
- `npm run format` — Prettier check
- `npm run format:fix` — Prettier autofix
- `npx prisma migrate dev` — apply schema changes and regenerate client
- `npx prisma generate` — regenerate Prisma client without migrating
- `npx prisma studio` — GUI for browsing the SQLite database

## Environment

- Node 20 (managed via mise)
- `DATABASE_URL` in `.env` — SQLite connection string, used by `prisma.config.ts`
- `PEXELS_API_KEY` in `.env` — required for image search (get from https://www.pexels.com/api/)
- Optional: direnv with `.envrc` to auto-load env vars

## Architecture

Next.js App Router with source files under `src/`. Single-page client component (`src/app/page.tsx`) that talks to API routes.

**Data layer:** Prisma 7 ORM with SQLite. Schema in `prisma/schema.prisma`. Generated client outputs to `src/generated/prisma/`. Prisma config (datasource URL) in `prisma.config.ts`. Singleton client in `src/lib/prisma.ts` (cached on `global` to survive HMR).

**API routes:**

- `src/app/api/todos/route.ts` — `GET` (list all) and `POST` (create)
- `src/app/api/todos/[id]/route.ts` — `DELETE` by id

**Frontend:** Single `"use client"` page component with local state, fetches from `/api/todos`. Styled with Tailwind CSS v4. Uses local Geist fonts via `next/font/local`.

**Path alias:** `@/*` maps to `src/*` (configured in `tsconfig.json` with `baseUrl: "src/"`).

## Pre-commit Hooks

Uses `prek` (a pre-commit hook runner). Config in `prek.toml`. Hooks run ESLint + Prettier autofix on staged files, plus YAML/TOML/JSON validation and whitespace fixes. Install hooks with `npm run prek:install`.

## Notes

- The `.env` and `.envrc` files are gitignored; `.env.example` and `.envrc.example` are committed.
- The SQLite database file (`prisma/dev.db`) is committed. After schema changes, run `npx prisma migrate dev`.
- No test framework is set up.
