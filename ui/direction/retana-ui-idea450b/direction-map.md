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

`DESIGN.md` y `rules/brand/retana-ui.tokens.json` no viven en esta rama. Los trae el PR #59 (`cursor/layout-roll-stagger-8c2f`). Este mapa no los copia. Al integrar, el `tokens.json` de #59 se regenera solo si `app/globals.css` mueve un radio. Hoy no se mueven: sm 6px, md 8px, lg 10px, xl 14px, 2xl 18px, 3xl 22px, 4xl 26px.

Seed de captura: `ui/direction/fixtures/retana-ui-idea450b.seed.yaml`. Una URL por estado (`shot`, `theme`, `locale`, y `transparency=reduce` solo en dialog, dock y header).

`circle` y `circle-above` son escenas distintas (`namePlace` below y above). El sha256 idéntico de `renders/after/circle-*` y `circle-above-*` en la VM fue porque ambas filas entraban en el mismo viewport. El seed las separa: `shot=circle` y `shot=circle-above`.

Merge de `cursor/mobile-fixes-c51d` @ `1bfb56e19895d2f1b924399a5771a330446e38f5` (PR #58). El json-viewer ya no anima `grid-template-rows`; el anillo del slider es opacidad en un pseudo. Esta rama no conserva una copia propia que anime height, grid-template-rows, box-shadow o `transition-all` en esas piezas. El seed, las rutas y los comandos de arranque no cambian.

| Región | reference_id | Cita | Desviación |
| --- | --- | --- | --- |
| Fila `layout="circle"` en `registry/ui/avatar-group.tsx` | circle-names-below | AC-4, rule: RUI-ANIM-PERF-001 | `namePlace` default `below`. `shot=circle-above` es la otra variante, en su propia URL. Las personas son Inés Ejemplo, Diego Ejemplo y Marta Muestra. |
| Escenas filled, empty, loading, error | circle-names-below | AC-4, wcag: 2.2 AA | Placeholders SVG ya usados en el lightbox. Vacío con iniciales. Error con src ausente y fallback. |
| Badge `count` y `dot` en `components/ui/badge.tsx` | circle-names-below | AC-3, rule: RUI-BADGE-001, wcag: 1.4.1 | Neutro `bg-foreground` / `text-background`. El destructivo no cambia. |
| Glass en header, dock, dialog, sheet, lightbox | circle-names-below | AC-2, rule: RUI-GLASS-001 | Fallback `bg-background`. Blur `md` o `xs`. |
| Pasos de radio en `app/globals.css` | circle-names-below | AC-5, rule: RUI-RADIUS-001 | Mismos rem que el `calc` anterior. Sin cambio visual pedido. |

No hay `catalog-gap`. No hay color literal nuevo en `registry/`.
