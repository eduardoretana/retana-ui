# Build log — ci-checks-live

## needs

- El núcleo no puede importar el adaptador. Si lo hiciera, la pureza y el límite del token se mezclarían.
- `ApprovalGate` es el segundo uso del puerto de aprobación (la pieza `merge-button` pide confirmación en la UI; el núcleo pide el gate antes del `PUT`).

## spec_defect

Ninguno.

## candidates_detected

- `ci-checks-core` (new, lib)
- `ci-checks-github` (new, lib)
- `ci-checks-live` (new, block)
- `use-ci-checks` (hook, archivo del bloque)

## commands

- `pnpm test`: 717 pruebas, en verde.
- `pnpm typecheck:strict-host`: `registry/` compila. El aviso de `dropdown-menu.tsx` es del primitivo del host.
- `pnpm exec next build`: compiló y pasó el TypeScript del proyecto, 1248 páginas.
- `pnpm exec tsc --noEmit`: salida 0 después de `next build`.
- `pnpm exec next build`: TypeScript en verde, 1248 páginas.
- `pnpm exec playwright test`: 33 pruebas en verde, incluidas las capturas y `/docs` como antes.
- El job `e2e` de `.github/workflows/ci.yml` instala Chromium y corre `pnpm test:e2e` tras el build.
- No se commitea la salida cruda ni las capturas.
