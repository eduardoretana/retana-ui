# Build log — guard-rules

## needs

- Puerto `ApprovalGate` estable para que otra herramienta evalúe `kind: "git.merge"` y cree o consulte una aprobación.
- Lint genérico de núcleos (`scripts/tool-core-purity.ts`) leyendo `retana-ui.json`, no un path fijo a WhatsApp.
- Resolución de `@/lib/<nombre>` cuando `registryDependencies` trae `@retana/<nombre>`.

## spec_defect

Ninguno registrado en este ciclo.

## candidates_detected

- `guard-rule-builder`, `guard-rule-simulator`, `guard-approval-queue`, `guard-audit-log` son candidatos nuevos. El núcleo `guard-rules` no es superficie UI.
- No se copió `empty-state`. Se reutiliza.
- El select nativo del constructor no duplica el primitivo `Select`: un `Select` de portal por cada nodo del árbol no mantiene un solo tab stop. Queda anotado como hueco de catálogo, no como fork.

## commands

- `pnpm test` (guard-rules, UI, snippets, y la suite del repo)
- `pnpm registry:build`
- `pnpm build`

## stress

Se probaron, en las rutas `/examples/<pieza>/stress`, textos de 60 caracteres sin espacios, 320 px, vacío, carga, error, diez filas en cola y bitácora, y un ruleset de 20 reglas en el simulador. El dato faltante del simulador no muestra allow.

## motion

Las cuatro piezas no declaran `transition-all` ni animan layout. Solo tokens del tema.

## evidence

Los logs de evidencia con head no se commitean. Se generan aparte.
