# direction-map — gestos-seguimiento · spec 0.1.1

Base de código: H = el commit que añade este archivo sobre `f572f34b4fca79d38c0bf811dd4aee737cf533d3` (el código no cambia en ese commit).
Referencias: `REF-cpl-slide-to-confirm`, `REF-cpl-view-timeline`, `REF-emil-gestures`. Fichas y sha256 en `ui/direction/gestos-seguimiento/reference-meta.yaml`.
Vocabulario de citas (AUDITOR.md §7): `AC-n`, `spec:<campo>`, `rule:<ID>`, `wcag:<criterio>`, `catalog-gap:<item>`.
Los `AC-n` citados son los de la tabla «Criterios de aceptación» de `ui/specs/gestos-seguimiento.spec.md` (sha256 con prefijo `86526d507d19`; el sha256 completo va en el sobre, para que fixture_lint no lo lea como teléfono).
Las `rule:` citadas existen en `knowledge/rules.yaml@419ad648` (blob f16049b5).

| Región | reference_id | Referencia (CPL 33438d12) | Implementación en H | Desviación | Cita |
|---|---|---|---|---|---|
| R1 Pista y asa | REF-cpl-slide-to-confirm | pista con asa a la izquierda y etiqueta centrada | igual | no | `rule:UIS-COMP-OCP-001` |
| R2 Seguimiento | REF-cpl-slide-to-confirm | `animate` con spring dentro de `pointermove` (el asa va detrás) | motion value escrito en cada move; sin `animate` en el move | sí, comportamiento | `AC-1`; `rule:RUI-ANIM-PERF-005` |
| R3 Release y reduced motion | REF-cpl-slide-to-confirm | spring sin velocidad | spring con `velocity`; con reduced motion el move sigue 1:1 y el release no anima | sí | `AC-2`; `wcag:2.3.3` |
| R1 Cronograma | REF-cpl-view-timeline | barras por proyecto sobre la rejilla de fechas | igual | no | `rule:UIS-COMP-OCP-001` |
| R2 Arrastre de la barra | REF-cpl-view-timeline | la barra no se mueve hasta `pointerup` | `translate3d` en cada move; confirma la fecha en `pointerup`; `touch-pan-y` | sí, comportamiento | `AC-3`; `rule:RUI-ANIM-PERF-005` |
| R3 Escenas PLP | REF-cpl-view-timeline | sin `scenes.tsx` | filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390 | sí, se agregan | `AC-4` |

Sin assets de terceros en el repo. Las PNG de referencia viven en el box (ruta + sha256 en las fichas).
