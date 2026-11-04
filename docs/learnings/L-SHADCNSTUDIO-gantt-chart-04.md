# L-SHADCNSTUDIO-gantt-chart-04

- **Fecha:** 2026-11-04
- **Fuente:** [Shadcn Studio Gantt Chart 04](https://shadcnstudio.com/blocks/dashboard-and-application/gantt-chart) (mención pública: https://x.com/i/status/2117984027814900115)
- **Licencia:** bloque Pro. Solo se usó la idea, el acomodo y la interacción. Implementación clean-room. No se copió código, texto, iconos ni assets.
- **Pieza:** `timeline-gantt` (`registry/ui/timeline-gantt.tsx`, `registry/lib/timeline-gantt.ts`)
- **ui-system:** `github.com/eduardoretana/hub-vibecoding` en `main` / `ui-system/` respondió 404 con la cuenta de este entorno. Se contrastó contra `docs/` de retana-ui, `CONTRIBUTING.md` y `AGENTS.md`. No hay ahí una regla de barras de avance. La propuesta **RUI-PROGRESS-001** queda en este archivo para que VibeBot la lleve al hub. El hub no se editó.

## Veredictos

| Punto | Evidencia | Veredicto | Destino |
| --- | --- | --- | --- |
| 1. `progress` en la barra, con nombre accesible y relleno que no depende solo del color | `GanttItem` no tenía `progress` (`registry/lib/timeline-gantt.ts`, tipo de la tarea, antes de este cambio). La barra era un botón de color de estado, sin `role="progressbar"` ni `aria-valuenow` (`registry/ui/timeline-gantt.tsx`, botón `data-slot="timeline-gantt-bar"`). `barTone` pinta el estado entero. | **Adaptar** | `progress?` opcional. Sin el campo, la barra de estado queda igual. Con el campo, pista `bg-muted`, borde `border-foreground`, relleno `bg-foreground` con `scaleX`. |
| 2. Avance acumulado en la fila de fase | La fila de grupo solo mostraba nombre y conteo; la celda de tiempo era `bg-muted/40` vacía (`registry/ui/timeline-gantt.tsx`, bloque del grupo). `groupWorkstreams` y `layoutGroups` no calculan avance (`registry/lib/timeline-gantt.ts`). | **Adoptar** | `workstreamProgress` en `registry/lib/timeline-gantt.ts`. Barra y porcentaje en la fila solo si alguna tarea del cronograma trae un avance válido. |
| 3. Panel lateral de edición controlado por el anfitrión | El encabezado del componente dice que `onSelect` y `onHover` no escriben (`registry/ui/timeline-gantt.tsx`). No había `onTaskChangeRequest` ni hoja. La hoja y los campos ya existen en `components/ui/sheet.tsx` y `components/ui/field.tsx`. | **Adoptar** | `editingId`, `onEditingIdChange`, `onTaskChangeRequest`. La hoja usa Sheet + Field + Input. El anfitrión guarda, con `applyGanttTaskPatch` si quiere. |

Nada de los tres puntos estaba cubierto ni se descarta.

## API

`progress` en cada tarea:

- De 0 a 1 es fracción. **`1` es 100%, no 1%.** Para 1% se pasa `0.01`.
- Mayor que 1 y hasta 100 se lee como porcentaje (`40` → 40%, `100` → 100%).
- Menor que 0 se recorta a 0. Mayor que 100 se recorta a 1.
- `NaN`, infinitos y cualquier cosa que no sea número se ignoran. La barra sigue siendo el bloque de estado, sin relleno. No cuentan como 0% en el acumulado.

`workstreamProgress(tareas)` es pura. Devuelve `{ ratio, percent, weightDays, omitted, milestones }`.

- El peso es el número de días inclusivos (`fin − inicio + 1`). Una tarea de un día (`inicio === fin`) pesa 1.
- Una tarea sin `progress` válido no entra al numerador ni al denominador. No se toma como 0%.
- Un hito (`milestone: true`) o un rango con fin anterior al inicio pesa 0 y no mueve el porcentaje.
- Un grupo vacío, o un grupo donde todo es hito o no tiene avance, devuelve `ratio: null`. No se inventa un 0%.
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

## RUI-PROGRESS-001 (propuesta, no está en el hub)

**Id:** RUI-PROGRESS-001

**Texto propuesto:** Una barra de avance no comunica el valor solo con color. El tramo lleno se distingue de la pista por tamaño (el largo del relleno) y por un porcentaje escrito cuando cabe; si no cabe, el porcentaje está en el nombre accesible o en el detalle. El relleno contra la pista y el relleno contra la superficie de atrás cumplen 3:1 (WCAG 2.2, 1.4.11). El borde de la pista también cumple 3:1 contra esa superficie cuando la pista y el fondo son demasiado parecidos. Se usan solo tokens del tema (`foreground`, `muted`, `background`). El relleno anima con `transform: scaleX()` y `transform-origin` al inicio de la línea; no con `width` ni con `transition-all`. Con `prefers-reduced-motion: reduce` el cambio es instantáneo. El control expone `role="progressbar"` con `aria-valuemin`, `aria-valuemax`, `aria-valuenow` y `aria-valuetext`. Un valor ausente o no finito no se dibuja como 0%.

## Pruebas

No existe `ui-tests/expected-red.yaml` en este repo. Los tests nuevos de la pieza se corrieron antes de la UI (fallaban al buscar `progressbar` y la hoja) y quedaron en verde después.
