# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### SkinScan — Mobile App (`artifacts/mobile`)

React Native + Expo mobile app for the senior project:
**"Automated Extraction of Skincare Product Ingredients Using Image Processing and OCR"**

#### Screens
| File | Route | Purpose |
|---|---|---|
| `app/(tabs)/index.tsx` | `/` | Home screen — entry point with Camera & Gallery CTAs |
| `app/camera.tsx` | `/camera` | Camera capture screen using `expo-image-picker` |
| `app/gallery.tsx` | `/gallery` | Gallery picker screen using `expo-image-picker` |
| `app/preview.tsx` | `/preview` | Image preview screen before extraction |
| `app/results.tsx` | `/results` | OCR results screen (placeholder — OCR not yet implemented) |

#### Key decisions
- **No backend, no database, no auth** — frontend-only by design
- **expo-image-picker** used for both camera and gallery (Expo Go compatible)
- **Navigation**: Expo Router file-based Stack (no tabs needed beyond the root shell)
- **Color palette**: Sage green (`#4a7c59`) on white — clean, health-inspired
- **Fonts**: Inter (400/500/600/700) pre-loaded

#### OCR integration points
- `app/results.tsx` — add OCR call here, replacing the `OCRPlaceholder` component
- `app/preview.tsx` — `handleExtract()` passes `uri` to the results route

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
