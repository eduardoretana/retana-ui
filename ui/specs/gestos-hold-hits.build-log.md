# Build log · gestos-hold-hits

## needs

- `hold-to-confirm` `rewind()` usa `duration.fast` (0.16) y `ease.exit`. El fill mientras se sostiene sigue lineal.
- El `::before` de 2.75rem (44 px) está en el hold, el grabber, el cerrar y el asa. El dibujo no crece: el hold sigue en `min-h-9`, el grabber en `h-5`, el cerrar en `size-7`, el asa en `size-10`.
- Hover del hold y del pill del grabber dentro de `(hover: hover) and (pointer: fine)`.
- `will-change-transform` sale de la hoja. No se vio un salto de 1 px que lo justificara.
- Volver al mismo detent usa un spring escrito en la llamada: `visualDuration` 0.2, `bounce` 0. El preset `smooth` no se edita.
- `rule-exception: RUI-ANIM-PERF-005` en `bottom-sheet.tsx` para `--sheet-max` y `--sheet-extension`. No cambian en cada move. El lint las marca porque el archivo tiene handlers de puntero.
- Las escenas del asa no se duplican aquí. Están en el PR de seguimiento 1:1.

## spec_defect

Ninguno.

## candidates_detected

Ninguno.

## commands

```
node anim_perf_lint.mjs <repo> --files registry/ui/hold-to-confirm.tsx,registry/ui/bottom-sheet.tsx,registry/ui/slide-to-confirm.tsx,app/examples/hold-to-confirm/scenes.tsx,app/examples/bottom-sheet/scenes.tsx --json
```

Salida después de la cita (status pass, 0 flags; el 005 queda waived):

```json
{
  "tool": "anim-perf-lint",
  "version": "0.1.0",
  "status": "pass",
  "checked": 5,
  "failed": 0,
  "results": [
    {
      "rule_id": "RUI-ANIM-PERF-005",
      "severity": "minor",
      "file": "registry/ui/bottom-sheet.tsx",
      "line": 443,
      "measured": "variable CSS escrita en un archivo con handler por frame: recalcula estilos de todos los hijos; escribe transform en el elemento",
      "status": "waived",
      "waiver": "--sheet-max y --sheet-extension salen de los detents, no de cada pointermove"
    }
  ]
}
```

Crédito: Emil Kowalski, `emilkowalski/skills@715c1807e08c497cfd1dc4feb450a2a3300ef2a9` `skills/gestures` (MIT).
