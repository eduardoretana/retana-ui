# Plan de pruebas — guard-rules

Perfil STANDARD para las cuatro pantallas. El núcleo se prueba en Vitest, no como superficie.

| Área | Archivo |
| --- | --- |
| Precedencia, datos faltantes, TTL, cuentas, bitácora, versiones, roles, preset, pureza | `__tests__/guard-rules.test.ts` |
| Estados, teclado, es/EN | `__tests__/guard-rules-ui.test.tsx` |
| Snippets de la docs, incluido `git.merge` | `__tests__/guard-rules-snippets.test.ts` |
| PLP y stress | rutas `app/examples/guard-*/` |
| Lint de núcleo en CI | `pnpm registry:build` llama `lintDeclaredToolCores` |

`ui-tests/expected-red.yaml` guarda la firma con la que estas pruebas estaban rojas antes de existir el núcleo.
