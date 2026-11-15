# build-log — context-window-eventos · spec 1.0.0

Head de código: `db19a518cddc7b1461f2e47c9470a7de4d93088e`. Base: CPL `33438d12520bbf9fe18ebc87f29df2a3122d02b6` (merge normal, sin rebase).

## needs

- Ninguna pieza nueva fuera del catálogo. Composición sobre `@retana@33438d12`.
- Sin `rule-exception:`.

## spec_defect

- Ninguno abierto. La Spec la escribió el builder para el despacho con los AC que ya miden las pruebas; el UI Lead la revisa (SKILL §4).

## candidates_detected

- Ninguno.

## commands

- `pnpm install --frozen-lockfile` (pnpm 10.33.3, Node del CI)
- `pnpm test`
- `pnpm typecheck:strict-host`
- `pnpm registry:build` y `git status --porcelain public/r lib/generated` vacío
- `next build && next start` en loopback para las capturas (arnés `21db9481b331`)

Logs y sha256 en la evidencia del box (`/workspace/retana-ui-entregas/pr-sweep/75/`), fuera del commit.
