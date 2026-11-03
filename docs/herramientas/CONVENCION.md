# Convención de Herramientas

Decisión del UI Lead, aplicada en este PR. Es la más simple que cabe en el esquema actual de shadcn.

## Qué es una herramienta

Una herramienta es lógica que corre de verdad, más las pantallas que la operan, más la documentación para instalarla en otro proyecto.

| Pieza | Dónde | Tipo en `registry.json` |
| --- | --- | --- |
| Núcleo | `registry/lib/<slug>/` | `registry:lib` |
| Pantalla | `registry/ui/<slug>.tsx` o `registry/blocks/` | `registry:component` o `registry:block` |

No hay un tipo `tool` en `registry.json`. Ese archivo sigue el esquema de shadcn.

## Índice

`retana-ui.json` (este repo, no el hub) tiene:

- `components[]`: cada pieza UI conserva su slug y su perfil (`STANDARD` en las cuatro de guardas).
- `tools[]`: una entrada por herramienta.

```json
{
  "slug": "guard-rules",
  "kind": "tool",
  "core": "guard-rules",
  "ui": ["guard-rule-builder", "guard-rule-simulator", "guard-approval-queue", "guard-audit-log"],
  "docs": "docs/herramientas/README.md"
}
```

Para sumar otra herramienta (por ejemplo CI Checks Live) se agrega un objeto a `tools[]` y sus piezas a `components[]`. No se reescriben las entradas de las demás. El núcleo ajeno también es `registry:lib` y declara `registryDependencies` hacia los libs que use, por ejemplo `@retana/guard-rules` si consume `ApprovalGate`.

## Superficie UI

El núcleo queda fuera del UI Surface Impact solo porque:

1. `scripts/tool-core-purity.ts` corre desde `validateRegistryTree` (lo usa `pnpm registry:build`, y CI exige ese build). Falla si un archivo del core declarado en `tools[]` importa `react`, `react-dom`, `next`, CSS, algo de `components/`, o llama `fetch` / `XMLHttpRequest` / `WebSocket`. `__tests__/guard-rules.test.ts` prueba que ese lint falla con un fixture.
2. Los tests del motor usan la cuenta `marca-sintetica`, el teléfono +52 55 0000 0000 y el repositorio `ejemplo/demo`.

Las cuatro pantallas son perfil STANDARD.

El copy de decisión (bloqueo, aprobación, dato faltante) vive en el núcleo en es-MX y EN (`guardMessage`, `explain`, `decisionLabel`). Las pantallas lo muestran. No lo reescriben.

## RUI-TOOLS-001

Pendiente en el hub: todavía no existe la regla. Este PR la cumple y la cita en la Spec.

Núcleo TS puro, determinista, sin I/O de red, API pública tipada. Las piezas UI importan solo esa API (más los primitivos del host). La página `/herramientas` es el demo funcional con datos ficticios.

## Dependencias entre items

`scripts/installed-imports.ts` trata `@retana/<lib>` como proveedor de `@/lib/<lib>` y de sus subrutas. Así una pieza UI puede depender del núcleo sin copiarlo. Vale para cualquier lib, no solo para guardas.

## Qué no se cambió y le toca al UI Lead o al hub

- No se agregó `registry/tools` como carpeta de sources. Haría falta ampliar `SOURCE_ROOTS` en `scripts/validate-registry.ts` y el manifest del hub. Alternativa anotada y no elegida: esa carpeta, si más adelante quieren separar herramientas de `lib`.
- No se inventó un tipo de item. Haría falta cambiar el esquema de shadcn.
- No se tocó el hub ni `ui-system` upstream. La cita de RUI-TOOLS-001 queda marcada pendiente.
- No se añadió Zod. No está en el repo. Un parser propio mantiene el núcleo sin dependencias. Si el UI Lead quiere JSON Schema generado, la alternativa es declarar `zod` en `dependencies` del item `guard-rules`.

## Tema

Las piezas heredan el tema del host. Solo clases semánticas. Si `shadcn add` pregunta si sobrescribe un primitivo que el host ya tiene, la respuesta es no.
