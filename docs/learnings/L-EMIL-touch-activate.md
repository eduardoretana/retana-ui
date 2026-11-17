# L-EMIL-touch-activate

- **Fuente:** Emil Kowalski, https://x.com/emilkowalski/status/2117955432438469085 (2026, el post no devolvió cuerpo: la página respondió 403 y la API de X respondió `client-not-enrolled`). La regla usada es la que encargó esta revisión: en touch no conviven el scroll y una interacción compleja; el componente se activa con un toque y solo entonces captura el gesto.
- **Fecha de revisión:** 2026-11-04.
- **Licencia:** el post no se reproduce. La regla se parafrasea. No hay código que copiar.
- **ui-system:** snapshot `eduardoretana/hub-vibecoding@419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7`, `VERSION` 4.0.0. No hay un id de gesto táctil en `knowledge/rules.yaml`. `rules/a11y.md:9` pide objetivo ≥ 24 px (AA) y ≥ 44 px recomendado; `rules/layout.md:12` repite ≥ 44 px. `rules/a11y.md:10` pide respetar `prefers-reduced-motion`. `UIS-LAYOUT-002` (`rules.yaml:91`) solo exige `scrollY === 0` al cargar. Ninguna de esas frases dice cuándo un drag puede capturar el dedo.
- **Veredicto del aprendizaje:** **adaptar, con corrección de ronda.** Un tap (pointerup sin movimiento) abre o selecciona en el acto, en touch y en mouse. El long-press (~360 ms) es lo que autoriza el arrastre o el resize en touch. Un swipe vertical hace scroll y no mueve el evento. La primera versión de esta rama, que armaba con el primer toque y no abría, era peor UX y se revirtió.

## Regla

| Regla | Estado | Evidencia | Veredicto | Destino |
| --- | --- | --- | --- | --- |
| En touch, scroll e interacción compleja no conviven. | Carrusel, filas con swipe, sheet e image-compare ya ceden el eje del scroll. | `carousel.tsx:279` y `:376` (`locked = "y"`, `touch-pan-y`). `swipe-actions.tsx:312` y `:453`. `bottom-sheet.tsx:465-522` (`touch-none` en la hoja; `touch-pan-y` solo expandida). `image-compare.tsx:246` y `:317` (en touch el cuerpo no arranca el drag; el asa sí; `touch-pan-y` / `touch-pan-x`). | **Ya cubierto** en esas piezas. | No se les pide un toque extra: el eje o el asa ya es la activación. Un carrusel que exigiera un tap antes de deslizar empeoraría el gesto principal. |
| Un tap abre al instante. En touch, el arrastre espera un long-press y el swipe vertical no captura. | La primera corrección armaba el chip y no abría. Eso bloqueaba la acción principal. | `touchIntent` en `multi-view-fields.tsx` (hold 360 ms, slop 8 px). Calendario: `touch-pan-y`, `data-gesture="holding"` solo tras el hold, `min-h-6` (24 px, `a11y.md:9`). Timeline: igual, barra `h-6`. Tests: tap abre a la primera; swipe vertical no llama a `onMove`; long-press + drag sí. Ratón: click abre y el drag de mouse sigue a 6 px. Teclado (Alt+flecha, flechas del timeline) intacto. | **Adaptar** | Hecho en la ronda de fix. No se usa el primer toque como único candado. |
| Un asa dedicada es la activación. | Lista ordenable, tablero y kanban ponen los listeners en el grip, no en la tarjeta. | `sortable-list.tsx:239-242` (`touch-none` en el asa). `view-kanban.tsx:436` (se añadió `touch-none` al grip, que ya era el único listener). `delegate-board.tsx` botón de drag aparte. | **Ya cubierto**, con un ajuste de `touch-none` en el grip del kanban. | El cuerpo de la tarjeta sigue haciendo scroll. |
| Slider de confirmación dentro de una página que hace scroll. | El thumb capturaba el puntero en `pointerdown`, también en touch, y el track no declaraba `touch-pan-y`. | `slide-to-confirm.tsx:41` `slideAxis`. `:227` el touch no captura hasta que el eje es horizontal. `:296` `touch-pan-y`. Test en `__tests__/micro-interactions.test.tsx`. | **Adaptar** | Vertical sigue siendo scroll. Horizontal arma el slide. No se exige un tap previo: el control entero es el gesto, y el eje lo separa del scroll. |
| Tableros con asa (pipeline, task board, work table). | El drag ya nace en `dragHandleProps` o en el activator, con `distance` de 5–6 px en puntero fino. | `blocks/task-board.tsx`, `blocks/pipeline-board.tsx`, `work-table.tsx` (`setActivatorNodeRef`). | **Ya cubierto** | No se cambia el teclado ni el distance del mouse. |

## Qué no se tocó

- **Carrusel.** Sigue con `touch-pan-y` y candado de eje. Forzar “tap para armar” contradice el gesto de pasar diapositivas.
- **Bottom sheet.** El header ya es el agarre (`touch-none`). El cuerpo expandido vuelve a `touch-pan-y` para leer. Es la misma idea: una zona captura, la otra hace scroll.
- **Image compare.** En touch, el primer movimiento vertical no empieza el comparado (`image-compare.tsx:246-258`). El asa sí. Ya está activado por un control, no por toda la foto.
- **Bento magnético.** El resalte sigue al foco y al puntero fino. No es un drag que robe el scroll. Sin cambio. Ver `registry/ui/magnetic-bento.tsx`.

## Comparación con el hub (`419ad648`)

| Regla | Cita | Relación |
| --- | --- | --- |
| UIS-LAYOUT-002 | `knowledge/rules.yaml:91` | La página carga en `scrollY === 0`. No habla de gestos. No se duplica. |
| RUI-ANIM-PERF-001…007 | `knowledge/rules.yaml:117-123` | Rendimiento de la propiedad animada. No dicen cuándo un dedo puede arrastrar. No se duplica. |
| Objetivo 24 / 44 px | `rules/a11y.md:9`, `rules/layout.md:12` | Tamaño del control, no la activación del drag. El chip queda en 24 px (`min-h-6`). 44 px sigue siendo la recomendación de layout y no se cumple en la rejilla densa; no es parte de `RUI-TOUCH-001`. |
| Reduced motion | `rules/a11y.md:10` | No es una regla táctil. La precisión del colapso está en `RUI-ANIM-CHOREO-001`. |

## Secuencia en touch

1. **Calendario.** Un tap (pointerup sin pasar de 8 px) abre el registro enseguida, igual que un click. `touch-pan-y` deja el scroll vertical al navegador: si el dedo se mueve más en Y que en X antes del hold, no hay `setPointerCapture` ni `onMove`. A los 360 ms sin ese movimiento el chip pasa a `data-gesture="holding"`, aplica `touch-none` y el desplazamiento horizontal al soltar mueve el día. El mouse sigue con `MouseSensor` a 6 px. Alt+flecha no cambia.
2. **Timeline.** Igual: el tap abre; el swipe vertical no mueve la barra; el long-press y el arrastre horizontal sí. El mouse captura en el primer `pointerdown`, como antes.
3. **Slide to confirm.** Un touch casi vertical (`slideAxis` → `y`) no mueve el thumb. Uno horizontal captura y desliza. El teclado de flechas sigue confirmando al cruzar el umbral.

## Propuesta para VibeBot — `RUI-TOUCH-001`

No duplica `UIS-LAYOUT-002`, `RUI-ANIM-PERF-*` ni las líneas de objetivo de `a11y.md` / `layout.md`. No existe otro id de gesto en `rules.yaml`. Formato de esa semilla. No se escribió en el hub.

```yaml
- id: RUI-TOUCH-001
  title: "En touch, un tap abre; el arrastre espera un long-press y el eje vertical sigue siendo scroll"
  description: >-
    Un pointerup sin movimiento abre o selecciona el objetivo en el acto, en touch y en
    mouse. En touch, el arrastre o el resize de un control que también vive en un scroller
    (evento de calendario, barra de timeline) no captura el puntero hasta un long-press de
    300–400 ms, o hasta un arrastre que nace en un asa o en un evento que ya está
    seleccionado. Un movimiento vertical mayor que el horizontal, antes de ese hold, no
    llama a setPointerCapture y no mueve el dato: la página hace scroll (touch-pan-y).
    Un control de un solo eje (carrusel, swipe, slider, comparado) cede el eje del scroll
    con touch-action y solo captura cuando gana su propio eje. Si hay asa, solo el asa
    lleva touch-none. El teclado no pasa por el hold. El objetivo no baja de 24 px
    (rules/a11y.md L9); 44 px sigue siendo la recomendación de rules/layout.md L12 y no
    se redefine aquí.
  severity: major
  category: a11y
  check: test
  check_tool: "retana-ui __tests__/multi-view-ui.test.tsx (tap, swipe vertical, long-press)"
  origin:
    source: "Emil Kowalski, https://x.com/emilkowalski/status/2117955432438469085 (paráfrasis de la revisión 2026-11-04; el post no se reproduce). Ajuste de UX: el tap abre al instante."
    date: 2026-11-04
  status: proposed
```
