# L-EMIL-touch-activate

- **Fuente:** Emil Kowalski, https://x.com/emilkowalski/status/2117955432438469085 (2026, el post no devolvió cuerpo: la página respondió 403 y la API de X respondió `client-not-enrolled`). La regla usada es la que encargó esta revisión: en touch no conviven el scroll y una interacción compleja; el componente se activa con un toque y solo entonces captura el gesto.
- **Fecha de revisión:** 2026-11-04.
- **Licencia:** el post no se reproduce. La regla se parafrasea. No hay código que copiar.
- **ui-system 4.x:** sin acceso (`hub-vibecoding` 404). No hay `RUI-TOUCH-*` en retana-ui. La evidencia es el código de gesto de esta rama.
- **Veredicto del aprendizaje:** **adaptar**. El catálogo ya separa scroll y gesto en carrusel, swipe, sheet, compare y listas con asa. Faltaba la activación explícita donde el mismo control es el drag y vive dentro de un scroller (chip de calendario, barra de timeline) y el eje vertical del slide-to-confirm.

## Regla

| Regla | Estado | Evidencia | Veredicto | Destino |
| --- | --- | --- | --- | --- |
| En touch, scroll e interacción compleja no conviven. | Carrusel, filas con swipe, sheet e image-compare ya ceden el eje del scroll. | `carousel.tsx:279` y `:376` (`locked = "y"`, `touch-pan-y`). `swipe-actions.tsx:312` y `:453`. `bottom-sheet.tsx:465-522` (`touch-none` en la hoja; `touch-pan-y` solo expandida). `image-compare.tsx:246` y `:317` (en touch el cuerpo no arranca el drag; el asa sí; `touch-pan-y` / `touch-pan-x`). | **Ya cubierto** en esas piezas. | No se les pide un toque extra: el eje o el asa ya es la activación. Un carrusel que exigiera un tap antes de deslizar empeoraría el gesto principal. |
| El componente se activa con un toque y solo entonces captura el gesto. | El chip del calendario y la barra del timeline llamaban a `setPointerCapture` / listeners de dnd en el primer contacto, encima de una superficie que también hace scroll. | Ahora: `view-calendar.tsx:389-393` (`data-gesture="dormant"` hasta el tap, luego `armed` y `touch-none`). `view-timeline.tsx:312` y `:363`. Test en `__tests__/multi-view-ui.test.tsx`. Ratón y teclado siguen directos (`data-gesture="direct"`). | **Adaptar** | Hecho. El primer toque arma y no abre. El siguiente toque abre. El drag de puntero fino no cambia. `readOnly` no arma: el toque abre. |
| Un asa dedicada es la activación. | Lista ordenable, tablero y kanban ponen los listeners en el grip, no en la tarjeta. | `sortable-list.tsx:239-242` (`touch-none` en el asa). `view-kanban.tsx:436` (se añadió `touch-none` al grip, que ya era el único listener). `delegate-board.tsx` botón de drag aparte. | **Ya cubierto**, con un ajuste de `touch-none` en el grip del kanban. | El cuerpo de la tarjeta sigue haciendo scroll. |
| Slider de confirmación dentro de una página que hace scroll. | El thumb capturaba el puntero en `pointerdown`, también en touch, y el track no declaraba `touch-pan-y`. | `slide-to-confirm.tsx:41` `slideAxis`. `:227` el touch no captura hasta que el eje es horizontal. `:296` `touch-pan-y`. Test en `__tests__/micro-interactions.test.tsx`. | **Adaptar** | Vertical sigue siendo scroll. Horizontal arma el slide. No se exige un tap previo: el control entero es el gesto, y el eje lo separa del scroll. |
| Tableros con asa (pipeline, task board, work table). | El drag ya nace en `dragHandleProps` o en el activator, con `distance` de 5–6 px en puntero fino. | `blocks/task-board.tsx`, `blocks/pipeline-board.tsx`, `work-table.tsx` (`setActivatorNodeRef`). | **Ya cubierto** | No se cambia el teclado ni el distance del mouse. |

## Qué no se tocó

- **Carrusel.** Sigue con `touch-pan-y` y candado de eje. Forzar “tap para armar” contradice el gesto de pasar diapositivas.
- **Bottom sheet.** El header ya es el agarre (`touch-none`). El cuerpo expandido vuelve a `touch-pan-y` para leer. Es la misma idea: una zona captura, la otra hace scroll.
- **Image compare.** En touch, el primer movimiento vertical no empieza el comparado (`image-compare.tsx:246-258`). El asa sí. Ya está activado por un control, no por toda la foto.
- **Bento magnético.** El resalte sigue al foco y al puntero fino. No es un drag que robe el scroll. Sin cambio. Ver `registry/ui/magnetic-bento.tsx`.

## Secuencia en touch

1. **Calendario.** El chip muestra `data-gesture="dormant"` y no lleva `touch-none`. El dedo puede desplazar el mes. El primer toque pasa a `armed`, aplica `touch-none` y no abre la ficha. A partir de ahí el drag de dnd existe. Un segundo toque abre. Un toque fuera desarma.
2. **Timeline.** Igual en la barra: el primer `pointerdown` touch solo arma; no llama a `setPointerCapture`. El siguiente sí captura y puede mover o redimensionar. Ratón captura en el primer down, como antes. Alt+flecha no cambia.
3. **Slide to confirm.** Un touch casi vertical (`slideAxis` → `y`) no mueve el thumb. Uno horizontal captura y desliza. El teclado de flechas sigue confirmando al cruzar el umbral.

## Propuesta para VibeBot — `RUI-TOUCH-001`

Texto listo para el hub. No se aplicó allí.

> **RUI-TOUCH-001. Activar antes de capturar.**
> En un puntero grueso, el scroll de la página y un gesto complejo no salen del mismo contacto. Si el control tiene un asa, solo el asa lleva `touch-none` y los listeners; el resto de la tarjeta hace scroll. Si el control es de un solo eje (carrusel, swipe, slider, comparado), `touch-action` deja libre el eje del scroll y el gesto propio espera a ganar ese eje (`touch-pan-y` o `touch-pan-x`); un movimiento en el eje del scroll no llama a `setPointerCapture`. Si el mismo control es a la vez el drag y vive dentro de un scroller de varios ejes (evento de calendario, barra de timeline), el primer toque solo arma (`data-gesture="armed"`) y no abre ni captura; el gesto se captura en el contacto siguiente, y un toque fuera desarma. Ratón y teclado no pasan por ese paso. Nada de esto bloquea el foco visible ni el objetivo de 24 px. WCAG 2.2 AA se mantiene: el teclado sigue moviendo, reordenando y confirmando.
