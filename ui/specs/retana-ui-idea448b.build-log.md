---
artifact_id: retana-ui-idea448b.build-log
owner: builder
spec_version: 1.0.0
head: 0235da2ac2a16970fee70848911a51737cf7a4e8
profile: LITE
---

# Build log — retana-ui-idea448b

La suite y los renders no se commitean. El gate los toma por `--suite-log` y `--renders-log`, fuera del árbol, y esos archivos declaran el HEAD del PR.

## needs

- Los 11 controles usan `text-base md:text-sm`. No hay `rule-exception`.
- `html` declara `-webkit-tap-highlight-color: transparent`. El anillo `focus-visible` de los inputs que ya lo tenían se queda.
- `viewportFit: "cover"` sin `maximumScale`.
- Las curvas con overshoot pasan a `cubic-bezier(0.22, 1, 0.36, 1)` bajo `motion-safe`. No hay `transition-all`.
- La transición de `d` en el clip de eclipse, expand y simple ya estaba. No se reescribió.

## spec_defect

Ninguno. La spec se escribió sobre el código ya medido en este ciclo LITE. No se ajustó la spec para hacer pasar un test rojo.

## candidates_detected

Ninguno. No hay pieza nueva ni extensión de API.

## commands

Medidos otra vez sobre el HEAD de este PR, después de este commit, sin un commit posterior. Los logs quedan en el Agent Store, no en el repo.

- `pnpm test` y `pnpm exec playwright test`: el log declara ese HEAD.
- `renders.yaml`: cada captura con sha256 y viewport 390x844, y el mismo HEAD.
- `npx impeccable@4.8.0 detect --json registry components app`: la salida cruda de CPL y la de ese HEAD también van al Agent Store.
- `pnpm lint`: 0 errores. 7 warnings previos, fuera de este diff.
- `pnpm exec tsc --noEmit`: exit 0.
- `pnpm typecheck:strict-host`: exit 0.
- `pnpm build`: exit 0.

ui-system de este ciclo: **4.0.0**. `anim_perf_lint` no está en retana-ui; no se corrió.
