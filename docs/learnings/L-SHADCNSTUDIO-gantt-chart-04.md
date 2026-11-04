# L-SHADCNSTUDIO-gantt-chart-04

- **Fecha:** 2026-11-04
- **Fuente:** [Shadcn Studio Gantt Chart 04](https://shadcnstudio.com/blocks/dashboard-and-application/gantt-chart) (mención pública: https://x.com/i/status/2117984027814900115)
- **Licencia:** bloque Pro. Solo se usó la idea, el acomodo y la interacción. Implementación clean-room. No se copió código, texto, iconos ni assets.
- **Pieza:** `timeline-gantt` (`registry/ui/timeline-gantt.tsx`, `registry/lib/timeline-gantt.ts`)
- **ui-system:** snapshot de `eduardoretana/hub-vibecoding@419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`. `ui-system/VERSION` línea 1 dice `4.0.0`. `knowledge/rules.yaml` línea 1 y línea 14 todavía se identifican como `3.4.1`; los ids citables están en ese yaml. `rules/*.md` es prosa sin id. El hub no se editó.

## Veredictos

| Punto | Evidencia | Veredicto | Destino |
| --- | --- | --- | --- |
| 1. `progress` en la barra, con nombre accesible y relleno que no depende solo del color | `GanttItem` no tenía `progress` (`registry/lib/timeline-gantt.ts`, tipo de la tarea, antes de este cambio). La barra era un botón de color de estado, sin `role="progressbar"` ni `aria-valuenow` (`registry/ui/timeline-gantt.tsx`, botón `data-slot="timeline-gantt-bar"`). `barTone` pinta el estado entero. | **Adaptar** | `progress?` opcional. Sin el campo, la barra de estado queda igual. Con el campo, pista `bg-muted`, borde `border-foreground`, relleno `bg-foreground` con `scaleX`. |
| 2. Avance acumulado en la fila de fase | La fila de grupo solo mostraba nombre y conteo; la celda de tiempo era `bg-muted/40` vacía (`registry/ui/timeline-gantt.tsx`, bloque del grupo). `groupWorkstreams` y `layoutGroups` no calculan avance (`registry/lib/timeline-gantt.ts`). | **Adoptar** | `workstreamProgress` en `registry/lib/timeline-gantt.ts`. Barra y porcentaje en la fila solo si alguna tarea del cronograma trae un avance válido. |
| 3. Panel lateral de edición controlado por el anfitrión | El encabezado del componente dice que `onSelect` y `onHover` no escriben (`registry/ui/timeline-gantt.tsx`). No había `onTaskChangeRequest` ni hoja. La hoja y los campos ya existen en `components/ui/sheet.tsx` y `components/ui/field.tsx`. | **Adoptar** | `editingId`, `onEditingIdChange`, `onTaskChangeRequest`. La hoja usa Sheet + Field + Input. El anfitrión guarda, con `applyGanttTaskPatch` si quiere. |

Nada de los tres puntos estaba cubierto ni se descarta.

## API

`progress` en cada tarea es una **fracción de 0 a 1**. `0.5` es 50%. `1` es 100%.

- Por debajo de 0 se recorta a 0. Por encima de 1 se recorta a 1.
- Un valor finito mayor que 1 **no** se lee como porcentaje. `50` queda en 1 (100%), no en 50%. En desarrollo, `parseGanttProgress` avisa con `console.warn`. En producción no avisa.
- `NaN`, infinitos y cualquier cosa que no sea número se ignoran. La barra sigue siendo el bloque de estado, sin relleno. No cuentan como 0% en el acumulado.
- El campo de la hoja es un número de 0 a 100 con sufijo `%`. El parche guarda la fracción (`64` → `0.64`).
- El control de fecha lleva `lang` del cronograma. El texto que se ve (a veces `mm/dd/yyyy`) lo decide el navegador, no el `lang`. La pista lo dice.

`workstreamProgress(tareas)` es pura. Devuelve `{ ratio, percent, weightDays, omitted, milestones }`.

- El peso es el número de días inclusivos (`fin − inicio + 1`). Una tarea de un día (`inicio === fin`) pesa 1.
- Una tarea sin `progress` válido no entra al numerador ni al denominador. No se toma como 0%.
- Un hito (`milestone: true`) o un rango con fin anterior al inicio pesa 0 y no mueve el porcentaje.
- Un grupo vacío, o un grupo donde todo es hito o no tiene avance, devuelve `ratio: null`. La fila muestra el nombre y el conteo. No pinta 0% ni el texto «Sin avance», que se leía como cero.
- Si el cronograma entero no trae ningún avance válido, las filas de grupo no cambian.

`onTaskChangeRequest(taskId, patch)` entrega la intención. La pieza no escribe `items`. `editingId` / `onEditingIdChange` controlan la hoja de 390 px. Al abrir, el foco entra al nombre. Escape cierra y devuelve el foco a la barra. Fin tiene que ser el mismo día o uno posterior al inicio.

`applyGanttTaskPatch` es un helper para el anfitrión. `progress: null` en el parche borra el avance.

El cromo sigue en es-MX. `timelineGanttLabelsEn` trae el inglés, incluidas las cadenas del panel.

## Contraste medido (WCAG 1.4.11)

Tokens de `app/globals.css`, conversión oklch → sRGB lineal. El test está en `__tests__/timeline-gantt-progress.test.ts`.

| Par | Claro | Oscuro |
| --- | --- | --- |
| Relleno `foreground` contra pista `muted` | 18.15:1 | 14.48:1 |
| Relleno `foreground` contra fondo `background` | 19.79:1 | 18.96:1 |
| Borde `foreground` contra fondo `background` | 19.79:1 | 18.96:1 |

La pista `muted` contra el fondo queda en 1.09:1 (claro) y 1.31:1 (oscuro), por debajo de 3:1. El borde `foreground` es el que delimita la barra. El largo del relleno (`scaleX`) y el porcentaje escrito son la segunda señal, además del color.

`chart-4` en oscuro queda en 1.91:1 contra el fondo y 1.45:1 contra `muted`. Por eso el relleno de avance no usa el color de estado. La barra sin `progress` conserva ese color, como antes.

## Comparación con ui-system 4.0.0

Sha leído: `419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`. Las citas son de ese snapshot.

| Regla | Dónde | Qué pide | La pieza |
| --- | --- | --- | --- |
| Semántica y nombre | `rules/a11y.md:5-7` | HTML primero, teclado con foco visible, nombre accesible | `section` con título, barras `button` con `focus-visible:ring`, flechas, `role="progressbar"` con nombre. Cumple. |
| No solo color | `rules/a11y.md:8` | El contraste AA está en `tokens.md`; no comunicar solo con color | El avance es el largo del relleno más el porcentaje (o el nombre accesible si no cabe). No es una regla nueva: es esta frase aplicada a la barra. |
| Área de toque | `rules/a11y.md:9` | ≥ 24 px AA, ≥ 44 recomendado en táctil | La barra mide `h-7` (28 px). Cumple AA. No llega a 44. |
| Menos movimiento | `rules/a11y.md:10` | Respetar `prefers-reduced-motion` | `useReducedFlag` deja la entrada y el `scaleX` en duración 0. Cumple. |
| Formulario y diálogo | `rules/a11y.md:11-12` | Label, error anunciado; foco atrapado y devuelto; Esc cierra | Field + `FieldError` (`role="alert"`). La hoja abre en el nombre y Esc devuelve el foco a la barra. Cumple. |
| Tokens semánticos | `rules/tokens.md:7-8` | El componente solo consume semánticos. 4.5:1 texto, 3:1 UI, claro y oscuro | Relleno `foreground`, pista `muted`, borde `foreground`. Sin hex en `registry/`. Contraste medido arriba. Cumple. |
| Extremos | `rules/layout.md:11` | Vacío, carga, error y contenido extremo (`skills/emil/break-ui`) | Escenas `empty`, `loading`, `error`, `long`, `extremes`, `many`. Ronda de fix: nombre de 60 caracteres con avance, 0 contra 1, grupo sin ratio. |
| Móvil | `rules/layout.md:12` | Desde móvil | Capturas a 390 px. Cumple. |
| Contraste medible | `knowledge/rules.yaml:88` `RUI-CONTRAST-001` | Par de roles ≥ 4.5 texto y ≥ 3 UI, en cada modo | El test de contraste cubre relleno/pista y relleno/fondo. No hace falta otra regla para el 3:1. |
| `transition: all` | `knowledge/rules.yaml:117` `RUI-ANIM-PERF-001`; `SKILL.md:209` | Nunca `transition-all` ni `transition` sin propiedad | El relleno no usa `transition`. Lo mueve Motion con `scaleX`. |
| Sin layout animado | `knowledge/rules.yaml:118` `RUI-ANIM-PERF-002`; `SKILL.md:210` | No animar `width`/`height`/…; usar `scale()`/`translate()` | `animate={{ scaleX }}` en el relleno. `registry/ui/timeline-gantt.tsx`. Cumple esta regla; no se copia en RUI-PROGRESS-001. |
| Sombra, blur, will-change, rAF | `knowledge/rules.yaml:119-123` `RUI-ANIM-PERF-003` a `007` | No animar `box-shadow` ni blur grande; sin `will-change` global; sin `setState` por frame | El relleno no hace ninguna de esas cosas. |
| Copia | `rules/copy.md:5-8` | Verbo + objeto, error que dice cómo seguir, vacío con acción | «Guardar» y «Cancelar». El error de fechas dice que el fin no puede ir antes del inicio. El vacío del cronograma ya decía qué es y qué aparecerá. |

`RUI-ANIM-PERF-002` ya exige `scale()` en vez de animar `width`. El relleno la cumple. No se propone de nuevo.

## RUI-PROGRESS-001 (propuesta, no está en el hub)

No duplica lo ya citado:

- El 3:1 de UI ya es `RUI-CONTRAST-001` (`rules.yaml:88`).
- Animar con `scale` y no con `width`, y no usar `transition-all`, ya es `RUI-ANIM-PERF-001` y `002` (`rules.yaml:117-118`).
- «No comunicar solo con color» ya es `rules/a11y.md:8`. La propuesta dice **cómo** lo cumple una barra de avance (largo + texto), no repite la frase general.
- `rules/a11y.md:10` ya pide respetar reduced motion. No se repite aquí.

Lo que ningún id del snapshot dice: el valor es una fracción 0–1, un no-número no es 0%, y el control es un `progressbar` con valor. Borrador para VibeBot, en la forma de `knowledge/rules.yaml`. `status: proposed` no está en el enum del snapshot (`active` / `deferred`); por eso no se pega en el hub.

```yaml
  - id: RUI-PROGRESS-001
    title: El avance es una fracción y no se lee como cero cuando falta
    description: >-
      progress de una tarea o de una barra es una fracción de 0 a 1 (0.5 es 50%).
      Por debajo de 0 y por encima de 1 se recorta. NaN, Infinity y un valor ausente
      no se dibujan como 0%: la barra queda sin relleno. El tramo lleno se distingue
      de la pista por su largo y, cuando cabe, por el porcentaje escrito; si no cabe,
      el porcentaje está en aria-valuetext o en el detalle. El control expone
      role=progressbar con aria-valuemin, aria-valuemax y aria-valuenow.
      El 3:1 del relleno contra la pista y el fondo lo cubre RUI-CONTRAST-001.
      Animar el largo con scale, no con width, lo cubre RUI-ANIM-PERF-002.
    severity: major
    category: a11y
    check: test
    check_tool: "prueba de la pieza (parse + progressbar); contraste vía RUI-CONTRAST-001"
    origin: {source: "retana-ui L-SHADCNSTUDIO-gantt-chart-04", date: 2026-11-04}
    status: proposed
```

## Break-ui

Revisión de `rules/layout.md:11` sobre el cronograma con avance:

- Nombre de 60 caracteres sin espacios, con `progress: 0.5`, en una columna de 140 px: el nombre lleva `truncate` y la celda `overflow-hidden`. El porcentaje no se empuja fuera.
- `progress: 0` deja la pista `bg-muted` con `border-foreground` y sin nodo de relleno. `progress: 1` llena la pista con `bg-foreground` y conserva el borde. Vacío y lleno se distinguen por el interior (muted contra foreground, 18.15:1 en claro y 14.48:1 en oscuro), no solo por el número.
- Un grupo con `ratio: null` junto a otro que sí tiene avance no muestra «Sin avance» ni un 0% inventado. Solo el nombre y el conteo.
- Con `prefers-reduced-motion: reduce`, la sección marca `data-reduced-motion="true"` y el relleno no arranca en `scaleX(0)`.

## Pruebas

No existe `ui-tests/expected-red.yaml` en este repo. Los tests nuevos de la pieza se corrieron antes de la UI (fallaban al buscar `progressbar` y la hoja) y quedaron en verde después.
