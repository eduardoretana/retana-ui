# direction-map — piloto-vue · spec 1.0.0

Base de código: el commit que añade este archivo sobre `4476214dbabe6708f9b3755f0aee6c81e7d5b367` (el código no cambia en ese commit).
Referencias: `REF-cpl-time-off-stats`, `REF-cpl-decision-inbox`, `REF-cpl-lightbox`. Fichas y sha256 en `ui/direction/piloto-vue/reference-meta.yaml`.
Vocabulario de citas (AUDITOR.md §7): `AC-n`, `spec:<campo>`, `rule:<ID>`, `wcag:<criterio>`, `catalog-gap:<item>`.
Los `AC` citados son los de la tabla «Criterios de aceptación» de `ui/specs/piloto-vue.spec.md` (sha256 con prefijo `37012a4355f5`; el sha256 completo va en el sobre).
Las `rule:` citadas existen en `knowledge/rules.yaml@419ad648`.

| Región | reference_id | Referencia (CPL 33438d12) | Implementación en H | Desviación | Cita |
|---|---|---|---|---|---|
| R1 Contenido y jerarquía | REF-cpl-time-off-stats | dos totales (disponibles y pendientes) con etiqueta y años | igual en React; el SFC Vue repite la jerarquía con las mismas etiquetas del JSON compartido | no | `AC2`; `rule:RUI-CONTRACT-001` |
| R2 Estados | REF-cpl-time-off-stats | escenas filled, empty, loading y error | se agregan `zero` y `pending`; los seis salen de `fixtures/` en JSON | sí, se agregan estados | `AC2`; `spec:states` |
| R3 Color | REF-cpl-time-off-stats | clases Tailwind con tokens del tema | variables del contrato; el puente Vuetify es opt-in y no cambia la UI de CPL | no en React | `AC0`; `AC3`; `rule:RUI-TOKEN-001` |
| R1 Lista y opciones | REF-cpl-decision-inbox | tarjetas con pregunta, opciones y descartar | igual; cada opción es botón con nombre accesible | no | `AC1`; `AC5` |
| R2 Respuesta y plegado | REF-cpl-decision-inbox | respuesta y plegado en la pieza React | escenas `answered` y `folded` con anuncio `aria-live` | sí, se agregan escenas | `AC2`; `AC5`; `wcag:4.1.3` |
| R1 Diálogo | REF-cpl-lightbox | lightbox sin PLP en el registry | escenas locales filled, empty, loading y error; en Vue, Dialog de reka-ui 2.11.0 (MIT) con foco atrapado | sí, se agregan escenas | `AC4`; `wcag:2.4.3`; `rule:UIS-COMP-OCP-001` |
| R2 Movimiento | REF-cpl-lightbox | transición de zoom | solo `transform` y `opacity`; reduced motion apaga pulso y zoom | no | `AC8`; `rule:RUI-ANIM-PERF-001` |

Sin assets de terceros en el repo. Las PNG de referencia viven en el box (ruta y sha256 en las fichas).
