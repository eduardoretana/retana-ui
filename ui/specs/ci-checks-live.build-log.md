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

- `pnpm test`: 242 archivos, 714 pruebas, en verde.
- `pnpm typecheck:strict-host`: `registry/` compila. El aviso de `dropdown-menu.tsx` es del primitivo del host.
- `pnpm exec next build`: compiló y pasó el TypeScript del proyecto, 1248 páginas.
- `pnpm exec playwright test`: 29 pruebas en verde, con Chrome del sistema. No forma parte de `pnpm test` para no exigir navegador en CI.
- No se commitea la salida cruda ni las capturas.
