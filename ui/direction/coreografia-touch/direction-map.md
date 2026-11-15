# direction-map — coreografia-touch · spec 1.0.0

Base de código: el commit que añade este archivo sobre `6cdabab074a6c8b98a1c09b4ea6788ae7d29bfb5` (el código no cambia en ese commit).
Referencias: `REF-cpl-multi-view`, `REF-cpl-view-calendar`, `REF-cpl-view-timeline`, `REF-cpl-slide-to-confirm`, `REF-cpl-user-menu`, `REF-cpl-dashboard-analitico-ae`, `REF-cpl-stagger-reveal`, `REF-emil-choreograph`. Fichas y sha256 en `ui/direction/coreografia-touch/reference-meta.yaml`.
Vocabulario de citas (AUDITOR.md §7): `AC-n`, `spec:<campo>`, `rule:<ID>`, `wcag:<criterio>`, `catalog-gap:<item>`.
Los `AC` citados son los de la tabla «Criterios de aceptación» de `ui/specs/coreografia-touch.spec.md` (sha256 con prefijo `8eda299b6f3a`; el sha256 completo va en el sobre).
Las `rule:` citadas existen en `knowledge/rules.yaml@419ad648`.

| Región | reference_id | Referencia (CPL 33438d12) | Implementación en H | Desviación | Cita |
|---|---|---|---|---|---|
| R1 Cambio de vista | REF-cpl-multi-view | cambio de vista con fundido fijo | fundido que escala con el delta de altura y se acota | sí, solo timing | `AC-2`; cita en `REF-emil-choreograph` |
| R2 Tap en calendario y timeline | REF-cpl-view-calendar | el primer toque armaba y no abría | el tap abre al instante en touch y mouse | sí, comportamiento | `AC-5` |
| R3 Scroll y arrastre en touch | REF-cpl-view-timeline | el arrastre competía con el scroll vertical | `touch-pan-y`; arrastre tras long-press de 360 ms | sí, comportamiento | `AC-6`; `AC-7`; `rule:UIS-LAYOUT-002` |
| R4 Riel de slide-to-confirm | REF-cpl-slide-to-confirm | riel sin `touch-action` | `touch-pan-y`; arrastre horizontal igual | sí | `AC-8` |
| R5 Menú de cuenta | REF-cpl-user-menu | items con stagger | aparecen juntos | sí, solo animación | `AC-3`; cita en `REF-emil-choreograph` |
| R6 Tarjetas AE | REF-cpl-dashboard-analitico-ae | stagger por índice sin tope; `transition-shadow` en la tarjeta | índice con tope; sin `transition-shadow`; delay 0 con reduced motion | sí, solo animación | `AC-4`; `rule:RUI-ANIM-PERF-003` |
| R7 stagger-reveal | REF-cpl-stagger-reveal | delay lineal en grupos largos | huecos que se achican y cola con tope | sí, solo timing | `AC-1`; `AC-4` |

Sin assets de terceros en el repo. Las PNG de referencia viven en el box (ruta y sha256 en las fichas).
