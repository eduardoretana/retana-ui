# Punto de unión — sección Herramientas

Otro agente está creando la sección Herramientas y el motor de reglas de guardas. En `CPL` todavía no estaban. Esta rama deja el mínimo para que el merge sea unir listas, no reescribir.

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
| Aprobación | `ApprovalGate` en `registry/lib/ci-checks/approval.ts` | El motor real implementa `review()`. Mientras no esté, `alwaysAskApproval()` no concede la fusión sin `confirmed` y `grantedBy`. La regla prevista es `require_approval`. |
| Agente que arregla | `AgentFixPort` | Solo publica y escucha pasos. No hay agente en este repo. |

## Qué no tocar al mezclar

No hace falta mover el núcleo a otro paquete. Si el otro PR ya tiene `retana-ui.json`, el conflicto cabe en el arreglo `tools`. Si ya tiene la página índice, dejar una sola lista generada desde el manifiesto.
