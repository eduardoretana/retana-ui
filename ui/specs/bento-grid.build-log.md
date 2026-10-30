# Build log — bento-grid

## layout 1.1.0

- Copia acotada a `max-w-[17.5rem]`. Ilustración sin ese tope.
- Un solo radio: el de `Card`. La celda magnética pierde `border` y separa con `shadow-sm` y el gap ya publicado.
- `will-change` solo en hover. Entrada de celdas con `opacity` y `translateY`, tope 0.4 s, duración 0 con `MotionConfig reducedMotion=always`.
- `stagger-list` no se importa. El tope está en `bentoStaggerDelay`.
- Error: `text-destructive` se queda (4.91:1) con `role=alert` y `font-medium`. El CTA magnético visible pasa a `text-foreground` porque `chart-1` como texto mide 1.48:1.
- API pública de `magnetic-bento` sin cambio de props. El ease publicado del indicador no se reescribe.

## needs

- `magnetic-bento` declara `registryDependencies: ["bento-grid"]` e importa el preset `magnetic`.
- El preset magnético conserva los quiebres publicados (36rem y 56rem). La base nueva usa 30rem y 56rem para que 390 px siga en una columna.
- No hay `rule-exception`. Hover: `transition-transform` y `transition-[transform,opacity]`. `will-change-transform` solo en la tarjeta y en la ilustración.

## spec_defect

Ninguno. La spec no se ajustó para hacer pasar el código.

## candidates_detected

- `bento-grid`: candidato `new`.
- `bento-feature-card`: candidato `new`. Compone `card` y `skeleton` del host.
- `magnetic-bento`: `extension` por composición. La API pública no cambia.

## commands

Resultado en este head, antes del PR:

- `pnpm exec vitest run` de las tres suites nuevas más `magnetic-bento`: 24 pruebas en verde.
- `pnpm test`: 234 archivos, 674 pruebas en verde.
- `pnpm exec tsc --noEmit`: sin errores.
- `pnpm lint`: 0 errores. 7 warnings ya estaban en otros archivos.
- `pnpm registry:build`: válido. Reescribió imports de instalación.
- `pnpm readme:catalog`: 424 ítems.
- `pnpm build`: Next compiló, incluidas `/examples/bento-grid`, `/examples/bento-feature-card` y sus estrés.

En el navegador headless, a viewport 390 px la pista midió una sola columna (324 px de contenedor). En desktop midió cuatro columnas de 267.5 px y `gap` 16 px. El enlace enfocado tenía anillo. `(hover: hover)` es falso en ese Chrome, así que el GIF aplica a mano las mismas declaraciones (`translate: 0 -2px`, `scale: 1.02`, `opacity: 1`) que las utilidades de hover.

## layout 1.1.0 commands

En el árbol de este cambio, antes del commit que lo cierra:

- `pnpm exec tsc --noEmit`: sin errores.
- `pnpm exec eslint` sobre los tres componentes y sus tres suites: sin avisos.
- `pnpm registry:build`: válido.
- `pnpm test`: 234 archivos, 677 pruebas en verde.
- `pnpm exec vitest run` de bento-grid, bento-feature-card, bento-magnetic-contract y magnetic-bento: 27 pruebas en verde.

El log crudo de la suite, Playwright a 390 px e `impeccable detect` se generan sobre el HEAD final, fuera del repo.
