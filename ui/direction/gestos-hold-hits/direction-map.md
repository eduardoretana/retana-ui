# direction-map — gestos-hold-hits · spec 0.1.1

Base de código: H = el commit que añade este archivo sobre `cd46531b8ab39f9a40c31c8dbd6f6b8b2c3eb619` (el código no cambia en ese commit).
Referencias: `REF-cpl-hold-to-confirm`, `REF-cpl-bottom-sheet`, `REF-emil-gestures`. Fichas y sha256 en `ui/direction/gestos-hold-hits/reference-meta.yaml`.
Vocabulario de citas (AUDITOR.md §7): `AC-n`, `spec:<campo>`, `rule:<ID>`, `wcag:<criterio>`, `catalog-gap:<item>`.
Los `AC-n` citados son los de la tabla «Criterios de aceptación» de `ui/specs/gestos-hold-hits.spec.md` (sha256 con prefijo `48413992f144`; el sha256 completo va en el sobre, para que fixture_lint no lo lea como teléfono).
Las `rule:` citadas existen en `knowledge/rules.yaml@419ad648` (blob f16049b5).

| Región | reference_id | Referencia (CPL 33438d12) | Implementación en H | Desviación | Cita |
|---|---|---|---|---|---|
| R1 Botón de hold | REF-cpl-hold-to-confirm | botón con relleno lineal mientras se sostiene | igual; el dibujo no crece | no | `spec:Non-goals` (sin cambiar el fill linear) |
| R2 Rewind | REF-cpl-hold-to-confirm | spring de 0.4 s al soltar antes del final | 0.16 s con `ease` de salida, sin spring | sí, comportamiento | `AC-1` |
| R3 Blanco táctil y hover | REF-cpl-hold-to-confirm | blanco del tamaño del dibujo; hover sin media query | `::before` de 2.75 rem; hover en `(hover: hover) and (pointer: fine)` | sí | `AC-2`; `wcag:2.5.8` |
| R1 Hoja y grabber | REF-cpl-bottom-sheet | hoja con grabber, título, cuerpo y cerrar | igual; grabber y cerrar con `::before` de 2.75 rem | sí, solo blanco táctil | `AC-2`; `wcag:2.5.8` |
| R2 Retorno al mismo detent | REF-cpl-bottom-sheet | spring compartido de 0.4 s; `will-change` fijo | spring en la llamada (`visualDuration` 0.2, `bounce` 0); sin `will-change` fijo | sí, comportamiento | `AC-3`; `rule:RUI-ANIM-PERF-006` |
| R3 Escenas PLP | REF-cpl-bottom-sheet | sin `scenes.tsx` | filled, empty, loading, error, dragging, dismissed, reduced, keyboard, 390 | sí, se agregan | `AC-4` |

Sin assets de terceros en el repo. Las PNG de referencia viven en el box (ruta + sha256 en las fichas).
