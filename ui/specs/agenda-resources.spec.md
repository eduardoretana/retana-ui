---
spec_id: agenda-resources
version: 0.1.0
profile: STANDARD
spec_changelog:
  - version: 0.1.0
    origin: lead
    note: Eje de recursos, choques y cupo sobre la agenda existente.
---

# agenda-resources

## Brief

- **Outcome:** La agenda puede mostrar recursos, decir un choque con texto y comparar horas contra un cupo, sin cambiar el comportamiento cuando el anfitrión no pasa `resources`.
- **Benefit:** Un taller inventado ve qué horno está doble y cuándo se pasa del día.
- **Sources:** shadcn/studio User Schedule #5, idea only, Pro no comprado. Evidencia en `docs/learnings/L-SHADCNSTUDIO-user-schedule-05.md`. Pieza de partida `agenda` en `6671cfa`.
- **Scope:** `registry/lib/agenda.ts`, `registry/blocks/agenda.tsx`, `registry/ui/agenda-event.tsx`, ejemplos de `app/examples/agenda/`, pruebas y estos artefactos. No se crea una pieza nueva. No se toca el hub.
- **Checks:** AC-1 a AC-8. Suite `__tests__/agenda.test.tsx` sigue verde.
- **Stop when:** Sin `resources` el DOM de filtro, choque y cupo no aparece; con `resources` los AC se cumplen en es-MX y en inglés, a ancho de columnas y a 390px.
- **Deliverable:** La misma pieza `agenda`, PLP, y esta spec. PR en borrador. Sin merge.

## Alcance de rutas

- `registry/lib/agenda.ts`
- `registry/blocks/agenda.tsx`
- `registry/ui/agenda-event.tsx`
- `app/examples/agenda/**`
- `__tests__/agenda-resources.test.tsx`
- `__tests__/agenda.test.tsx`

## Personas

Quien arma el día de un taller. No hay cuenta real ni nombres de clientes.

## Estados

idle, pending (loading), error, empty, y los de esta extensión: conflicto, sobrecapacidad, muchos recursos (30 × 200), nombre largo, 390px, reducido en movimiento, es-MX y EN.

## Datos

Estudio Cálamo. Fechas de abril y marzo de 2026. Zona `America/Mexico_City` y, para el DST, `America/New_York`. Nada de producción.

## Marca

Hereda el tema del anfitrión. Cero tokens nuevos. La dirección visual no se genera: el bloque de referencia es de pago y no se abre, y la pieza no trae tema. Se reutiliza el demo que ya tenía la agenda.

## retana_ui

- sha de partida: `6671cfa` (el head del PR lo fija el commit de esta rama)
- registry_source: local-clone

## Componentes

- retana: `agenda`, `agenda-event`, `agenda-core` (extensión, no candidato nuevo)
- retana_ui_layer: el propio catálogo

## Riesgo visual

Medio. Columnas nuevas en el día. La semana sin `resources` no cambia de contrato.

## Copy

Español por defecto. Inglés en `agendaLabelsEn`. Textos de choque y cupo en `docs/agenda-resources.md`.

## Aceptación

### AC-1 · Retrocompatible

- **measure:** Render sin `resources`. No hay combobox «Recurso», ni botón de choque, ni `[data-slot=agenda-capacity]`. `data-resource-layout` es `off`.
- **test:** `__tests__/agenda-resources.test.tsx` «keeps the previous agenda when resources are omitted» y la suite `__tests__/agenda.test.tsx`.

### AC-2 · Eje y filtro

- **measure:** Con `resources`, el día ancho usa columnas (`data-resource-layout=columns`) con un `columnheader` por recurso. El filtro no controlado oculta los otros. El controlado llama `onResourceIdChange` y no cambia solo.
- **test:** «filters by resource, controlled or not, and lays the day out in columns».

### AC-3 · 390px

- **measure:** Con `matchMedia(max-width: 767px)` o ancho medido menor de 560px, el día es lista (`data-resource-layout=list`), con encabezado por recurso y sin columnas.
- **test:** «uses a list instead of columns at a narrow width».

### AC-4 · Choque accesible

- **measure:** Icono con `aria-hidden` y texto «Choque con …» dentro del evento. El nombre accesible lo incluye. El encabezado anuncia «1 choque» y Enter mueve el foco al evento. Fin igual a inicio no cuenta.
- **test:** «announces a conflict…» y «does not treat a shared endpoint as a conflict».

### AC-5 · Bordes de tiempo

- **measure:** Día completo, frontera del día siguiente, hora repetida de otoño y día de 23 h de primavera, según los instantes.
- **test:** «counts an all-day event…» y «uses absolute instants across a DST fold…».

### AC-6 · Cupo

- **measure:** Texto «4 h de 3 h» y «1 h de más» con icono. La suma recorta al día visible, ignora eventos sin recurso y dobla los solapes. Un día de primavera cuenta 23 h.
- **test:** «shows scheduled hours against capacity…» y los dos casos de `resourceLoads`.

### AC-7 · Idioma, largo y cantidad

- **measure:** `agendaLabelsEn` dice «Resource», «1 conflict» y «over». 30 recursos producen 31 opciones. Un nombre largo vive en un nodo `truncate`.
- **test:** «switches the chrome to English» y «keeps thirty resources and long names…». 200 eventos encadenados producen 199 pares.

### AC-8 · Tema

- **measure:** En `registry/blocks/agenda.tsx`, `registry/ui/agenda-event.tsx` y `registry/lib/agenda.ts` no hay hex, `rgb(`, `oklch(` ni clase de paleta Tailwind. La animación nueva no existe; no se añade `transition`.
- **test:** `pnpm registry:build` (el validador de color) y revisión del diff.

## No objetivos

- No se copia el bloque Pro ni sus assets.
- No se mueve el `resourceId` al arrastrar.
- No se audita este ciclo desde el mismo agente.
- No se mergea el PR.
- No hay tablero de dirección nuevo: la referencia no se puede abrir y el tema lo pone el anfitrión.
