---
artifact_id: retana-ui-idea450b.build-log
owner: builder
spec_version: 1.0.0
head: 2f8d20198685d27718828101bca31490a619bfc6
profile: STANDARD
---

# Build log — retana-ui-idea450b

La suite y los renders no se commitean. El gate los toma por `--suite-log` y `--renders-log`, fuera del árbol, y esos archivos declaran el HEAD del PR.

## fix

`anim_perf_lint` marcó height en `comparison-table` (filas y título) y `transition-[height]` en `dock-nav`. Las filas siguen el patrón del json-viewer: altura estática, entrada con opacidad y `y: 4`, salida solo con opacidad, duración 0 si hay reduced-motion. El espaciador del dock cambia de altura sin animarla.

## merge

`cursor/mobile-fixes-c51d` @ `1bfb56e19895d2f1b924399a5771a330446e38f5` entra por merge. El json-viewer anima opacidad y `y`. El anillo del slider es `before:opacity` con `transition-opacity`. No queda `gridTemplateRows` ni `transition-[color,box-shadow]` en esas piezas. El seed y las rutas no se tocaron.

## needs

- Glass solo en header sticky, dock, diálogo, sheet y lightbox. El resto de los 14 archivos pierde `backdrop-blur`.
- Fallback opaco `bg-background`. El blur va detrás de `supports-[backdrop-filter]` y se apaga con `prefers-reduced-transparency` y `motion-reduce`. Blur estático, `md` (12px) o `xs` (4px).
- Badge `count` y `dot` neutros. El número es texto. La variante `destructive` no cambia.
- Escena circle con fixtures filled, empty, loading y error. Nombres abajo. Sin fotos.
- Radios sm…4xl en rem fijos, equivalentes al `calc` anterior.

## spec_defect

Ninguno.

## candidates_detected

Ninguno. `layout="circle"` es una prop del avatar-group que ya estaba en el catálogo. No es una pieza nueva.

## commands

Se miden sobre el HEAD del PR después de este commit, sin un commit posterior. Los logs quedan en el Agent Store.

- `pnpm test`
- `pnpm exec playwright test`
- `pnpm build`
- `npx impeccable@4.8.0 detect --json registry components app` antes y después
