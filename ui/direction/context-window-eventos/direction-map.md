# direction-map — context-window-eventos · spec 1.0.0

Base de código: el commit que añade este archivo sobre `db19a518cddc7b1461f2e47c9470a7de4d93088e` (el código no cambia en ese commit).
Referencias: `REF-cpl-context-window`. Fichas y sha256 en `ui/direction/context-window-eventos/reference-meta.yaml`.
Vocabulario de citas (AUDITOR.md §7): `AC-n`, `spec:<campo>`, `rule:<ID>`, `wcag:<criterio>`, `catalog-gap:<item>`.
Los `AC` citados son los de la tabla «Criterios de aceptación» de `ui/specs/context-window-eventos.spec.md` (sha256 con prefijo `907644b1c6d0`; el sha256 completo va en el sobre).
Las `rule:` citadas existen en `knowledge/rules.yaml@419ad648`.

| Región | reference_id | Referencia (CPL 33438d12) | Implementación en H | Desviación | Cita |
|---|---|---|---|---|---|
| R1 Card y estado | REF-cpl-context-window | uso frente al límite | se agrega el estado (leyendo o compactando) y el aviso de umbral | sí | `AC-5`; `AC-10`; `wcag:4.1.3` |
| R2 Barra de ticks | REF-cpl-context-window | barra de uso | ticks repartidos por fuente sin pasar el presupuesto | sí | `AC-8`; `rule:RUI-TOKEN-001` |
| R3 Grilla de fuentes | REF-cpl-context-window | lista de fuentes | grilla de tres columnas con teclado; fijar y quitar con rollback | sí | `AC-9`; `rule:UIS-COMP-DIP-001` |
| R4 Compactación | REF-cpl-context-window | no existe | la charla pasa a resumen y los segmentos se reacomodan; las fuentes fijadas no se tocan | sí, se agrega | `AC-3` |
| R5 Costo | REF-cpl-context-window | no existe | costo estimado con `PricingLike` e `Intl` (USD o MXN) | sí, se agrega | `AC-7` |
| R6 Escenas PLP | REF-cpl-context-window | escenas de CPL | playback, near-limit, compacting, compacted, over-limit, pinned, cache-heavy y 390 | sí, se agregan | `AC-12`; `spec:states` |

Sin assets de terceros en el repo. Las PNG de referencia viven en el box (ruta y sha256 en las fichas).
