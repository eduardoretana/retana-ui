# Contributing

Registry items in this repo are installed into existing apps (CRMs, ops portals, the clinic app). Each of those apps already has a shadcn theme. A new item must inherit that theme.

## Inherit the host, bring no theme

- Do not ship a theme. No CSS variables, no color, font, radius, or shadow tokens, no Tailwind config or `@theme` changes, no `cssVars` on the registry item, and no global CSS file.
- Style only with the standard shadcn semantic classes: `bg-background`, `bg-popover`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border`, `border-border`, `ring`, `accent`, `primary`, `shadow-*`, and `rounded-*`. Those classes resolve to the host's tokens, including dark mode.
- Reuse the host's primitives through `registryDependencies` (`button`, `badge`, `scroll-area`, `separator`, and so on). Do not copy those files into `registry/` and do not edit their variants to match a mock.
- `shadcn add` asks before it overwrites a file that already exists. Document that the answer is **no** for any primitive the host already has. Only the new item's files should be written.
- Prefer props over hard-coded sizes. Widths, labels, and a `className` (or a named slot class) on every part belong in the public API, with a sensible default.
- The demo site may define its own theme so the preview is readable. Keep that theme in `app/` (`app/globals.css`, `app/layout.tsx`). Do not import it from anything under `registry/`.

`registry.json` should list `dependencies` and `registryDependencies` the item actually imports, and nothing else. Run `pnpm registry:build` so `public/r/*.json` and `lib/generated/preview-map.tsx` stay in sync. The built JSON must not contain a `cssVars` key.

Catalog metadata lives on each item's `meta` object (shadcn passes `meta` through). The index and `/items/[name]` read `registry.json` only.

## Agregar una pieza nueva

1. Crea el código en una de estas carpetas: `registry/ui` (componente), `registry/blocks` (bloque de página), `registry/hooks` (hook) o `registry/lib` (helper). Sin CSS global, sin `cssVars`, sin colores, fuentes ni tokens propios. Solo clases semánticas de shadcn.
2. Agrega el item en `registry.json`: `name`, `type`, `title`, `description` (inglés), `categories`, `dependencies`, `registryDependencies`, `files` (rutas dentro de esas carpetas) y `meta`.
3. En `meta` escribe `titleEs`, `descriptionEs`, `preview` (un `.tsx` en `app/examples/<name>/preview.tsx`), `previewHref` (ruta `/examples/...` con la demo en vivo), `examples`, `usage` y `api` (filas para la tabla de props). La vista previa y la demo viven en `app/`, nunca en `registry/`.
4. Declara los primitivos del anfitrión en `registryDependencies` (`button`, `scroll-area`, …). No copies esos archivos. En la documentación indica que, si `shadcn add` pregunta si debe sobrescribirlos, la respuesta es **no**.
5. Corre `pnpm registry:build`. El script valida el item, genera `public/r/<name>.json` y regenera el mapa de vistas previas. Falla si falta la descripción, la preview, o si `registry/` trae `cssVars`, hex, `rgb`/`oklch` o clases de paleta (`bg-blue-500`).
6. Corre `pnpm test` y `pnpm build`. La pieza aparece en `/` y en `/items/<name>`.
