# Build log — ci-checks-library

## needs

- Barra de progreso sin `transition-all`. El primitivo `Progress` no sirve para AC-11. `rule-exception:` no hace falta: no se usa el primitivo.
- Motion entra solo con opacidad y traslación. `registry/lib/motion.ts` se lista en los archivos del ítem, igual que el resto del catálogo que ya lo usa.
- Segunda abstracción: el escenario `ci-checks-story` es el segundo uso de las cuatro piezas. KISS: no se extrae un hook de animación compartido; cada pieza lleva el suyo para poder instalarse sola.

## spec_defect

Ninguno al abrir el build.

## candidates_detected

- `pr-create-card` (new)
- `checks-panel` (new)
- `agent-fix-timeline` (new)
- `merge-button` (new)
- `ci-checks-story` (new, block)

## commands

- `pnpm test`: 238 archivos, 687 pruebas, en verde. De esas, 27 cubren esta familia.
- `pnpm typecheck:strict-host`: registry/ compila. El aviso de `dropdown-menu.tsx` es un primitivo del host, no de esta familia.
- `pnpm exec eslint` sobre los archivos nuevos: sin hallazgos.
- `pnpm registry:build` y `pnpm readme:catalog`: en verde.
- `pnpm exec tsc --noEmit` en este checkout, sin `next typegen`, reporta `LayoutProps` en `app/layout.tsx`. Es previo a esta familia (el layout ya usaba ese tipo). CI no corre ese tsc; corre `typecheck:strict-host`.
- No se commitea la salida cruda.
