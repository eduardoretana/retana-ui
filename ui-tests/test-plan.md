# Plan de pruebas — ci-checks-library

Perfil STANDARD. Las pruebas de componente viven en `__tests__/`. El validador del registry cubre PLP.

| Id | Prueba | Firma esperada en rojo (antes del código) |
|---|---|---|
| T-A1 | `__tests__/pr-create-card.test.tsx` | No resuelve `@/registry/ui/pr-create-card` |
| T-A2 | `__tests__/checks-panel.test.tsx` | No resuelve `@/registry/ui/checks-panel` |
| T-A3 | `__tests__/agent-fix-timeline.test.tsx` | No resuelve `@/registry/ui/agent-fix-timeline` |
| T-A4 | `__tests__/merge-button.test.tsx` | No resuelve `@/registry/ui/merge-button` |
| T-A5 | `__tests__/ci-checks-story.test.tsx` | No resuelve `@/registry/blocks/ci-checks-story` |
| T-A6 | `__tests__/ci-checks-labels.test.ts` | No resuelve los diccionarios |
| T-A7 | `__tests__/ci-checks-family-source.test.ts` | Falla porque los archivos de `registry/` aún no existen |

La firma real, tomada de la corrida en rojo, queda en `ui-tests/expected-red.yaml`.
`cycle_state` pasa a `AUDITORIA` solo cuando estas pruebas están en verde. Este archivo no se reescribe para hacerlas pasar: si una firma de rojo no coincide con lo corrido, se anota en el yaml.
