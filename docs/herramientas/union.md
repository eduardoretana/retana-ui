# Punto de unión — sección Herramientas

El motor de guardas ya está en el PR borrador #65 (`cursor/herramientas-guard-rules-ea36`, paquete `@retana/guard-rules`). Este PR no se apila sobre esa rama. El merge de los dos es unir `tools[]` y conservar un solo índice.

## Contrato que ya decidió el UI Lead

`retana-ui.json`:

```json
{ "slug": "ci-checks-live", "kind": "tool", "core": "ci-checks-core", "ui": ["ci-checks-live"], "docs": "docs/herramientas/ci-checks-live.md" }
```

No existe el tipo de registry `tool`. El núcleo es `registry:lib`. La interfaz es `registry:block` con `registryDependencies` al núcleo (los archivos del núcleo van en el ítem para que la instalación resuelva `@/lib/ci-checks`).

## Dónde enganchar

| Pieza | Ruta | Si el otro PR la crea |
|---|---|---|
| Manifiesto | `retana-ui.json` → `tools[]` | Conservar el arreglo y añadir la entrada. No renombrar `kind`. |
| Regla | `__tests__/tool-core-purity.test.ts` | Lee `tools[].core` y falla si ese ítem importa React, react-dom, next, CSS o `components/`. |
| Índice | `app/herramientas/page.tsx` | Lee el manifiesto. Un solo enlace en `app/catalog/site-header.tsx` hacia `/herramientas`. |
| Aprobación | `alwaysAskApproval` en `registry/lib/ci-checks/approval.ts` | Sigue siendo el adaptador por defecto. El puerto del #65 se llama `ApprovalGate` y no es el mismo tipo: tiene `create`, `get`, `list`, `decide` y `consume`. El adaptador que los une está en `docs/herramientas/snippets/guard-merge-gate.ts`. La acción usa `kind: "git.merge"`. |
| Agente que arregla | `AgentFixPort` | Solo publica y escucha pasos. No hay agente en este repo. |

## Qué no tocar al mezclar

No hace falta mover el núcleo a otro paquete. Si el otro PR ya tiene `retana-ui.json`, el conflicto cabe en el arreglo `tools`. Si ya tiene la página índice, dejar una sola lista generada desde el manifiesto.
