# Build log · gestos-seguimiento

## needs

- `slide-to-confirm`: el move escribe el motion value. `smoothness` solo entra en el spring del release, que recibe `velocity`. `resistance` solo pasado el final de la pista.
- `view-timeline`: la barra escribe `translate3d` en cada move y confirma la fecha en `pointerup`. No hay spring: la unidad de fecha es donde el dedo la deja. `touch-pan-y`.
- IDEA (3) permanece en LITE. No es un flujo nuevo.

## spec_defect

Ninguno.

## candidates_detected

Ninguno.

## commands

```
node anim_perf_lint.mjs <repo> --files registry/ui/slide-to-confirm.tsx,registry/ui/view-timeline.tsx,app/examples/slide-to-confirm/scenes.tsx,app/examples/view-timeline/scenes.tsx --json
```

```json
{
  "tool": "anim-perf-lint",
  "version": "0.1.0",
  "status": "pass",
  "checked": 4,
  "failed": 0,
  "results": []
}
```

Crédito: Emil Kowalski, `emilkowalski/skills@715c1807e08c497cfd1dc4feb450a2a3300ef2a9` `skills/gestures` (MIT).
