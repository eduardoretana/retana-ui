# L-AXON-agent-config

- **Fuente:** Jubayer, “AI configuration screen”, https://x.com/jubayer6910/status/2117972634365550745. Una sola imagen. No hay código, repositorio ni archivo de licencia.
- **Licencia:** sin licencia, solo idea. Clean-room: se tomó el arreglo (resumen, cuatro KPI, lista y panel) y se escribió código propio. No se copiaron assets, textos, cifras ni nombres de la imagen.
- **Marca de la demo:** Nimbo, un CRM ficticio. Modelos “Ejemplo Norte / Brisa / Cumbre”. Precios marcados como ejemplo.
- **ui-system:** snapshot `hub-vibecoding@419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`, `VERSION` 4.0.0, leído desde `uploads/hub-ui-system-snapshot-419ad648.tar.gz`. Los ids viven en `knowledge/rules.yaml` (la prosa de `rules/*.md` no trae id).

## Variantes

| Variante | Eje | Traducible a tokens | Veredicto |
| --- | --- | --- | --- |
| A. Shell con navegación fija dentro de la pieza | Acopla el menú al bloque | Sí | Descartada. Duplicaría `rail-sidebar` y el slot que espera `sidebar-islands`. |
| B. Solo el panel de un agente | Pierde lista y KPI | Sí | Descartada. No es la consola. |
| C. Shell por slot, maestro-detalle y piezas de CPL (`Tabs`, `Switch`, `Select`, `Sparkline`, `Card`, `Badge`, `Empty`, `Alert`) | Composición | Sí | Elegida. |

El sparkline de la referencia es de barras. En CPL el sparkline existente es de línea. Se compone ese, sin dibujar otro gráfico.

## Motion

- El asa se mueve con `translate3d` solamente. Mientras se arrastra no hay transición. Con teclado hay `transition-[transform]` de 150 ms, y `motion-reduce:transition-none`.
- El histograma usa `scaleY` estático. No se anima `width`, `height` ni `box-shadow`.
- No hay `transition-all`, blur animado ni `will-change`.
- `anim_perf_lint.mjs` del snapshot, solo sobre los archivos nuevos. El resto del repo conserva flags previos y no se toca.

## Break-ui

| Eje | Dónde | Qué se mira |
| --- | --- | --- |
| 40 agentes y un nombre largo | `/examples/agent-config/stress` | El nombre se trunca y el nombre accesible sigue completo. |
| Bandas extremas y distribución vacía | Estrés y validación | Mínimo de 5 puntos; serie vacía muestra “sin decisiones”. |
| Publicación que falla | Escena `publish-error` y prueba | El borrador vuelve y la versión en vivo no cambia. |
| Solo teclado | Prueba de flechas en la lista y en el asa | El asa anuncia el umbral con `aria-valuetext`. |
| 390 px | Escena `390` y contenedor `@container` | Lista o detalle, con “Volver a los agentes”. |
| Zoom 200 % | Misma rejilla en px CSS | El contenedor se angosta y cae al maestro-detalle. |

## Comparación con ui-system 4.0.0

Prosa sin id:

| Regla | Cita | Veredicto |
| --- | --- | --- |
| HTML semántico, ARIA solo si no hay nativo | `rules/a11y.md` | Cumple. Lista con `listbox`, asas con `slider`, pestañas de Radix. |
| Teclado y foco visible | `rules/a11y.md` | Cumple. Flechas en la lista y en las asas. |
| Nombre accesible | `rules/a11y.md` | Cumple. Iconos con `aria-hidden` y texto al lado. |
| No comunicar solo con color | `rules/a11y.md` | Cumple. La precisión dice Alta, Media o Baja. |
| Objetivo ≥ 24 px, ≥ 44 px recomendado | `rules/a11y.md` L9, `rules/layout.md` L12 | Cumple en asas (`size-11`) y en las acciones principales (`min-h-11`). |
| `prefers-reduced-motion` | `rules/a11y.md` L10 | Cumple. `motion-reduce:transition-none`. |
| Formularios con label y error | `rules/a11y.md` | Cumple. `Field` + `aria-invalid`. |
| Diálogos | `rules/a11y.md` | No aplica. No hay diálogo. El menú angosto se cierra con Escape. |
| Copy claro, verbo + objeto, un idioma por superficie | `rules/copy.md` | Cumple. es-MX o inglés según `locale`, sin mezclarlos. |
| Proximidad, escala 4/8, orden DOM | `rules/layout.md` | Cumple. `gap` de la escala de Tailwind. |
| Estados vacío, carga, error y extremo | `rules/layout.md` | Cumple. PLP y página de estrés. |
| Responsive desde móvil | `rules/layout.md` | Cumple. Maestro-detalle bajo 800 px del contenedor. |
| Tokens semánticos, sin hex en la pieza | `rules/tokens.md` | Cumple. El build del registry rechaza paleta y hex. |
| Contraste AA | `rules/tokens.md` | Hereda el tema del host. No se midió un par nuevo. |
| Una marca | `rules/tokens.md` | Cumple en la demo: solo Nimbo. |
| Escala tipográfica del host | `rules/tokens.md` | Cumple. Utilidades `text-*` de Tailwind, `tabular-nums` en cifras. |
| Truncado con texto completo | `rules/tokens.md` | Cumple. `truncate` y `title` en el nombre. |

Ids de `knowledge/rules.yaml`:

| Id | Veredicto |
| --- | --- |
| RUI-TOKEN-001 | No aplica. La pieza no mapea `tokens.json`. |
| RUI-RADIUS-001 | Cumple. Solo `rounded-*` de la escala. |
| RUI-ELEV-001 | Cumple. Solo `shadow-sm` / `shadow-md`. |
| RUI-TYPE-001 | No aplica. No define `--text-*`. |
| RUI-HEIGHT-001 | Cumple en lo nuevo (`min-h-11`). No se reescribieron los primitivos del host. |
| RUI-DARK-001 | No aplica. El claro y el oscuro salen del tema del host. |
| RUI-CONTRAST-001 | No medido aquí. Depende del tema demo. |
| UIS-COVERAGE-001 | Cumple en la página de estrés para esta pieza. |
| UIS-LAYOUT-001 | A revisar en captura a 390 y 1280. El contenedor no fuerza un ancho mayor que el padre. |
| UIS-LAYOUT-002 | La escena arranca arriba. No habla de gestos. |
| UIS-CONSOLE-001 | A revisar al abrir la demo. |
| UIS-DESIGN-001, UIS-TOKENMAP-001, UIS-DONT-001, UIS-PRESET-001 | No aplica. Esta pieza no genera `DESIGN.md` ni un preset. |
| UIS-COMP-ISP-001 | Deuda. La pantalla pasa de 10 props. El estado va agrupado, pero el umbral diferido no se cumple. |
| UIS-COMP-OCP-001 | Cumple. No se copia ni se edita un primitivo del host. |
| UIS-COMP-DIP-001 | Cumple. Sin `@supabase` en la pieza. |
| UIS-COMP-DIP-002 | Cumple. `runTest` tiene simulador en memoria. |
| UIS-REFACTOR-001…003 | No aplica. No es un refactor de reglas ya publicadas. |
| UIS-YAGNI-001 | Aceptado. El evaluador y la validación tienen pruebas propias. |
| UIS-YAGNI-002 | No aplica. No hay factory nueva. |
| UIS-YAGNI-003 | No aplica. La pieza es el encargo. |
| UIS-KISS-001 | Vigilar. `busy` existe para la escena de “publicando”. |
| UIS-CATALOG-GAP-001 | Registrado en el kit: cost-waterfall, model-router, workflow-builder, dispatch-board, knowledge-base y sidebar-islands no están en CPL. |
| RUI-CONTRACT-001 | Cumple para esta familia: `contracts/agent-config.contract.ts`. |
| RUI-ANIM-PERF-001…006 | Cumple en los archivos nuevos. Ver el lint. |
| RUI-ANIM-PERF-007 | Cumple. El arrastre escribe `transform` en el asa y hace un solo `setState` al soltar. |

## Reglas que ya existían y se siguen

`RUI-TOUCH-001` está propuesta en el PR #68 (`docs/learnings/L-EMIL-touch-activate.md` de esa rama). No se duplica. Aquí: un tap enfoca el asa; en touch el arrastre espera 360 ms; un swipe vertical no captura; el asa mide 44 px; el teclado no pasa por el hold.

## Propuestas

No se escribieron en el hub.

```yaml
- id: RUI-ASYNC-001
  title: "Un cambio optimista vuelve al estado anterior si el callback del anfitrión rechaza"
  description: >-
    Si la pieza pinta un borrador, una publicación o una restauración antes de
    que el anfitrión confirme, y onSaveDraft, onPublishRequest u
    onRollbackRequest rechazan, la UI vuelve al estado previo y anuncia qué
    pasó. No deja la versión en vivo a medias.
  severity: major
  category: a11y
  check: test
  check_tool: "retana-ui __tests__/agent-config.test.tsx"
  origin:
    source: "Consola de agentes, clean-room Axon, 2026-11-06"
    date: 2026-11-06
  status: proposed
- id: RUI-SPLIT-001
  title: "Un maestro-detalle bajo 40rem muestra un solo panel y un control para volver"
  description: >-
    Cuando el contenedor de la consola mide menos de 800 px, la lista y el
    detalle no se muestran juntos. Elegir un ítem abre el detalle. Un botón
    con nombre visible vuelve a la lista. A 1280 px se ven los dos.
  severity: major
  category: layout
  check: test
  check_tool: "retana-ui escena 390 y contenedor @container"
  origin:
    source: "Consola de agentes, clean-room Axon, 2026-11-06. No duplica UIS-LAYOUT-002."
    date: 2026-11-06
  status: proposed
```

## Deuda

- `model-router` está en el PR #70 y no se importa. El slot `modelSelect` habla su idioma (`id`, `name`, `vendor`, `p95Ms`, `amountPer1k`).
- `cost-waterfall`, `workflow-builder`, `dispatch-board`, `knowledge-base` y `sidebar-islands` no tenían rama en `origin` el 2026-11-06. Quedan como slots y como contrato escrito.
- “Nuevo agente” llama `onCreateRequest`. No hay asistente de alta.
- El `Slider` del host mide 12 px y usa `bg-white`. Las asas de las bandas son propias por `RUI-TOUCH-001` y por los 44 px.
- `UIS-COMP-ISP-001` sigue diferido y esta pantalla lo rebasa.
- El contraste AA no se midió con `contrast_pairs.mjs`; lo resuelve el tema del host.
