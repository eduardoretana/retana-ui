---
artifact_id: bento-grid.direction-map
owner: builder
spec_version: 1.1.0
head: 4c349f59bfebf04e093b39c69c33b226f25165d8
profile: STANDARD
spec_id: bento-grid
ui_system: "4.0.0"
---

# Direction map — bento-grid

No hay imagen nueva. `direction.images: none`. `generators_used: []`. La elección de ilustración sigue en `ui/direction/bento-grid/selection.md` (`media-first`). Este mapa registra cómo se aplican las reglas de layout del PR #59, sin mergear esa rama y sin copiar `stagger-list`.

`reference_id: pr:59` · rama `cursor/layout-roll-stagger-8c2f` · reglas en `docs/layout-transitions.md` de ese PR.

| Región | reference_id | Qué se construyó | Cita |
| --- | --- | --- | --- |
| Copia de la tarjeta | pr:59#width | El bloque de título, descripción y CTA lleva `max-w-[17.5rem]`. La ilustración sigue llenando la celda. | AC-16 · rule:RUI-LAYOUT-WIDTH-001 |
| Celda magnética | pr:59#width | Título, descripción y CTA con la misma cota. Los quiebres siguen en 36rem y 56rem. | AC-16 · AC-20 · rule:RUI-LAYOUT-WIDTH-001 |
| Tarjeta | pr:59#border | El `article` ya no suma `rounded-xl` ni un `border`. Radio, anillo y superficie quedan en `Card`. | AC-17 · rule:RUI-LAYOUT-BORDER-001 |
| Celda magnética | pr:59#border | Se quitó `border border-border`. La separación es `gap-4` de la pista, `gap-3` interno y `shadow-sm`. El anillo de foco se queda. | AC-17 · rule:RUI-LAYOUT-BORDER-001 |
| CTA de la tarjeta | pr:59#color | Sigue en `text-primary`. Título y descripción no usan `text-primary`. | AC-9 · rule:RUI-LAYOUT-COLOR-001 |
| Error | pr:59#color | `text-destructive` sobre blanco mide 4.91:1 y en oscuro 6.24:1, así que no pasa a `text-foreground`. El aviso lleva `role=alert` y `font-medium`: el color no es la única señal. | AC-19 · wcag:1.4.1 · wcag:1.4.3 · rule:RUI-CONTRAST-001 |
| CTA magnético | pr:59#color | El texto visible pasa a `text-foreground`. `chart-1` como texto mide 1.48:1 sobre blanco. En reposo el CTA sigue en `opacity: 0`, así que no hay color fuerte en todas las celdas. El acento de la celda activa queda en el indicador. El título quieto no lo usa. | AC-19 · rule:RUI-LAYOUT-COLOR-001 · rule:RUI-CONTRAST-001 |
| Icono magnético | pr:59#motion | Se quitó `transition-colors`. El color, si cambia al activar, lo hace sin transición. | AC-19 · rule:RUI-MOTION-CONTINUITY-001 |
| Hover de la tarjeta | pr:59#motion | Sigue en `translate` y `opacity`. `will-change-transform` solo con el puntero encima (`hover:` y `group-hover/feature:`). `motion-reduce` apaga la transición y el will-change. No hay `transition-all`. | AC-9 · rule:RUI-MOTION-CONTINUITY-001 · rule:RUI-ANIM-PERF-001 |
| Entrada de la rejilla | pr:59#motion | Celdas con `opacity` y `translateY` (`0.7em`). Tope local `BENTO_STAGGER_MAX_S = 0.4`. `MotionConfig reducedMotion=always` deja duración 0. No se anima el alto de la pista. `stagger-list` no está en esta rama: cuando #59 se mergee, esta entrada puede pasar a esa primitiva sin cambiar el tope. | AC-18 · rule:RUI-MOTION-CONTINUITY-001 · rule:RUI-ANIM-PERF-002 |
| Indicador magnético | pr:59#motion | Se quitó la transición de `background-color`. El recorrido publicado del indicador (`inset`, `--mb-dur`, `--mb-ease`) no se toca: es contrato de la API. Ese ease sigue con un leve overshoot (`1.06`) y no se reescribe aquí. | AC-20 · rule:RUI-MOTION-CONTINUITY-001 |
| Placeholders | pr:59#border | Carga sigue en `rounded-xl bg-muted`, sin borde. | AC-6 · rule:RUI-LAYOUT-BORDER-001 |
