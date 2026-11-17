# Plan de pruebas · agenda-resources

Comando rojo, antes del build: `pnpm exec vitest run __tests__/agenda-resources.test.tsx`.

Firmas en `ui-tests/expected-red.yaml` (14 fallos, 0 verdes).

Comando verde, después del build:

- `pnpm exec vitest run __tests__/agenda-resources.test.tsx __tests__/agenda.test.tsx`
- `pnpm test`
- `pnpm exec tsc --noEmit --pretty false`
- `pnpm typecheck:strict-host`
- `pnpm registry:build`
- `pnpm build`

La regresión sin `resources` vive en la suite anterior de la agenda y en AC-1.
