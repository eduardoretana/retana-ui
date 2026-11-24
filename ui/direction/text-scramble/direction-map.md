# direction-map — text-scramble · spec 0.1.0

Base de código: H = `a8ff697636537bef7e24c846821bb66f483b21c2` (los commits de gobierno no cambian código).
Referencias: `REF-cpl-text-reveal`, `REF-emil-decoding`. Fichas y sha256 en `ui/direction/text-scramble/reference-meta.yaml`.
Vocabulario de citas (AUDITOR.md §7): `AC-n`, `spec:<campo>`, `rule:<ID>`, `wcag:<criterio>`, `catalog-gap:<item>`.
Los `AC-n` citados son los de `ui/specs/text-scramble.spec.md` (sha256 con prefijo `e7b3563d6895`).
Las `rule:` citadas existen en `ui-system/knowledge/rules.yaml` del hub `0218369e`.

| Región | reference_id | Referencia | Implementación en H | Desviación | Cita |
|---|---|---|---|---|---|
| R1 Glifos de ruido | REF-emil-decoding | rejilla mono que se resuelve, en loop, con color | ruido ASCII en `text-muted-foreground`, una vez, por palabra encima del texto final | sí: sin loop ni color | `AC-1`; `AC-7`; `rule:RUI-ANIM-PERF-007` |
| R2 Orden | REF-emil-decoding | más o menos de arriba hacia abajo | orden de lectura con huecos que se encogen | sí, más preciso | `AC-2` |
| R3 Accesibilidad | REF-cpl-text-reveal | `sr-only` + `aria-hidden` en `text-reveal` | mismo patrón; sin `aria-live` | no | `AC-3`; `wcag:1.3.1`; `wcag:4.1.2` |
| R4 Layout | REF-cpl-text-reveal | texto en el flujo | texto final en el flujo, ruido `absolute` encima | no | `AC-4`; `wcag:1.4.10` |
| R5 Movimiento reducido | REF-cpl-text-reveal | `useMotionPreference` | texto final de inmediato, sin rAF | no | `AC-5`; `wcag:2.3.3` |
| R6 Escenas PLP | REF-cpl-text-reveal | escenas de catálogo | filled, empty, loading, error, terminal, long | sí, se agregan | `AC-11` |
| R7 Imagen por carácter | REF-emil-decoding | glifos coloreados desde una imagen | fuera | sí, se descarta | `wcag:2.3.1`; `catalog-gap:halftone-image` |

Sin assets de terceros en el repo. Las PNG de referencia y el video viven en el box (ruta + sha256 en las fichas).
