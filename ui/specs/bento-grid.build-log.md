# Build log — bento-grid

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
