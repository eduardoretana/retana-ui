---
artifact_id: retana-ui-idea450b.selection
owner: lead
spec_version: 1.0.0
head: 2f8d20198685d27718828101bca31490a619bfc6
profile: STANDARD
screen_id: circle
variant_axis: name_place
chosen: below
reference_id: circle-names-below
---

# Elección — círculo de avatar-group

Dos variantes, mismo contenido (Inés, Mateo, Lucía, Omar), mismos tokens, mismo ancho 390. No hay fotos. La idea del círculo es clean-room; no se copian valores ni retratos.

| | Nombres abajo (`below`) | Nombres arriba (`above`) |
| --- | --- | --- |
| Eje | `namePlace="below"` | `namePlace="above"` |
| Línea de base | Los retratos comparten una línea. El nombre se trunca debajo. | El nombre empuja el retrato y la fila se desalinea si un nombre ocupa dos líneas. |
| 390 px | Cabe en una fila con `w-16` y `truncate`. | También cabe, pero el nombre compite con el título de la escena. |
| Contraste | `text-foreground` sobre el lienzo. | Igual. |
| Movimiento | opacity y translate, apagado con reduced-motion. | Igual. |

Se elige **nombres abajo**. Es la variante que mantiene los retratos alineados a 390 px. La otra queda en la escena `circle-above` para poder compararla; no es el default.

`chosen_by: lead`. No hay imagen generada: el perfil pide la elección y la referencia, y las fotos reales están fuera de alcance.
