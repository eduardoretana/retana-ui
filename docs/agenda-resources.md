# Agenda · recursos, choques y cupo

Extensión retrocompatible del bloque `agenda`. Sin la prop `resources`, la pieza se comporta como antes: cuadrícula por fecha, sin filtro, sin aviso de choque y sin resumen de horas.

La idea sale de shadcn/studio «User Schedule #5» (Pro, no comprado). Solo la idea. Ver `docs/learnings/L-SHADCNSTUDIO-user-schedule-05.md`.

## Recursos

```tsx
<Agenda
  events={events}
  resources={[
    { id: "horno", label: "Horno norte", capacityHours: 8 },
    { id: "mesa", label: "Mesa larga", capacityHours: 4 },
  ]}
  resourceId={resourceId}
  onResourceIdChange={setResourceId}
/>
```

| Campo | Significado |
|---|---|
| `resources[].id` | Identificador opaco del anfitrión. Tiene que ser único. |
| `resources[].label` | Nombre visible. Se trunca; el nombre completo queda en `title` y en el nombre accesible. |
| `resources[].capacityHours` | Horas disponibles en **un día civil** de `timeZone`. Si se omite, ese recurso no se compara con un cupo. |
| `events[].resourceId` | Recurso del evento. `null`, `undefined` o `""` significan «sin recurso». |
| `resourceId` | Filtro. `null` muestra todos. Si la prop viene, el filtro es controlado. |
| `defaultResourceId` | Valor inicial cuando el filtro no es controlado. |

En la vista de día, con el filtro en «todos»:

- Si el ancho del bloque es de al menos 560px, cada recurso es una columna de al menos 22rem. El scroll horizontal vive en la cuadrícula (`min-w-0` y `overflow-x-auto`). La barra lateral es una columna hermana y no tapa los recursos.
- Por debajo de 560px (incluye 390px) el día es una lista agrupada por recurso, con el mismo selector. Elegir un recurso vuelve a la cuadrícula de un solo día.
- Antes de medir el ancho, se usa el viewport (`max-width: 767px`) para no pintar columnas en un teléfono.

Semana y mes no parten columnas por recurso. El filtro sí aplica.

## Choques

```ts
import { findResourceConflicts } from "@/registry/lib/agenda"

const pairs = findResourceConflicts(events)
// [{ resourceId: "horno", eventIds: ["esmalte", "quema"] }]
```

Reglas, cubiertas por `__tests__/agenda-resources.test.tsx`:

- El intervalo es semiabierto `[inicio, fin)`. Si uno termina cuando el otro empieza, no hay choque.
- Solo se comparan eventos del **mismo** `resourceId`.
- Sin recurso no chocan entre sí ni con nadie.
- Un evento con `fin <= inicio` se ignora.
- El día completo usa los instantes que guardó el anfitrión. Un día de primavera en `America/New_York` dura 23 h; uno de otoño, 25 h.
- Una hora civil repetida son dos instantes. No chocan si esos instantes no se solapan.
- Cada par es un choque. Tres eventos en cadena pueden dar dos pares.

En la pieza, el aviso lleva icono y la palabra «Choque» (no se trunca). El nombre accesible y el tooltip dicen con quién choca («Choque con …»). El menú es uno solo: el botón «…». Editar, duplicar y borrar viven ahí cuando el anfitrión pasa esos callbacks. La hora va en una línea y, si la tarjeta mide menos de 11rem, queda solo para el lector de pantalla. El encabezado muestra el conteo («1 choque» / «2 choques») y, con Enter o clic, mueve el foco al primer evento en conflicto. El aviso también se anuncia en la región `status`.

El texto del choque y el chip de cupo excedido usan `text-card-foreground` sobre `bg-card` (el par del tema, claro y oscuro). No usan `muted-foreground` ni un rojo suelto.

El conteo y el resumen usan los eventos visibles: categoría no oculta, filtro de recurso y fechas de la vista actual.

## Cupo

```ts
import { resourceLoads, formatHoursFromMs } from "@/registry/lib/agenda"

const rows = resourceLoads(events, resources, ["2026-04-08"], "America/Mexico_City")
// scheduledMs, capacityMs, overMs
```

- `scheduledMs` es la suma de las intersecciones con cada día civil visible.
- Dos reservas que se pisan se suman dos veces. El choque explica el exceso.
- `capacityMs` es `capacityHours × cantidad de días distintos`. En una semana de 7 días, un cupo de 8 h se lee como 56 h.
- Un cupo negativo o no finito se trata como «sin comparación» (`capacityMs: null`, `overMs: 0`).
- El exceso es `max(0, scheduledMs - capacityMs)`.
- La lista muestra «4 h de 3 h» y, si aplica, «1 h de más», con icono. No depende solo del color.

## Limitaciones

- Arrastrar un evento no cambia su `resourceId`. El anfitrión reasigna el recurso por su cuenta.
- El día completo cuenta el día civil entero, no la ventana `hourStart`–`hourEnd`.
- El cupo es por día civil, no por la franja de horas que está a la vista.
- La vista de mes incluye los días de relleno de la cuadrícula (hasta 42). El cupo se multiplica por esos días.
- Los id de recurso se usan en el DOM. Conviene que sean estables y sin espacios.
- 30 columnas no caben en 1280px: se desplazan dentro de la cuadrícula. Si un recurso tiene más de dos solapes a la vez, esa columna pasa a lista. En 390px se usa la lista. El cupo cerrado muestra primero el exceso y como mucho 12 fichas (4 si la pantalla es estrecha). «Ver los N» lo abre (`aria-expanded`).
- No hay animación nueva. Lo que ya existía no anima layout. `prefers-reduced-motion` sigue en `data-reduced-motion`.

## Ejemplo mínimo

```tsx
const resources = [
  { id: "horno", label: "Horno norte", capacityHours: 8 },
]

const events = [
  {
    id: "quema",
    title: "Quema del lote",
    resourceId: "horno",
    startsAt: "2026-04-08T16:00:00.000Z",
    endsAt: "2026-04-08T18:00:00.000Z",
  },
]

<Agenda events={events} resources={resources} defaultView="day" anchor="2026-04-08" />
```

Los nombres del ejemplo son del taller inventado Estudio Cálamo. No hay datos reales.

## Capturas del viewport

`scripts/capture-agenda.mjs` usa Playwright y guarda solo el viewport (1280×800 y 390×844, claro y oscuro). No incluye el escritorio ni las herramientas del navegador.

```bash
pnpm exec playwright install chromium
pnpm dev --port 3000
pnpm capture:agenda -- --base http://localhost:3000 --set after --out tmp/agenda-after
```

`--set before` fotografía `/examples/agenda` sin la escena de recursos (la semana de siempre). `--set after` fotografía Choques, Sobrecapacidad y Muchos recursos. Si el aviso o el chip de cupo excedido bajan de 4.5:1, el script termina con error y escribe `contrast.json`.
