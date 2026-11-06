# L-AFFECTUI-cost-waterfall

- **Fuente:** Affect UI, “Cost Waterfall”. Página pública: https://www.affectui.com/components/cost-waterfall. Post de referencia: https://x.com/flohoeller/status/2117957229227786507.
- **Fecha de revisión:** 2026-11-04, retomada 2026-11-06.
- **ui-system:** snapshot `eduardoretana/hub-vibecoding@419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`, `VERSION` 4.0.0.

## Licencia verificada

| Lugar | Qué dice | URL |
| --- | --- | --- |
| Repo público | MIT, Copyright (c) 2026 Florian Höller (adfects). Cubre los ítems publicados en ese repo. | https://github.com/flohoeller/affectui y https://raw.githubusercontent.com/flohoeller/affectui/main/LICENSE |
| Términos | Los ítems gratis son MIT. Pro no se puede publicar como librería, registry o kit. | https://www.affectui.com/terms |
| La pieza | “Part of affectUI Pro”. El comando de instalación apunta a `https://www.affectui.com/r/cost-waterfall.json`. | https://www.affectui.com/components/cost-waterfall |

**Veredicto: Pro. Clean-room.** No se descargó el JSON de Pro. No hay código, datos, iconos ni assets de Affect. La idea (cascada acumulada, Cost | Tokens, Live → Done, TOP, +N, input/output) se reimplementó con un modelo propio: `Run` / `RunStep`, micro-unidades, caché y `applyRunEvent`.

## Variantes

| Variante | Qué cambia | Veredicto |
| --- | --- | --- |
| A. Cascada acumulada con `translateX` + `scaleX` | Cada barra empieza donde terminó la anterior. El padre tenue abarca a sus hijos. | **Elegida.** Cumple el encargo y `RUI-ANIM-PERF-002`. |
| B. Barras desde el origen | El largo se lee solo, pero se pierde el acumulado. | Descartada. |
| C. Tabla y cascada en dos columnas | Más aire a 1280, peor a 390. | Descartada como layout único. A menos de 480 px la cascada se apila y se puede ocultar. |

## Comparación con ui-system 4.0.0

| Regla | Cita | Qué hace la pieza | Veredicto |
| --- | --- | --- | --- |
| HTML semántico, ARIA solo si falta nativo | `rules/a11y.md` L3 | `treegrid` porque no hay elemento nativo de árbol con columnas. | Cumple |
| Teclado y foco visible | `rules/a11y.md` L5 | Flechas, Home, End, Enter y Espacio. `focus-visible:ring-ring`. | Cumple |
| Nombre accesible | `rules/a11y.md` L6 | Cada fila nombra paso, tipo, estado, costo, tokens y tiempo. | Cumple |
| No solo color | `rules/a11y.md` L7 | Estado con texto e icono. TOP y +N son texto. | Cumple |
| Objetivo ≥ 24 px, 44 recomendado | `rules/a11y.md` L9, `rules/layout.md` L12 | La fila y el paso más caro usan `min-h-11` (44 px). | Cumple |
| Reduced motion | `rules/a11y.md` L10 | `motion-safe:` en la cascada y en la entrada de fila. Sin parpadeo. | Cumple |
| Copy claro, un idioma por superficie | `rules/copy.md` | Inglés por defecto. `costWaterfallLabelsEs` es es-MX. | Cumple |
| Botón con verbo | `rules/copy.md` L5 | “Exportar JSON”, “Mostrar cascada”, “Reintentar”. | Cumple |
| Error: qué pasó y cómo seguir | `rules/copy.md` L6 | Alerta del anfitrión más `onRetry`. El paso fallido muestra su mensaje. | Cumple |
| Vacío | `rules/copy.md` L7 | Título y qué aparece cuando el agente trabaje. | Cumple |
| Proximidad y escala 4/8 | `rules/layout.md` L3–L4 | `gap-2`, `gap-3`, `gap-4`. | Cumple |
| Orden de lectura | `rules/layout.md` L6 | El DOM sigue encabezado, métricas, filas. | Cumple |
| Divulgación | `rules/layout.md` L7 | Input/output al expandir o al hover fino. Caché de columna a 390 va al detalle. | Cumple |
| Estados extremos | `rules/layout.md` L11 | PLP y estrés: vacío, carga, error, 300 pasos, costo 0 y 10^18. | Cumple |
| Tokens semánticos | `rules/tokens.md` L6 | Solo clases del host. Sin hex ni paleta. | Cumple |
| Oscuro | `rules/tokens.md` L9 | Hereda el tema del anfitrión. | Cumple |
| `tabular-nums` y truncado | `rules/tokens.md` L15–L16 | Cifras tabulares. El nombre largo se trunca y el nombre accesible está completo. | Cumple |
| RUI-ANIM-PERF-001…007 | `knowledge/rules.yaml` L117–L123 | Solo `transform` y opacidad. Sin `transition-all`, sin animar `width`. | Cumple en los archivos nuevos |
| RUI-RADIUS-001 | `knowledge/rules.yaml` L28 | `rounded-md` y `rounded-full` de la escala. | Cumple |
| UIS-LAYOUT-001 / 002 | `knowledge/rules.yaml` L90–L91 | A 390 la cascada se puede ocultar. La página de ejemplo abre en el tope. | Cumple en revisión manual |
| RUI-TOUCH-001 | Propuesta del #68, no está en `rules.yaml` | El tap abre o pliega al instante. No hay `setPointerCapture`. `touch-pan-y` deja el scroll vertical. | **Aplicada**, no se duplica el id |
| RUI-CONTRACT-001 | `knowledge/rules.yaml` L115 | `contracts/cost-run.contract.ts` fija el núcleo que pueden importar workflow-builder y model-router. No sustituye un botón. | Cumple como contrato de familia nuevo |

## Propuesta

No duplica `RUI-ANIM-PERF-*` ni `RUI-TOUCH-001`. El hub no tiene una regla de dinero entero.

```yaml
- id: RUI-MONEY-001
  title: "El dinero que se suma se guarda en micro-unidades enteras"
  description: >-
    Un costo que se agrega (corrida, caché, mezcla por 1K) usa un entero a
    1e-6 de la moneda de la tabla. El redondeo es half away from zero. Intl
    solo coloca el símbolo y los separadores. Una tasa de cambio es una
    fracción entera que inyecta el anfitrión.
  severity: major
  category: tokens
  check: test
  check_tool: "retana-ui __tests__/cost-waterfall-core.test.ts"
  origin:
    source: "Encargo cost-waterfall, 2026-11-04. No está en rules.yaml de ui-system 4.0.0."
    date: 2026-11-06
  status: proposed
```

## API para reutilizar

Instalar solo el cálculo: `npx shadcn@latest add @retana/cost-waterfall-core`.

```ts
import {
  applyRunEvent,
  blendedCostPer1k,
  consumeRunEvents,
  createRun,
  rollupRun,
  runFromWorkflowNodes,
  runToCsv,
  runToJson,
} from "@/lib/cost-waterfall"
```

**workflow-builder** (runs por nodo, con replay) no se toca en su rama. Cuando exista, mapea así:

```ts
const run = runFromWorkflowNodes({
  id: nodeRun.id,
  title: nodeRun.label,
  nodes: nodeRun.nodes.map((node) => ({
    nodeId: node.id,
    parentNodeId: node.parentId,
    label: node.label,
    kind: node.kind,
    model: node.model,
    tokensIn: node.usage.input,
    tokensOut: node.usage.output,
    cacheRead: node.usage.cacheRead,
    cacheWrite: node.usage.cacheWrite,
    replay: node.replay,
  })),
})
const totals = rollupRun(run, hostPricing)
```

`payload.replay` no entra al precio.

**model-router** (costo mezclado por 1K) tampoco se toca:

```ts
const microPer1k = blendedCostPer1k(hostPricing, route.model, {
  input: route.mix.input,
  output: route.mix.output,
  cacheRead: route.mix.cacheRead,
  cacheWrite: route.mix.cacheWrite,
})
```

El resultado es micro-unidades por 1 000 tokens. El anfitrión formatea con `formatMicro`.

El reducer `applyRunEvent` acepta `step.started`, `step.progress`, `step.completed`, `step.failed` y `run.completed`. Un `eventId` repetido no se aplica. Un `at` más viejo no pisa estado ni contadores; un `step.started` tardío sí completa nombre y padre si faltan. `useCostRun` y `consumeRunEvents` leen un `AsyncIterable`.

## Deuda

- `CostWaterfall` pasa de 10 props. El estado (modo, pliegue, detalle, cascada) se controla por separado a propósito. `UIS-COMP-ISP-001` sigue en guía.
- El contraste del trazo tenue (`bg-foreground/15`) no se midió con un par de color automático.
- `anim_perf_lint` del repo completo puede seguir marcando archivos viejos. Los archivos de esta pieza no deben sumar flags.
- Un paso omitido no tiene evento propio: lo pone el anfitrión en el `Run` inicial.
- La barra de un costo diminuto junto a uno enorme puede quedar por debajo de un píxel. El número de la columna no se recorta.
