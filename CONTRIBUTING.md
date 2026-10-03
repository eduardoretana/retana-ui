# Contributing

Registry items in this repo are installed across my projects. Each of those apps already has a shadcn theme. A new item must inherit that theme.

## Inherit the host, bring no theme

- Do not ship a theme. No CSS variables, no color, font, radius, or shadow tokens, no Tailwind config or `@theme` changes, no `cssVars` on the registry item, and no global CSS file.
- Style only with the standard shadcn semantic classes: `bg-background`, `bg-popover`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border`, `border-border`, `ring`, `accent`, `primary`, `shadow-*`, and `rounded-*`. Those classes resolve to the host's tokens, including dark mode.
- Reuse the host's primitives through `registryDependencies` (`button`, `badge`, `scroll-area`, `separator`, and so on). Do not copy those files into `registry/` and do not edit their variants to match a mock.
- `shadcn add` asks before it overwrites a file that already exists. Document that the answer is **no** for any primitive the host already has. Only the new item's files should be written.
- Prefer props over hard-coded sizes. Widths, labels, and a `className` (or a named slot class) on every part belong in the public API, with a sensible default.
- The demo site may define its own theme so the preview is readable. Keep that theme in `app/` (`app/globals.css`, `app/layout.tsx`). Do not import it from anything under `registry/`.

## Sources

- Paid component libraries are never ported.
- An unlicensed reference is clean-room only: implement the behavior, and copy no source, sample data, icons, or assets. Say so in `NOTICE` and in the item's `docs`.
- An MIT (or similarly permissive) adaptation keeps the upstream copyright in `NOTICE`, and a short note in the installed file when the notice has to travel with the code.
- Liveblocks stays on the Apache-2.0 client packages `@liveblocks/client` and `@liveblocks/react`. `@liveblocks/node` may be documented for a host server. Do not add `@liveblocks/server` or the `liveblocks` CLI. Those are AGPL-3.0.
- A new npm package goes in the item's `dependencies` and in the root `package.json`. `motion` is the package Arc-adapted pieces use for timing. It does not add colors or fonts.

`registry.json` should list `dependencies` and `registryDependencies` the item actually imports, and nothing else. Run `pnpm registry:build` so `public/r/*.json` and `lib/generated/preview-map.tsx` stay in sync. The built JSON must not contain a `cssVars` key.

Catalog metadata lives on each item's `meta` object (shadcn passes `meta` through). The index and `/items/[name]` read `registry.json` only.

## Agregar una pieza nueva

1. Crea el código en una de estas carpetas: `registry/ui` (componente), `registry/blocks` (bloque de página), `registry/hooks` (hook) o `registry/lib` (helper). Sin CSS global, sin `cssVars`, sin colores, fuentes ni tokens propios. Solo clases semánticas de shadcn.
2. Agrega el item en `registry.json`: `name`, `type`, `title`, `description` (inglés), `categories`, `dependencies`, `registryDependencies`, `files` (rutas dentro de esas carpetas) y `meta`.
3. En `meta` escribe `titleEs`, `descriptionEs`, `preview` (un `.tsx` en `app/examples/<name>/preview.tsx`), `previewHref` (ruta `/examples/...` con la demo en vivo), `examples`, `usage` y `api` (filas para la tabla de props). La vista previa y la demo viven en `app/`, nunca en `registry/`.
4. Declara los primitivos del anfitrión en `registryDependencies` (`button`, `scroll-area`, …). No copies esos archivos. En la documentación indica que, si `shadcn add` pregunta si debe sobrescribirlos, la respuesta es **no**.
5. Corre `pnpm registry:build`. El script valida el item, genera `public/r/<name>.json` y regenera el mapa de vistas previas. Falla si falta la descripción, la preview, o si `registry/` trae `cssVars`, hex, `rgb`/`oklch` o clases de paleta (`bg-blue-500`). También reescribe los imports `@/registry/retana/...` del payload a `@/lib`, `@/components/ui` y `@/hooks`, y falla si queda un import que el host no puede resolver.
6. Corre `pnpm readme:catalog` para regenerar el bloque del README. No edites a mano lo que está entre `<!-- CATALOG:START -->` y `<!-- CATALOG:END -->`.
7. Si la pieza adapta una fuente con licencia, o es clean-room, actualiza `NOTICE` y el campo `docs` del item. La página `/items/<name>` muestra ese texto junto al comando de instalación.
8. Corre `pnpm test` y `pnpm build`. La pieza aparece en `/` y en `/items/<name>`.

## Escenarios de estrés

Cada pieza nueva incluye una ruta `app/examples/<nombre>/stress/page.tsx`. Es un client component que importa el componente real del registry, sin cambiarle los estilos, y muestra solo los ejes que aplican a esa pieza. Cada bloque lleva una etiqueta visible.

- Largo del contenido: vacío, una palabra, varias frases y una cadena de 60 caracteres sin espacios.
- Forma del contenido: emoji, texto de derecha a izquierda y alineación de números.
- Cantidad: 0, 1, un caso realista y diez veces más elementos.
- Contenedor: 320px, apretado por un hermano en un flex y muy ancho.
- Estado: carga, vacío o deshabilitado, cuando la pieza tiene esos estados.

Si algo se rompe a la vista —texto que se sale, foco que desaparece, un desborde que tapa otro control— se corrige en la pieza antes de darla por lista.
