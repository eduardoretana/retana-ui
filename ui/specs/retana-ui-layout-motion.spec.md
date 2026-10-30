---
artifact_id: retana-ui-layout-motion.spec
owner: builder
spec_version: 1.0.0
head: 0d966603d6ef0b3adc27a50e5996a7d2235cbe3f
profile: STANDARD
spec_id: retana-ui-layout-motion
version: 1.0.1
spec_changelog:
  - version: 1.0.1
    origin: tokens
    note: "DESIGN.md generado desde rules/brand/retana-ui.tokens.json. El seed de captura queda en scripts/layout-motion-seed.mjs."
  - version: 1.0.0
    origin: brief
    note: "Alta de las cinco reglas de layout y de las primitivas number-roll y stagger-list. #55 y #56 no se tocan."
ui_system: "4.0.0"
brief:
  outcome: "El catálogo documenta cinco reglas de layout y publica number-roll y stagger-list, con animated-counter usando el rodillo por dentro."
  benefit: "Un host hereda el tema y anima cifras y listas solo con transform y opacidad, con menos movimiento y con un tope al stagger."
  sources: "Guía ui-system 4.0.0, rules/brand/retana-ui.tokens.json, ui/design/retana-ui/DESIGN.md y la nota clean-room de Jakub Antalik en docs/layout-transitions.md. No hay código de esa referencia."
  scope: "docs/layout-transitions.md, registry/ui/number-roll.tsx, registry/ui/stagger-list.tsx, registry/ui/animated-counter.tsx, ejemplos PLP y la galería /examples/layout-rules."
  checks: "Vitest de las reglas, del rodillo, de la lista, del contador ya existente y de anim_perf_lint. Playwright a 390 px. impeccable detect."
  stop_when: "pnpm test, pnpm build y anim_perf_lint en verde en el sha evaluado; logs crudos y manifiesto de renders con sha256; PR draft contra CPL, sin merge."
  deliverable: "Reglas con un sí y un no, number-roll, stagger-list, animated-counter sin cambio de API, y los insumos de este ciclo."
scope_paths:
  - docs/layout-transitions.md
  - NOTICE
  - registry/ui/number-roll.tsx
  - registry/ui/stagger-list.tsx
  - registry/ui/animated-counter.tsx
  - app/examples/layout-rules/**
  - app/examples/number-roll/**
  - app/examples/stagger-list/**
  - __tests__/layout-transitions.test.ts
  - __tests__/number-roll.test.tsx
  - __tests__/stagger-list.test.tsx
  - __tests__/animated-counter.test.tsx
  - __tests__/anim-perf-lint.test.ts
  - scripts/anim-perf-lint.mjs
users:
  - "Quien instala piezas de retana-ui en un host con tema shadcn."
  - "Quien ya usa AnimatedCounter y no debe cambiar su llamada."
states:
  - idle
  - pending
  - success
  - error
  - empty
  - partial
  - offline
  - rollback
  - permission_denied
  - overflow
  - i18n_long
data:
  - "Saldo ficticio de Taller Barro: 18640.5 con dos decimales, prefijo $. Una horneada suma 240. Un pedido que falla suma 9000 y se revierte."
  - "Agenda: jueves con tres eventos y viernes con dos. El evento en curso lleva now."
  - "Locales de formato: es-MX y en-US. La copia de la escena es es-MX y en."
brand_constraints:
  - "Sin tema propio. Solo clases semánticas del host."
  - "Color en el oklch de rules/brand/retana-ui.tokens.json (colors.background, colors.foreground, colors.primary, colors.muted, colors.muted-foreground). No convertir."
  - "Radio por paso: rounded.sm, rounded.md, rounded.lg, rounded.xl, rounded.2xl, rounded.3xl, rounded.4xl. La base es rounded.base 0.625rem. Sin rounded-full en una pieza 1:1."
  - "Tipografía por rol: typography.sans, typography.heading, typography.mono. No hay tamaño propio en el tema."
  - "Movimiento solo con transform y opacity. Sin transition-all. Sin easing con rebote."
  - "prefers-reduced-motion y MotionConfig reducedMotion=always dejan la cifra y la lista sin recorrido."
retana_ui:
  sha: 6671cfac72f736739d2d3dd2740cc5f13416acb3
  registry_source: git-sha
components:
  retana:
    - animated-counter
    - motion
  candidates_local:
    - number-roll
    - stagger-list
  retana_ui_layer: VERIFIED
visual_risk: medium
copy:
  locale:
    - es-MX
    - en
  voice: "Taller de cerámica ficticio. Frases cortas. Sin datos de la referencia."
direction:
  mode: code
  images: none
  axis: "Cada regla se muestra en par no / sí, en una columna de 390 px."
  chosen: yes-no-pairs
  generators_used: []
non_goals:
  - "Editar el PR #55 (familia de gráficos) o el PR #56 (bento)."
  - "Merge a CPL."
  - "Veredicto de auditoría. Quien construye no audita."
  - "Imágenes de un proveedor. La dirección es código y la nota clean-room."
acceptance:
  - id: AC-1
    statement: "La columna de las reglas y de las escenas no se estira al ancho de la pantalla."
    measure: "La galería usa max-w-[390px]. Las escenas de saldo y agenda usan max-w-[17.5rem] dentro de un marco sm."
    test: "docs/layout-transitions.md sección RUI-LAYOUT-WIDTH-001 y revisión visual a viewport 390x844"
  - id: AC-2
    statement: "El ejemplo que sí de bordes no apila border."
    measure: "El sí separa con bg-muted, gap y shadow-sm. El no usa border border-border."
    test: "docs/layout-transitions.md sección RUI-LAYOUT-BORDER-001"
  - id: AC-3
    statement: "El color fuerte marca solo el día activo o la acción primaria."
    measure: "En el sí, una sola barra usa bg-primary y el día activo va en font-medium. El resto es bg-muted y text-muted-foreground."
    test: "docs/layout-transitions.md sección RUI-LAYOUT-COLOR-001"
  - id: AC-4
    statement: "number-roll separa entero y fracción, y la jerarquía es opcional."
    measure: "Hay data-slot=number-roll-integer y data-slot=number-roll-fraction. Con hierarchy, la fracción tiene text-muted-foreground y font-normal, y el entero font-medium."
    test: "__tests__/number-roll.test.tsx › announces the full value and splits the fraction; › makes the fraction smaller and lighter when hierarchy is on"
  - id: AC-5
    statement: "El movimiento de las dos primitivas es transform y opacity, sin transition-all, sin layout animado y sin rebote."
    measure: "scripts/anim-perf-lint.mjs sale 0 sobre number-roll.tsx, stagger-list.tsx y animated-counter.tsx."
    test: "__tests__/anim-perf-lint.test.ts › accepts transform and opacity on the continuity primitives"
  - id: AC-6
    statement: "number-roll anuncia la cifra completa y es-MX y en-US dibujan los mismos partes que el texto."
    measure: "formatNumberRoll(18640.5, 2, es-MX) y en-US son 18,640.50 e igualan la concatenación de rollTokens."
    test: "__tests__/number-roll.test.tsx › formats es-MX and en-US from the same parts the reel draws"
  - id: AC-7
    statement: "Con menos movimiento el rodillo no viaja."
    measure: "MotionConfig reducedMotion=always deja data-motion=reduced."
    test: "__tests__/number-roll.test.tsx › settles without travel when motion is reduced"
  - id: AC-8
    statement: "animated-counter conserva la API pública y el texto para tecnología asistiva."
    measure: "Siguen value, label, prefix, suffix, decimals, animateOnView, locale, className y classNames. El texto anunciado de 1280 con prefix $ y suffix MXN es $1,280 MXN. 12.5 con un decimal es 12.5."
    test: "__tests__/animated-counter.test.tsx › exposes the formatted value to assistive tech; › keeps fraction digits; y __tests__/number-roll.test.tsx › keeps the formatted value for assistive tech"
  - id: AC-9
    statement: "stagger-list entra y sale en secuencia y el último ítem no espera más que el tope."
    measure: "STAGGER_LIST_MAX es 0.4. Para 20 ítems con paso 0.2 el último delay es 0.4. Para cualquier cuenta de 1 a 40 el delay es ≤ 0.4."
    test: "__tests__/stagger-list.test.tsx › caps the total wait"
  - id: AC-10
    statement: "La lista tiene nombre accesible, estado vacío, y con menos movimiento el cambio de filas no deja las viejas."
    measure: "role=list con el label. El vacío muestra el texto. Tras el click, Entrega está y Horneada no, con data-motion=reduced."
    test: "__tests__/stagger-list.test.tsx › renders the items as a named list; › shows the empty state; › skips travel when motion is reduced and swaps the rows"
  - id: AC-11
    statement: "Las cinco reglas están documentadas, cada una con un no y un sí, y citan la fuente clean-room."
    measure: "docs/layout-transitions.md contiene las cinco ids, ### No, ### Sí, la URL de la fuente y NOTICE."
    test: "__tests__/layout-transitions.test.ts › records the clean-room source and license; y el it.each de cada id"
  - id: AC-12
    statement: "A 390 px de viewport las escenas llenas, vacías y de error caben y el idioma de la escena cambia a inglés."
    measure: "Playwright con viewport 390x844. El saldo anunciado pasa de $18,640.50 a $18,880.50 al anotar 240. El viernes muestra Amasar el barro. El aviso de error es text-foreground."
    test: "ui/evidence/retana-ui-layout-motion/playwright.log y renders.json"
---

# Reglas de layout, number-roll y stagger-list

## Outcome

El catálogo deja escritas cinco reglas de medida, borde, color, tipo y continuidad. `number-roll` rueda entero y decimales por separado. `stagger-list` entra y sale con un tope de retraso. `animated-counter` usa el rodillo y no cambia su llamada.

## Benefit

Quien instala la pieza hereda el tema del host. La cifra y la lista no animan layout. Quien ya usa el contador no reescribe sus props.

## Sources

ui-system 4.0.0. Los tokens de marca están en `rules/brand/retana-ui.tokens.json` (`colors.primary` oklch(0.205 0 0), `colors.muted` oklch(0.97 0 0), `rounded.lg` = var(--radius), `typography.sans` = var(--font-geist-sans)). `ui/design/retana-ui/DESIGN.md` es la vista generada. La referencia de comportamiento es la nota pública de Jakub Antalik, producto sin licencia de reutilización. El trato es clean-room y está en `NOTICE` y en `docs/layout-transitions.md`. No se copió fuente, datos, iconos ni assets.

## Scope

Entran la nota, la galería `/examples/layout-rules`, `number-roll`, `stagger-list` y el cambio interno de `animated-counter`. Cada primitiva tiene PLP (`meta.scenes`, fixtures, scenes, ScenePreview, SceneDeck) y estrés.

## Checks

Vitest, `scripts/anim-perf-lint.mjs`, `pnpm build`, Playwright a 390×844 e `impeccable detect --json`.

## Stop when

Esos comandos están registrados en el sha evaluado, el manifiesto de renders trae sha256 y viewport, y el PR sigue en draft contra CPL. Nadie mergea. Nadie audita lo que construyó.

## Deliverable

Ítems `number-roll` y `stagger-list` con `titleEs` y `descriptionEs`. La galería de reglas. `animated-counter` sigue instalable y ahora vende también `number-roll.tsx`.

## States

| Id | Qué se ve | Dónde |
| --- | --- | --- |
| idle | Saldo 18640.50 o la agenda del jueves, sin pending | escena filled antes del click |
| pending | Leyendo… y `aria-busy` | escena loading |
| success | El saldo sube 240, o la agenda pasa al viernes | escena filled tras el click que no falla |
| error | `role=alert` en `text-foreground` y Reintentar | escena error |
| empty | Saldo 0, o «El horno no tiene nada programado.» | escena empty |
| partial | Jerarquía apagada: la fracción existe y no cambia de peso. Lista de un solo ítem. | prop `hierarchy={false}` y estrés de una fila |
| offline | No aplica. Estas piezas no hablan con red. | — |
| rollback | El pedido de 9000 no entra y el saldo vuelve | botón que llama `useSceneSim` con `fail: true` |
| permission_denied | No aplica. No hay permiso que negar. | — |
| overflow | Sufijo de 60 caracteres y título largo, con `wrap-anywhere` | `/examples/number-roll/stress` y `/examples/stagger-list/stress` |
| i18n_long | La misma escena en es-MX y en en, a 390 px | `?locale=es` y `?locale=en` |

## Seed

`scripts/layout-motion-seed.mjs` lista las rutas. Los datos llenos viven en `app/examples/number-roll/fixtures.ts` (`filled`, 18640.5) y `app/examples/stagger-list/fixtures.ts` (`filled` y `friday`). `?scene=friday` abre el viernes sin click. `?reduced=1` deja el deck en menos movimiento. `?locale=en` es inglés. Sin `locale`, es es-MX.

## Dirección

No hay imágenes de proveedor. El eje es el par no/sí de cada regla, en una columna de 390 px. Los colores y radios citados salen de `ui/design/retana-ui/DESIGN.md`. Ver `ui/specs/retana-ui-layout-motion.direction-map.md`.
