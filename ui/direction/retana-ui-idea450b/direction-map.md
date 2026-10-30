---
artifact_id: retana-ui-idea450b.direction-map
owner: builder
spec_version: 1.0.0
head: 2f8d20198685d27718828101bca31490a619bfc6
profile: STANDARD
reference_id: circle-names-below
---

# Direction map — retana-ui-idea450b

Referencia elegida: `circle-names-below` (`ui/direction/retana-ui-idea450b/selection.md`). No hay imagen de dirección: la variante es de composición, con fixtures genéricas.

| Región | reference_id | Cita | Desviación |
| --- | --- | --- | --- |
| Fila `layout="circle"` en `registry/ui/avatar-group.tsx` | circle-names-below | AC-4, rule: RUI-ANIM-PERF-001 | `namePlace` default `below`. La variante `above` existe y no es la elegida. |
| Escenas filled, empty, loading, error | circle-names-below | AC-4, wcag: 2.2 AA | Placeholders SVG ya usados en el lightbox. Vacío con iniciales. Error con src ausente y fallback. |
| Badge `count` y `dot` en `components/ui/badge.tsx` | circle-names-below | AC-3, rule: RUI-BADGE-001, wcag: 1.4.1 | Neutro `bg-foreground` / `text-background`. El destructivo no cambia. |
| Glass en header, dock, dialog, sheet, lightbox | circle-names-below | AC-2, rule: RUI-GLASS-001 | Fallback `bg-background`. Blur `md` o `xs`. |
| Pasos de radio en `app/globals.css` | circle-names-below | AC-5, rule: RUI-RADIUS-001 | Mismos rem que el `calc` anterior. Sin cambio visual pedido. |

No hay `catalog-gap`. No hay color literal nuevo en `registry/`.
