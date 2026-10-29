---
spec_id: bento-grid
version: 1.0.0
spec_changelog:
  - version: 1.0.0
    origin: brief
    note: "Alta de bento-grid y bento-feature-card. magnetic-bento queda como preset sobre la base."
profile: STANDARD
brief:
  outcome: "Una rejilla bento que reparte celdas por span y una tarjeta de función que entra en esas celdas."
  benefit: "El host arma muros de distinto tamaño sin copiar el layout ni traer un tema."
  sources: "Inspiración visual, sin código. Video adjunto del catálogo y la ficha pública."
  scope: "registry/ui/bento-grid.tsx, registry/ui/bento-feature-card.tsx, composición de magnetic-bento, ejemplos PLP y estrés."
  checks: "Vitest de la rejilla, de la tarjeta, de contrato de magnetic-bento y la suite ya existente sin editarla."
  stop_when: "Tests, typecheck, lint, registry:build y build en verde; capturas a 390 px y en desktop; PR draft contra CPL."
  deliverable: "Dos ítems de registry instalables, magnetic-bento sin cambio de API pública, y los artefactos de este archivo."
scope_paths:
  - registry/ui/bento-grid.tsx
  - registry/ui/bento-feature-card.tsx
  - registry/ui/magnetic-bento.tsx
  - app/examples/bento-grid/**
  - app/examples/bento-feature-card/**
  - __tests__/bento-grid.test.tsx
  - __tests__/bento-feature-card.test.tsx
  - __tests__/bento-magnetic-contract.test.tsx
users:
  - "Quien instala piezas de retana-ui en un host con tema shadcn."
  - "Quien ya usa MagneticBento y no debe cambiar su llamada."
states:
  - ready
  - loading
  - empty
  - error
  - overflow
  - partial
  - i18n_long
data:
  - "Span de celda: col y row, enteros, recortados al número de columnas."
  - "Tarjeta: icono, título, descripción, ilustración opcional, CTA opcional, href opcional."
brand_constraints:
  - "Sin tema propio. Solo clases semánticas del host."
  - "Radios, gap y padding con utilidades del tema, nunca px sueltos ni color literal."
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: git-sha
components:
  retana:
    - card
    - skeleton
    - magnetic-bento
  candidates_local:
    - bento-grid
    - bento-feature-card
  retana_ui_layer: VERIFIED
visual_risk: medium
copy:
  locale:
    - es-MX
    - en
  voice: "Taller de cerámica, frases cortas, sin marca de terceros."
direction:
  mode: code-variants
  axis: "Tratamiento de la zona de ilustración"
  variants:
    - media-first
    - copy-first
  chosen: media-first
  images: none
non_goals:
  - bento-illustrations
  - bento-stats-card
  - features-bento-section
  - "Veredicto de auditoría (lo da otro agente)."
  - "Merge a CPL."
acceptance:
  - id: AC-1
    statement: "A 390 px de contenedor la rejilla es de una columna."
    measure: "La pista base lleva grid-cols-1 y la siguiente columna empieza en 30rem (480 px), por encima de 390."
    test: "__tests__/bento-grid.test.tsx › keeps one column through 390px and opens the full count on desktop"
  - id: AC-2
    statement: "En desktop la pista usa el número de columnas pedido."
    measure: "Con columns={4} la clase incluye @min-[56rem]/bento:grid-cols-4. 56rem son 896 px."
    test: "__tests__/bento-grid.test.tsx › keeps one column through 390px and opens the full count on desktop"
  - id: AC-3
    statement: "Cada celda declara su span y se recorta sola en angosto."
    measure: "data-col y data-row guardan el pedido. El ancho base es col-span-1 hasta el quiebre de 30rem."
    test: "__tests__/bento-grid.test.tsx › records the requested span and collapses it until the mid breakpoint"
  - id: AC-4
    statement: "Al reacomodar, el orden de lectura sigue el orden del código."
    measure: "El DOM de las celdas coincide con el orden de los hijos. No hay utilidades order-*."
    test: "__tests__/bento-grid.test.tsx › keeps source order so one column reads in the same sequence"
  - id: AC-5
    statement: "Una sola celda no inventa vecinas."
    measure: "Hay un solo [data-slot=bento-cell]."
    test: "__tests__/bento-grid.test.tsx › renders one cell without inventing neighbors"
  - id: AC-6
    statement: "Vacío, carga y error se anuncian y no son enlaces."
    measure: "Vacío muestra emptyLabel. Carga tiene aria-busy. Error tiene role=alert. Ninguno expone un link."
    test: "__tests__/bento-grid.test.tsx › shows empty, loading, and error without links"
  - id: AC-7
    statement: "La tarjeta tiene zona de ilustración, icono, título, descripción y CTA opcional."
    measure: "Con las cinco piezas el texto y el dibujo están en el documento. Sin CTA no hay slot de CTA. Sin ilustración no hay slot de media."
    test: "__tests__/bento-feature-card.test.tsx › renders media, icon, title, description, and one link"
  - id: AC-8
    statement: "La tarjeta clickeable tiene un solo target accesible."
    measure: "Un enlace cuyo nombre incluye el título. Cero botones. El enlace no contiene otro enlace ni botón."
    test: "__tests__/bento-feature-card.test.tsx › renders media, icon, title, description, and one link"
  - id: AC-9
    statement: "El hover solo anima transform y opacity, y se apaga con reduced motion."
    measure: "El HTML no contiene transition-all ni transition-colors. Sí contiene motion-reduce:transition-none y will-change-transform en lo que anima."
    test: "__tests__/bento-feature-card.test.tsx › hover animates transform and opacity only"
  - id: AC-10
    statement: "El foco del enlace es visible y es un solo tab stop."
    measure: "focus-within:ring-2 está en la tarjeta. Tab llega al enlace después del control anterior."
    test: "__tests__/bento-feature-card.test.tsx › is one tab stop with a visible focus ring"
  - id: AC-11
    statement: "Un token de 60 caracteres sigue en el nombre accesible."
    measure: "El enlace se encuentra por ese nombre."
    test: "__tests__/bento-feature-card.test.tsx › keeps a long token in the accessible name"
  - id: AC-12
    statement: "La tarjeta se compone dentro de la rejilla."
    measure: "Un BentoCell contiene [data-slot=bento-feature-card]."
    test: "__tests__/bento-feature-card.test.tsx › composes inside a bento cell"
  - id: AC-13
    statement: "Hay dos tratamientos de ilustración. El default es media-first."
    measure: "data-layout=media-first por default. copy-first pone el título antes del dibujo en el DOM."
    test: "__tests__/bento-feature-card.test.tsx › defaults to media-first and can lead with the copy"
  - id: AC-14
    statement: "magnetic-bento sigue su API y queda compuesto sobre la base."
    measure: "La pista magnética marca data-bento-preset=magnetic y conserva los quiebres 36rem/56rem y el span 2×2 histórico. La suite __tests__/magnetic-bento.test.tsx no se edita."
    test: "__tests__/bento-magnetic-contract.test.tsx › composes the bento base and keeps the magnetic span contract"
  - id: AC-15
    statement: "Radios, gap y padding salen de tokens. No hay color literal en registry/."
    measure: "gap-4, rounded-xl, p-4. pnpm registry:build rechaza hex, rgb/oklch y paleta de Tailwind."
    test: "pnpm registry:build y las aserciones de clase en bento-grid.test.tsx y bento-feature-card.test.tsx"
---

# Bento grid y tarjeta de función

## Outcome

El host coloca celdas de 1×1, 2×1, 1×2, 2×2 (y spans hasta el tope de columnas) en una rejilla que a 390 px es una columna, en un ancho intermedio son dos, y en desktop usa todas las columnas pedidas. La tarjeta de función llena la celda con ilustración, icono, título, descripción y un CTA opcional.

## Benefit

Un solo layout para los bentos nuevos. `magnetic-bento` se apoya en esa base y quien ya lo llama no cambia su código.

## Sources

Inspiración visual, sin código.

- Ficha pública: https://shadcnstudio.com/blocks/bento-grid/bento-cards
- Licencia de esa ficha: bloques Pro de shadcn/studio. No forman parte del repositorio MIT de shadcn/ui. No se abrió, descargó ni copió su código, markup, datos ni assets.
- Observación: el video adjunto (`video.mp4`). Se vio una tarjeta con borde fino y radio amplio, una zona de ilustración que llena la celda y, debajo o arriba, un título en negrita y una descripción en tono muted. El texto de la ficha dice que la tarjeta llena la celda donde se coloca.
- Dependencias abiertas usadas con crédito: shadcn/ui (MIT) para `card` y `skeleton`, `radix-ui` (MIT) para `Slot`, `lucide-react` (ISC) para iconos. El resalte de `magnetic-bento` sigue acreditado a jh3yy en `NOTICE`.

## Scope

Entran `bento-grid`, `bento-feature-card` y el preset magnético dentro de `magnetic-bento`. Entran ejemplos PLP, la página de estrés de la familia y la dirección en código (dos layouts).

Quedan fuera, para otro PR: `bento-illustrations`, `bento-stats-card`, `features-bento-section`.

## Checks

La suite nueva más `__tests__/magnetic-bento.test.tsx` sin editar. `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm registry:build`, `pnpm test`, `pnpm build`.

## Stop when

Esos comandos están en verde, hay capturas a 390 px y en desktop de cada pieza y de las escenas clave, un antes y después de `magnetic-bento`, y un PR draft contra `CPL`. Nadie mergea.

## Deliverable

Ítems `bento-grid` y `bento-feature-card` en `registry.json`, con `meta.titleEs`, `meta.descriptionEs`, `meta.preview` y `meta.scenes`. `magnetic-bento` declara dependencia de `bento-grid`.

## Quiebres

| Ancho del contenedor | Columnas |
| --- | --- |
| Hasta 390 px, y en la práctica hasta antes de 30rem (480 px) | 1. El span de columna pedido se guarda, pero la clase base es `col-span-1`. |
| Desde 30rem y antes de 56rem | 2. El span de columna se recorta a 2. |
| Desde 56rem (896 px) | El `columns` pedido (default 4). |

`magnetic-bento` conserva sus quiebres publicados: 1 columna, 2 desde 36rem, el span pedido desde 56rem. Eso es el preset `magnetic`, no el default de la base.

## Dirección

Eje: dónde vive la ilustración. `media-first` (elegida, default) pone el dibujo arriba y el texto abajo. `copy-first` invierte el orden. No se generaron imágenes. Ver `ui/direction/bento-grid/selection.md`.

## Estados de la tarjeta y de la rejilla

| Estado | Qué se ve | Interactivo |
| --- | --- | --- |
| ready | Contenido. Si hay `href`, toda la tarjeta es un enlace. | Un solo enlace |
| empty | Texto `emptyLabel` | No |
| loading | Esqueleto y `loadingLabel`, `aria-busy` | No |
| error | `role="alert"` y `errorLabel` | No |
| partial | Sin CTA o sin ilustración, el resto sigue | El enlace, si hay `href` |
| overflow | Título o descripción largos, con corte de palabra | Igual que ready |
