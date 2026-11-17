# L-SHADCNSTUDIO-user-schedule-05

- **Fecha:** 2026-11-03
- **Pieza:** `agenda` (bloque) y `agenda-core` (funciones puras en `registry/lib/agenda.ts`)
- **Head de partida:** `6671cfa` en `CPL` (árbol leído antes de editar la pieza)
- **Fuente:** shadcn/studio, bloque de marketing «User Schedule #5»
  - Página pública: https://shadcnstudio.com/blocks/marketing-ui/user-schedule#user-schedule-05
  - No se abrió el código del bloque, ni el preview de pago, ni sus assets.
- **Licencia:** Pro, idea only. El bloque es de pago y no está comprado. Clean-room: solo la idea (eje de recursos, aviso de choques, uso contra capacidad). Cero copia de markup, copy, colores, iconos o datos.

## Idea que se toma

Un calendario en el que cada reserva pertenece a un recurso (sala, persona, horno), los choques del mismo recurso se dicen con texto, y el uso de horas se compara con un cupo.

## (a) Eje de recursos

**No está cubierta.**

`AgendaEvent` no tiene `resourceId`. Los campos son id, título, intervalo, día completo, categoría, lugar, atención, encargos opacos y participantes (`registry/lib/agenda.ts`, líneas 55-69). `AgendaProps` no acepta `resources` ni un filtro de recurso (`registry/blocks/agenda.tsx`, líneas 73-127). La cuadrícula de día y semana parte el eje en fechas (`visibleDates` en `registry/lib/agenda.ts`, líneas 613-621; `TimeGrid` en `registry/blocks/agenda.tsx`, líneas 631-657). No hay columnas por recurso ni un control de filtro.

**Veredicto: adapt.** La agenda ya es el calendario del catálogo. Se extiende con props opcionales. Sin esas props el render sigue igual. No hace falta una pieza nueva.

## (b) Detección de choques

**No está cubierta.**

`placeOverlaps` (`registry/lib/agenda.ts`, líneas 779-808) solo reparte columnas visuales de segmentos con hora. El borde `item.start >= clusterEnd` (línea 795) y `end <= item.start` (línea 796) hacen que fin == inicio no comparta columna, pero eso no es un aviso de reserva: no agrupa por recurso, no nombra el otro evento y no publica un conteo. `layoutTimedSegments` se salta el día completo (`registry/lib/agenda.ts`, línea 827). No hay una función que devuelva pares en conflicto. La tarjeta (`registry/ui/agenda-event.tsx`, líneas 152-191) anuncia título y hora; no anuncia un choque. El encabezado no tiene un control con conteo.

La zona horaria y el DST sí existen para mover el reloj (`zonedDateTimeToUtc`, `registry/lib/agenda.ts`, líneas 496-530; prueba en `__tests__/agenda.test.tsx`, líneas 117-132). No se usan para decidir un choque.

**Veredicto: adapt.** Se añade una función pura, `findResourceConflicts`, con intervalos semiabiertos `[inicio, fin)`. El empaque visual de columnas se queda como está.

## (c) Horas contra capacidad

**No está cubierta.**

Ningún tipo de la agenda tiene `capacity` o `capacityHours`. No hay una función que sume horas agendadas ni que calcule exceso. El catálogo tiene `usage-meter`, y eso mide un cupo genérico, no el rango visible de la agenda.

**Veredicto: adapt.** Función pura `resourceLoads` y un resumen opcional que solo aparece cuando el anfitrión pasa `resources` con `capacityHours`.

## Decisión del paso 1

(a), (b) y (c) no están cubiertas. Se construye sobre `agenda`. Sin `resources`, la pieza se comporta como en `6671cfa` (la suite anterior es la red de regresión).

## Qué no se toma de la referencia

Layout, tipografía, ilustraciones, nombres de personas, paleta y cualquier archivo del bloque Pro.
