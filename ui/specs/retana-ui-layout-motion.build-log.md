---
artifact_id: retana-ui-layout-motion.build-log
owner: builder
spec_version: 1.0.0
head: c4d84045b73a92112860d5d019f75c09f342fc0b
profile: STANDARD
spec_id: retana-ui-layout-motion
ui_system: "4.0.0"
---

# Build log — retana-ui-layout-motion

## needs

- `number-roll` es candidato `new`. Solo `transform` y `opacity`. Separa entero y fracción. `hierarchy` es opcional.
- `stagger-list` es candidato `new`. El último retraso no pasa de 0.4 s.
- `animated-counter` compone `number-roll` y conserva la API. El archivo del rodillo se vende junto al contador y a quien ya lo incluye.
- No hay `rule-exception`. No hay `transition-all` ni rebote en esas tres piezas.
- La fracción usa `text-[0.65em]` del entero. No hay un token de tipo para «la misma cifra, más chica».
- El aviso de error de las escenas usa `text-foreground`. `text-destructive` del tema de demo no llega a 4.5:1 sobre blanco.
- #55 y #56 no se editan.

## spec_defect

Ninguno. La spec no se ajustó para hacer pasar el código.

## candidates_detected

- `number-roll`: `new`.
- `stagger-list`: `new`.
- `animated-counter`: ya publicado. Este ciclo solo cambia la implementación del valor.

## commands

Medidos en `c4d84045b73a92112860d5d019f75c09f342fc0b`, antes de este paquete de insumos:

- `pnpm test`: 235 archivos, 678 pruebas, exit 0.
- `pnpm typecheck:strict-host`: exit 0. Queda un error previo en `components/ui/dropdown-menu.tsx`, fuera de `registry/`.
- `node scripts/anim-perf-lint.mjs` sobre number-roll, stagger-list y animated-counter: exit 0.
- `pnpm build`: exit 0 en el commit anterior al ajuste de contraste. El ajuste posterior no toca el registry.

La suite, Playwright y `renders.yaml` del HEAD de este PR no se commitean. El gate los lee por `--suite-log` y `--renders-log`. Quedan en el Agent Store y declaran el sha de ese HEAD.
