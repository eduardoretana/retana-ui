---
artifact_id: retana-ui-idea448b.build-log
owner: builder
spec_version: 1.0.0
head: 0235da2ac2a16970fee70848911a51737cf7a4e8
profile: LITE
---

# Build log — retana-ui-idea448b

El sha de abajo es el commit de código que se midió. Los commits que solo agregan este paquete no tocan `registry/`, `app/` ni `tests/`.

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

Corridos en `0235da2ac2a16970fee70848911a51737cf7a4e8`. La salida cruda está en el commit de evidencia:

- `pnpm test`: exit 0. 232 archivos, 664 pruebas. Log: `evidence/IDEA-448/pnpm-test.log`.
- `pnpm exec playwright test`: exit 0. 3 pruebas WebKit 390×844. Log: `evidence/IDEA-448/playwright.log`.
- `npx impeccable@4.8.0 detect --json registry components app`: exit 2 en CPL `6671cfac72f736739d2d3dd2740cc5f13416acb3` (16 hallazgos, 11 bounce-easing) y exit 2 en el sha evaluado (5 hallazgos, 0 bounce-easing). JSON crudo: `evidence/IDEA-448/impeccable-detect-before.json` y `evidence/IDEA-448/impeccable-detect-after.json`.
- `pnpm lint`: 0 errores. 7 warnings previos, fuera de este diff.
- `pnpm exec tsc --noEmit`: exit 0.
- `pnpm typecheck:strict-host`: exit 0.
- `pnpm build`: exit 0.

ui-system de este ciclo: **4.0.0**. `anim_perf_lint` no está en retana-ui; no se corrió.
