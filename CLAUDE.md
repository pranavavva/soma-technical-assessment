# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Soma Capital technical assessment: a Next.js 14 todo app with SQLite/Prisma backend. The task is to extend it with due dates, Pexels image previews, and a task dependency system (with circular dependency prevention, critical path, earliest start dates, and dependency graph visualization).

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx prisma migrate dev` — apply schema changes and regenerate client
- `npx prisma generate` — regenerate Prisma client without migrating
- `npx prisma studio` — GUI for browsing the SQLite database

## Environment

- Node 20 (managed via mise)
- `PEXELS_API_KEY` in `.env` — required for image search (get from https://www.pexels.com/api/)
- Optional: direnv with `.envrc` to auto-load env vars

## Architecture

Next.js App Router with a single-page client component (`app/page.tsx`) that talks to API routes.

**Data layer:** Prisma ORM with SQLite (`prisma/dev.db`). Schema in `prisma/schema.prisma`. Singleton client in `lib/prisma.ts` (cached on `global` to survive HMR).

**API routes:**
- `app/api/todos/route.ts` — `GET` (list all) and `POST` (create)
- `app/api/todos/[id]/route.ts` — `DELETE` by id

**Frontend:** Single `"use client"` page component with local state, fetches from `/api/todos`. Styled with Tailwind CSS. Uses local Geist fonts via `next/font/local`.

**Path alias:** `@/*` maps to project root (e.g., `@/lib/prisma`).

## Notes

- The `.env` and `.envrc` files are gitignored; `.env.example` and `.envrc.example` are committed.
- The SQLite database file (`prisma/dev.db`) is committed. After schema changes, run `npx prisma migrate dev`.
- No test framework is set up.
