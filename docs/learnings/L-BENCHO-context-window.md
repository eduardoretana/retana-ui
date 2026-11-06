# L-BENCHO-context-window

- **Fuente:** find «Context window» de Juliette (@shedsgns), publicado por Bencho. Página: https://bencho.dev/finds/shedsgns-context-window. Post: https://x.com/benchodev/status/2117718457567371696 (la página respondió 403).
- **Fecha de revisión:** 2026-11-04.
- **ui-system:** snapshot `hub-ui-system-snapshot` de `hub@419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`, `VERSION` 4.0.0. El hub no es legible desde esta VM; la comparación usa ese tarball.

## Licencia verificada

| Dónde | Qué hay | URL |
| --- | --- | --- |
| Página del componente | Texto de comportamiento. No hay código, no hay `LICENSE`, no hay repo. | https://bencho.dev/finds/shedsgns-context-window |
| Licencia del sitio | MIT solo para «free blocks» con panel de código. La licencia Pro permite usar bloques en un producto y prohíbe republicarlos como UI kit, librería de componentes o MCP. | https://bencho.dev/licence |
| Repo de @shedsgns | No apareció un repositorio de este componente. | Búsqueda pública, 2026-11-04 |
| Post en X | 403. No se pudo leer una licencia ahí. | https://x.com/benchodev/status/2117718457567371696 |

**Veredicto: clean-room.** No hay una licencia permisiva verificable (MIT, Apache o similar) que cubra este find. El MIT de Bencho no aplica a los finds. La licencia Pro, aunque existiera una copia, prohíbe meter el bloque en una librería. No se copió código, datos de ejemplo, iconos ni assets. La interacción (barra de ticks, grilla, tooltip del agente, carga y compactación) se reescribió con el escenario sintético del taller de Guanajuato.

## Variantes

| Variante | Qué reutiliza | Por qué no |
| --- | --- | --- |
| A. `UsageMeter` como barra | Contador y segmentos ya existen en CPL. | Es un medidor de plan, no de contexto. El ticker anima `filter` y ancho (`RUI-ANIM-PERF-002/004`). No está exportado como pieza suelta. |
| B. Seguir el campo de celdas anterior | La pieza ya estaba registrada. | Esa lectura era de Affect (celdas decorativas). No cubre el reducer, el costo, los umbrales ni la barra de ticks. |
| C. Núcleo puro + card propia | `Card`, `Badge`, `Button`, `Skeleton` y `chart` semánticos. El contador propio solo usa opacidad. Los segmentos se reacomodan con `layout` de Motion (FLIP sobre transform). | **Elegida.** El tooltip del host ancla al trigger y no puede seguir al puntero; el que sigue al cursor es local y también se coloca con el foco. |

## Comparación con ui-system 4.0.0

Reglas de `knowledge/rules.yaml` (semilla 3.4.1 dentro del snapshot 4.0.0) y de `rules/*.md`. «Cumple» es esta pieza. «No aplica» es una regla de marca, de host o de proceso que este registro no ejecuta.

| Regla | Cita | Veredicto |
| --- | --- | --- |
| RUI-TOKEN-001 | `rules.yaml` conservar el espacio de color | **No aplica.** La pieza no define tokens ni convierte colores. |
| RUI-RADIUS-001 | radios de la escala, sin `rounded-[…]` | **Cumple.** Solo `rounded-md`, `rounded-lg`, `rounded-full`, `rounded-sm`. |
| RUI-ELEV-001 | sombras de la escala | **Cumple.** El tooltip usa `shadow-md`. No hay sombra inline. |
| RUI-TYPE-001 | no inventar `--text-*` | **Cumple.** Utilidades `text-sm`, `text-xs`, `text-base`. |
| RUI-HEIGHT-001 | alturas de control juntas | **No aplica** al catálogo. Los botones del detalle usan `min-h-11` para el objetivo táctil. |
| RUI-DARK-001 | modo oscuro derivado en tokens.json | **No aplica.** El modo oscuro lo resuelven los semánticos del anfitrión. |
| RUI-CONTRAST-001 | 4.5:1 texto, 3:1 UI | **Cumple por tokens.** Texto `foreground` sobre `card` y `background` sobre `foreground` en el tooltip. Falta medición numérica del par en el host. |
| UIS-COVERAGE-001 | página de estrés con estados | **Cumple.** `/examples/context-window/stress` marca vacío, carga, error, 40 fuentes, fijadas y 390. |
| UIS-LAYOUT-001 | sin overflow a 375 y 1280 | **Pendiente de captura.** La grilla usa `min-w-0` y `truncate`. |
| UIS-LAYOUT-002 | `scrollY === 0` al cargar | **No aplica** a la pieza. La página de ejemplo no desplaza sola. |
| UIS-CONSOLE-001 | sin errores de consola | **Pendiente** de la pasada en el navegador. |
| UIS-DESIGN-001 / UIS-TOKENMAP-001 / UIS-DONT-001 / UIS-PRESET-001 | proceso de marca del hub | **No aplica.** retana-ui no genera `DESIGN.md`. |
| UIS-COMP-ISP-001 | ≤10 props, diferida | **Deuda.** La spec pide límite, umbrales, precio, callbacks y etiquetas. La regla está `deferred`. |
| UIS-COMP-OCP-001 | no copiar `@retana/*` en el host | **Cumple.** Un solo item, sin fork. |
| UIS-COMP-DIP-001 / 002 | sin Supabase en UI | **Cumple.** No hay datos de red. |
| UIS-REFACTOR-001…003 | fix-log | **No aplica.** No es un FIX de reglas de negocio previas. |
| UIS-YAGNI-001 | abstracción de un solo uso | **Cumple con nota.** `estimateContextCost` es el sustituto documentado del núcleo de cost-waterfall, con prueba. |
| UIS-YAGNI-002 / 003 | factory sin segundo caso; candidato con <2 usos | **No aplica.** No hay factory nueva ni un segundo paquete. |
| UIS-KISS-001 | props que nadie usa | **Cumple.** Las props salen de la spec y de las escenas. |
| UIS-CATALOG-GAP-001 | hueco de catálogo | **No aplica.** Se extiende `context-window`, no se crea otra pieza. |
| RUI-CONTRACT-001 | contrato de familia para promoción | **No aplica al gate de esta PR.** La sección de abajo es el texto para fusionar en `docs/kits/crm-agent-console.md`. |
| RUI-ANIM-PERF-001 | nada de `transition-all` | **Cumple.** Solo `transition-opacity`. |
| RUI-ANIM-PERF-002 | no animar layout | **Cumple.** El reacomodo usa `layout` de Motion (transform). El objeto `animate` solo tiene `opacity`. |
| RUI-ANIM-PERF-003 | no animar `box-shadow` | **Cumple.** |
| RUI-ANIM-PERF-004 | blur animado < 20px | **Cumple.** No hay blur. |
| RUI-ANIM-PERF-005 | sin variables CSS en el handler del puntero | **Cumple.** El tooltip escribe `transform` en el elemento. |
| RUI-ANIM-PERF-006 | `will-change` acotado | **Cumple.** No se usa. |
| RUI-ANIM-PERF-007 | sin setState por frame | **Cumple.** El puntero solo hace `setState` cuando cambia la fuente bajo el cursor. |
| `rules/a11y.md` | teclado, nombre, no solo color, 24/44 px, reduced motion, live | **Cumple.** Barra con `role="meter"`. Estado con glifo, borde discontinuo o altura, además del color. Reduced motion: el contador salta y no hay cross-fade. |
| `rules/copy.md` | es-MX en la demo, verbo + objeto, vacío con siguiente paso | **Cumple.** Inglés por defecto en la pieza; es-MX en `contextWindowLabelsEs`. |
| `rules/layout.md` | proximidad, móvil, 44 px | **Cumple** en filas (`min-h-11`) y botones del detalle. |
| `rules/tokens.md` | solo semánticos, `tabular-nums`, truncado | **Cumple.** |
| RUI-TOUCH-001 | propuesta del #68, no está en `rules.yaml` | **Se aplica, no se duplica.** Un tap abre el detalle. No hay `setPointerCapture`. La lista lleva `touch-pan-y`. |

No se propone un id nuevo. El hueco del gesto ya está redactado en el #68.

## Cómo encaja en la consola de agentes

La ventana cuenta tokens. No guarda memorias, no busca documentos y no pone precio de salida.

- **Memoria.** `memory-short`, `memory-mid` y `memory-long` son el presupuesto de las tres capas. `memory-panel` sigue siendo quien edita, pausa u olvida el texto.
- **RAG.** `kind: "rag"` apunta a una fuente que el anfitrión resolvió en knowledge-base. El id de la fila debería ser el id del documento. Esta pieza no lista el corpus.
- **Caché.** `cached` y `cacheTokens` son lecturas de caché del proveedor. No hay escritura de caché aquí; el anfitrión puede pasar `cacheWriteTokens` al costo.
- **Modelo.** `resolveLimit(modelId)` es el puente con model-router. No se importa esa rama.
- **Costo.** `PricingLike` usa los mismos cuatro precios por millón que el núcleo de cost-waterfall. `estimateContextCost` se reemplaza al mergear.
- **Resto del kit.** agent-config elige el modelo. workflow-builder y dispatch-board emiten eventos (`load`, `compact`, `pin`). sidebar-islands puede hospedar la card. Ninguno debe redibujar la barra.

## Contratos para fusionar en docs/kits/crm-agent-console.md

Esta sección no crea ese archivo. La otra rama lo abre; aquí queda el texto para copiar.

### ContextSource

```ts
type ContextSource = {
  id: string
  kind: "system" | "tools" | "memory-short" | "memory-mid" | "memory-long" | "rag" | "chat" | "file" | (string & {})
  tokens: number
  status: "loading" | "loaded" | "evicted" | "compacted"
  cached: boolean
  cacheTokens: number
  pinned: boolean
  label: string
  summaryOf?: string
}
```

- Una fila `rag` usa como `id` el id del documento de knowledge-base.
- `pinned: true` excluye la fila de `compact`.
- `summaryOf` apunta a la fila que la compactación reemplazó.

### Eventos

`applyContextEvent(state, event)` con `load`, `update`, `evict`, `compact` (`from`, `to`, `tokensBefore`, `tokensAfter`, `note`), `pin` y `unpin`. Duplicados y orden incorrecto no tiran ni duplican tokens. No hay cola: el evento que llega antes de su fila se ignora.

### Límite y umbrales

`resolveLimit(modelId): number | null` es el nombre a unificar con model-router (`limitFor`). Gana sobre `modelLimit` si devuelve un número positivo.

`ContextThreshold` es `{ unit: "percent" | "tokens", value: number }`. `onThreshold({ kind: "warn" | "compact", used, limit })` se emite una vez al cruzar hacia arriba. El anfitrión decide si compacta.

### Precio

`PricingLike` es `{ inputPerMillion, outputPerMillion, cacheReadPerMillion, cacheWritePerMillion }`. La moneda (`USD` | `MXN`) se formatea con `Intl` en el borde, no dentro de la tabla de tarifas. Al mergear cost-waterfall, `estimateContextCost` debe delegar en ese núcleo.

### Actividad

`reading | compacting` es solo el rótulo de la card. No es el estado de agent-config.

## Deuda conocida

- El contador no reutiliza `AnimatedCounter`: ese odómetro anima `filter` y ancho.
- `UsageMeter` se evaluó y no se compuso, por la misma razón y porque su semántica es de plan.
- `estimateContextCost` es temporal.
- Los eventos fuera de orden se descartan; no se reordenan.
- ISP-001 sigue diferida y esta pieza pasa de 10 props.
- El `CardFooter` del anfitrión trae banda `muted`. No se restylea.
- Falta la medición numérica de contraste del par real del host.

## Capturas

Se copian a `/cursor/stores/self/context-window/` cuando la pasada visual cierra.
