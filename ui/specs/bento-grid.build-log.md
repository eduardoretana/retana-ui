# Build log — bento-grid

## presets 1.3.0

- `size` en la celda: sm 1×1, wide 2×1, tall 1×2, lg 2×2. Sin `size`, el span anterior no cambia.
- Desde 30rem la pista usa `auto-rows-[16rem]` y la tarjeta (`h-full` / `self-stretch`) llena la celda. La alta queda en dos filas. Bajo 30rem el alto sigue al contenido.
- Con `size`, la copia llega a `65ch`. Sin `size` se queda en `max-w-[17.5rem]`.
- La celda es `@container/cell`. Desde 30rem del muro también es `container-type: size`, para poder leer el alto. Bajo 30rem la celda crece con el texto: a 390 px un alto fijo de 10rem recortaba la llamada.
- La tarjeta no usa quiebres del viewport. wide pone el dibujo al lado; tall y lg lo dejan crecer; en compacto el dibujo queda en `max-h-16`. Bajo 10rem se esconde y el texto sigue.
- No hay `grid-auto-flow: dense` ni `order-*`. `media-first` y `copy-first` siguen mandando el DOM. El cambio de preset no anima.
- `magnetic-bento` no recibe `size`. `__tests__/magnetic-bento.test.tsx` no se editó.

## needs

- El repo ya usaba container queries (`@container/bento`, `@container/mb`). Este ciclo nombra la celda `cell`. El alto usa una query arbitraria porque las variantes `@min-*` de Tailwind solo miran el ancho.

## spec_defect

Ninguno. AC-1 a AC-20 no se reescribieron.

## commands

En este ciclo, antes del PR:

- `pnpm exec tsc --noEmit`: sin errores.
- `pnpm exec eslint` sobre la rejilla, la tarjeta, las tres suites y los ejemplos: sin avisos.
- `pnpm registry:build`: válido.
- `pnpm test`: 235 archivos, 690 pruebas en verde.
- `pnpm build`: Next compiló.

Las capturas de Playwright quedan fuera del repo, en `/opt/cursor/artifacts/bento-size-presets/`.



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
