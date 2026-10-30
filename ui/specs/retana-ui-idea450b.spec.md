---
spec_id: retana-ui-idea450b
version: 1.0.0
head: 2f8d20198685d27718828101bca31490a619bfc6
spec_changelog:
  - version: 1.0.0
    origin: brief
    note: "IDEA-450 B. Perfil STANDARD. ui-system 4.0.0. Base cursor/mobile-fixes-c51d."
  - version: 1.0.1
    origin: seed
    note: "Seed versionado con un shot por URL. Mismo commit que el direction-map."
profile: STANDARD
brief:
  outcome: "El vidrio solo flota, el conteo neutro se lee como número, el círculo de avatares se ve a 390 px y los radios del demo dejan de usar multiplicadores sin cambiar el px."
  benefit: "Quien instala la pieza ve una superficie legible aunque el navegador no desenfoque, distingue un conteo de un estado, y el catálogo muestra el círculo sin fotos."
  sources: "IDEA-450, cola 1 del 2026-10-30, y la aprobación de Eduardo del mismo día. El video https://x.com/i/status/2116193966655934968 no tiene licencia: solo la idea, clean-room."
  scope: "Los 14 archivos con backdrop-blur, components/ui/badge.tsx, la escena circle de avatar-group y los pasos de radio en app/globals.css."
  checks: "Vitest, Playwright WebKit a 390 px, contraste, axe, impeccable detect, registry:build, build y el healthcheck /api/health."
  stop_when: "Esos comandos en verde, capturas antes y después a 390 px en el Agent Store, y el PR draft contra cursor/mobile-fixes-c51d."
  deliverable: "El diff de código en este PR más los artefactos de este ciclo. ui-system 4.0.0. La evidencia de suite y renders no se commitea."
scope_paths:
  - registry/lib/glass.ts
  - lib/glass.ts
  - app/catalog/site-header.tsx
  - app/globals.css
  - components/ui/badge.tsx
  - components/ui/dialog.tsx
  - components/ui/alert-dialog.tsx
  - components/ui/sheet.tsx
  - registry/ui/dock-nav.tsx
  - registry/ui/lightbox.tsx
  - registry/ui/admin-shell.tsx
  - registry/blocks/comparison-table.tsx
  - registry/ui/avatar-group.tsx
  - app/examples/avatar-group
  - app/review/idea-450/page.tsx
  - tests/mobile/idea-450.spec.ts
users:
  - "Quien abre un diálogo, el header del catálogo o el dock en el teléfono."
  - "Quien lee un conteo informativo y no debe confundirlo con un error."
  - "Quien mira el círculo de un equipo en el catálogo."
states:
  - idle
  - pending
  - success
  - error
  - empty
  - loading
  - partial
  - offline
  - rollback
  - permission_denied
  - overflow
  - i18n_long
data:
  - "Círculo: Inés Ejemplo, Diego Ejemplo y Marta Muestra. Placeholders SVG, no fotos."
  - "Badge: 3 sin leer. Destructivo: Error."
  - "Tarjeta: Horno 2, radio xl."
brand_constraints:
  - "Sin tema propio. Solo clases semánticas del host."
  - "ui-system 4.0.0. No se declaran reglas de 4.1.0 porque esa versión no está mergeada."
  - "Dos variantes del círculo. Se elige nombres abajo."
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: git-sha
components:
  retana:
    - avatar-group
    - badge
    - dialog
    - dock-nav
  candidates_local: []
  retana_ui_layer: VERIFIED
visual_risk: medium
copy:
  locale:
    - es-MX
    - en
  voice: "Círculo del taller / Workshop circle. Sin el copy del video."
direction:
  mode: chosen
  images: none
  reference_id: circle-names-below
non_goals:
  - "Reglas RUI-GLASS y RUI-BADGE en el hub (eso es IDEA-450 A)."
  - "Copiar valores en pt o meter fotos."
  - "Glass en filas o blur animado."
  - "iPhone real."
  - "Merge."
  - "Veredicto de auditoría (lo da otro agente)."
acceptance:
  - id: AC-1
    statement: "Hay dos variantes del círculo y una está elegida."
    measure: "selection.md nombra el eje name_place y elige below. circle-above sigue visible."
    test: "ui/direction/retana-ui-idea450b/selection.md"
  - id: AC-2
    statement: "Sin backdrop-filter la superficie es opaca y el texto contrasta al menos 4.5:1."
    measure: "La clase lleva bg-background fuera de supports-[backdrop-filter]. El par foreground/background computado es ≥4.5:1 en claro y oscuro."
    test: "tests/mobile/idea-450.spec.ts › el fallback opaco del header"
  - id: AC-3
    statement: "El badge y el punto neutros contrastan al menos 3:1 y el número es texto."
    measure: "Fondo del badge contra el fondo de página ≥3:1. Texto del count ≥4.5:1. aria-label contiene el número."
    test: "tests/mobile/idea-450.spec.ts › badge neutro y __tests__/badge-count.test.tsx"
  - id: AC-4
    statement: "Las cuatro fixtures del círculo renderizan a 390 px sin desborde."
    measure: "scrollWidth - clientWidth ≤ 1 en filled, empty, loading y error."
    test: "tests/mobile/idea-450.spec.ts › las cuatro escenas del círculo no desbordan a 390"
  - id: AC-5
    statement: "globals.css no multiplica --radius y los px computados no cambian."
    measure: "Cero coincidencias de var(--radius) *. sm 6px, md 8px, lg 10px, xl 14px, 2xl 18px, 3xl 22px, 4xl 26px."
    test: "__tests__/radius-tokens.test.ts y tests/mobile/idea-450.spec.ts › los radios computados"
  - id: AC-6
    statement: "Vitest, Playwright, lint, tsc y build quedan verdes y el detector no añade bounce-easing."
    measure: "pnpm test y pnpm exec playwright test salen 0. impeccable detect después no tiene bounce-easing nuevo."
    test: "pnpm test. El log no vive en el árbol: el gate lo recibe por --suite-log y debe declarar el HEAD del PR."
---

# IDEA-450 B

Glass, badge neutro, escena circle y radios fijos dentro de retana-ui. Perfil STANDARD. ui-system 4.0.0.

## Runtime para VibeBot

El render lo levanta VibeBot sobre este head, en `127.0.0.1`, puerto ≥ 40000. Los renders de la VM del builder no cuentan.

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm exec next start --hostname "${HOST:-127.0.0.1}" --port "${PORT:-40000}"
curl -sS -D - -o /dev/null "http://${HOST:-127.0.0.1}:${PORT:-40000}/api/health"
```

`/api/health` responde 200 JSON `{"ok":true}` y no redirige. `HOST` y `PORT` son los flags `--hostname` y `--port`.

## Seed

`ui/direction/fixtures/retana-ui-idea450b.seed.yaml`. Cada estado es no vacío y se aplica solo con query params en `/review/idea-450`.

`shot` aísla una superficie. `theme=light|dark` pone o quita la clase `dark`. `locale=es|en` cambia el copy (es es es-MX). `transparency=reduce` pone `html[data-transparency=reduce]` y fuerza el fallback opaco del glass. Sin ese param, el glass sigue la media query.

`shot=circle` (nombres abajo) y `shot=circle-above` (nombres arriba) son páginas distintas. El sha256 repetido de la VM salió porque las dos filas cabían en el mismo viewport de 390×844.
