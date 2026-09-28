<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Retana UI

This repo is Eduardo's catalog of reusable shadcn pieces (components, blocks, hooks). `registry.json` is the source of truth. The site lists it at `/` and `/items/[name]`.

## Inherit the host, bring no theme

Registry items do not ship a theme. No CSS variables, no `cssVars`, no colors, fonts, radii, or shadow tokens, no Tailwind theme edits, and no global CSS under `registry/`. Use shadcn semantic classes only. Reuse host primitives via `registryDependencies`. Do not copy `components/ui` primitives into `registry/`. The demo theme stays in `app/globals.css` and `app/layout.tsx`.

`pnpm registry:build` fails if an item is missing `meta.descriptionEs` or a preview, if `registry/` contains hex, `rgb`/`oklch`, Tailwind palette classes, or `cssVars`, or if a built `public/r/*.json` payload still imports `@/registry/retana` (those specifiers are rewritten to `@/lib`, `@/components/ui`, and `@/hooks`).

## Agregar una pieza nueva

1. Add source under `registry/ui`, `registry/blocks`, `registry/hooks`, or `registry/lib`.
2. Register it in `registry.json` with `meta.titleEs`, `meta.descriptionEs`, `meta.preview`, `meta.previewHref`, `meta.examples`, `meta.usage`, and `meta.api`.
3. Add the thumbnail at `app/examples/<name>/preview.tsx` and the live example page under `app/examples/<name>/`.
4. Run `pnpm registry:build`, then `pnpm test` and `pnpm build`.
5. Do not hand-edit `public/r/*.json` or `lib/generated/preview-map.tsx`.

Full checklist, in Spanish, is in `CONTRIBUTING.md`.
