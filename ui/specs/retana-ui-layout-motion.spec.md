---
artifact_id: retana-ui-layout-motion.spec
owner: builder
spec_version: 1.2.0
head: fe591983055c98509435159dbfd6b63962bd340b
profile: STANDARD
spec_id: retana-ui-layout-motion
version: 1.2.0
spec_changelog:
  - version: 1.0.0
    origin: brief
    note: "Alta de las cinco reglas. number-roll y stagger-list viven en #59."
  - version: 1.1.0
    origin: brief
    note: "Las reglas se aplican a la familia de #55. ChartKpi acepta la cifra sin aplanar. El rodillo entra cuando #59 se mergee. No se copia la primitiva."
  - version: 1.2.0
    origin: brief
    note: "El seed de captura y /api/health. DESIGN.md y rules/brand/retana-ui.tokens.json se citan como dependencia de #59 y no se copian."
ui_system: "4.0.0"
brief:
  outcome: "La familia de gráficos de #55 cumple anchos, un solo borde, color fuerte solo en lo activo, jerarquía de la cifra y continuidad con scaleX o scaleY."
  benefit: "A 390 px la prosa no se estira, la barra crece desde su base y la cifra deja el entero al mando."
  sources: "Guía ui-system 4.0.0 y las reglas de #59. No se mezcla esa rama ni se copia number-roll, DESIGN.md ni rules/brand/retana-ui.tokens.json."
  scope: "registry/ui/chart-card.tsx y las doce composiciones, sus pruebas y el PLP que ya tenían."
  checks: "Vitest de formato, de la familia y del origen de la animación. Playwright a 390 px. impeccable detect."
  stop_when: "pnpm test en verde en el sha evaluado. Logs y renders.yaml fuera del repo, con ese sha. PR #55 sigue draft. Sin merge."
  deliverable: "ChartKpi con figure tipado. Barras, tramos y área en transform. Spec y direction-map de este ciclo en el mismo commit."
scope_paths:
  - registry/ui/chart-card.tsx
  - registry/ui/combo-chart.tsx
  - registry/ui/stacked-columns.tsx
  - registry/ui/iso-bars.tsx
  - registry/ui/range-plan.tsx
  - registry/ui/segment-gauge.tsx
  - registry/ui/scrub-area.tsx
  - registry/ui/range-lanes.tsx
  - registry/ui/coupled-lines.tsx
  - registry/ui/dot-meter.tsx
  - registry/ui/flow-sankey.tsx
  - registry/ui/hex-heatmap.tsx
  - registry/ui/polar-area.tsx
  - registry/lib/chart-format.ts
  - __tests__/chart-family.test.tsx
  - __tests__/chart-layout.test.ts
users:
  - "Quien instala un gráfico de retana-ui en un host con tema shadcn."
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
  - "Huerto Norte, datos ficticios ya presentes en los fixtures de cada gráfico."
  - "Locales de formato: es-MX y en-US. La escena del deck es es y en."
brand_constraints:
  - "Sin tema propio. Solo clases semánticas y var(--chart-*), var(--muted), var(--border), var(--foreground)."
  - "RUI-RADIUS-001 en los chips de leyenda: rounded-md. La pista de un medidor puede seguir en cápsula."
  - "Movimiento solo con transform y opacity. scaleY y scaleX desde la base. Sin transition-all. Sin clipPath. Sin rebote."
  - "prefers-reduced-motion deja la transición en cero. El relleno del plan salta al ratio."
retana_ui:
  sha: fe591983055c98509435159dbfd6b63962bd340b
  registry_source: git-sha
components:
  retana:
    - chart-card
    - motion
  candidates_local: []
  retana_ui_layer: VERIFIED
visual_risk: medium
copy:
  locale:
    - es-MX
    - en
  voice: "Huerto ficticio. Frases cortas."
direction:
  mode: code
  images: none
  axis: "Cada gráfico a 390 px, escena llena, y el shell en vacío, carga y error."
  chosen: yes-no-pairs
  generators_used: []
non_goals:
  - "Copiar registry/ui/number-roll.tsx o mezclar la rama de #59."
  - "Copiar DESIGN.md o rules/brand/retana-ui.tokens.json. Esos archivos son dependencia de #59."
  - "Editar el PR #56 (bento)."
  - "Merge a CPL."
  - "Veredicto de auditoría. Quien construye no audita."
acceptance:
  - id: AC-1
    statement: "Título, descripción e insight no cruzan una celda ancha."
    measure: "Esos bloques usan max-w-[17.5rem]. El plot sigue el ancho de la celda. hex-heatmap conserva max-w-sm."
    test: "__tests__/chart-family.test.tsx › splits the kpi and keeps one card surface"
  - id: AC-2
    statement: "La tarjeta no apila anillo y sombra, y el vacío no repite un borde."
    measure: "El root no añade ring-foreground/10 ni shadow-sm. El estado usa bg-muted, sin border-dashed."
    test: "__tests__/chart-family.test.tsx › splits the kpi and keeps one card surface"
  - id: AC-3
    statement: "El color fuerte marca la barra, el tramo, el carril o la serie elegida."
    measure: "Lo demás usa var(--muted) o var(--muted-foreground), con trazo. La leyenda no pinta todos los swatches en bg-primary."
    test: "revisión de combo-chart, stacked-columns, iso-bars, segment-gauge, range-lanes, polar-area y hex-heatmap"
  - id: AC-4
    statement: "ChartKpi recibe la cifra sin aplanar y separa entero y fracción."
    measure: "figure trae value, decimals, locale, prefix, suffix, hierarchy y announce. data-slot chart-kpi-integer y chart-kpi-fraction. El hint sigue en text-xs."
    test: "__tests__/chart-layout.test.ts › splits es-MX and en-US into the same integer and fraction"
  - id: AC-5
    statement: "Barras, tramos, área y carriles no animan layout."
    measure: "scaleY u scaleX con transform-origin en la base o a la izquierda. Sin clipPath, sin transition-all, sin height ni width dentro de animate."
    test: "__tests__/chart-family.test.tsx › uses scale and a quiet delta instead of layout animation y › keeps continuity on transform and opacity"
  - id: AC-6
    statement: "es-MX y en-US anuncian el mismo texto que dibujan las partes."
    measure: "1234.5 es 1,234 y .5 en los dos locales. 0.1 en porciento es 10 y %."
    test: "__tests__/chart-layout.test.ts › splits es-MX and en-US into the same integer and fraction"
  - id: AC-7
    statement: "Con menos movimiento no hay recorrido."
    measure: "chartScaleProps usa duration 0. El plan marca data-motion=reduced y motion-reduce corta la transición."
    test: "ChartCard ya anula animation y transition bajo prefers-reduced-motion"
  - id: AC-12
    statement: "A 390 px caben lleno, vacío, carga y error, en es y en en."
    measure: "Playwright viewport 390x844 sobre las escenas del SceneDeck."
    test: "playwright.log y renders.yaml del Agent Store, con el sha del HEAD"
---

# Layout y motion en la familia de gráficos

## Outcome

`ChartCard` deja una sola separación, acota la prosa y parte la cifra. Las composiciones crecen con `scaleX` o `scaleY`. El color fuerte queda en lo señalado.

## Benefit

El host no recibe un segundo tema. La barra no anima el alto del SVG. Quien lee con menos movimiento ve el valor final.

## Sources

ui-system 4.0.0. Las reglas, `DESIGN.md` y `rules/brand/retana-ui.tokens.json` están en el PR #59. Este cambio no copia esos archivos ni `number-roll`, y no incorpora esa rama. `ChartKpi` deja el prop `figure` listo para que el rodillo pinte el mismo contrato cuando #59 se mergee. El seed `ui/seeds/retana-ui-layout-motion.seed.yaml` (version 1) lista los estados llenos. `/api/health` responde 200 sin redirección.

## Scope

Shell y doce gráficos. El PLP (fixtures, scenes, preview, demo) ya cubre lleno, vacío, carga y error. No se agregan piezas.

## Checks

Vitest, Playwright a 390×844 e `impeccable detect`.

## Stop when

La suite queda registrada en el sha del HEAD, fuera del repo. El PR #55 sigue en draft contra CPL.

## Deliverable

`figure` tipado en `ChartKpi`. Continuidad en transform y opacity. Esta spec y el direction-map, en el mismo commit.

## States

| Id | Qué se ve | Dónde |
| --- | --- | --- |
| idle | Escena llena, sin pending | `?scene=filled` |
| pending | Cargando, `role=status` | `?scene=loading` |
| success | El plan o la leyenda actualizan la cifra | slider y chips |
| error | `role=alert` en `text-foreground` y Reintentar | `?scene=error` |
| empty | Superficie `bg-muted`, sin borde punteado | `?scene=empty` |
| partial | Fracción más chica. Delta del área en `emphasis=quiet` | `ChartKpi` |
| offline | No aplica. No hay red. | — |
| rollback | No aplica en este pase. | — |
| permission_denied | No aplica. | — |
| overflow | Título con `truncate` dentro de `max-w-[17.5rem]` | shell |
| i18n_long | La misma escena en es y en, a 390 px | interruptor ES/EN del SceneDeck |

## Dirección

No hay imágenes de proveedor. El eje es el gráfico a 390 px. Ver `ui/specs/retana-ui-layout-motion.direction-map.md`.
