# Herramientas

Una herramienta de Retana UI es una pieza que hace un trabajo, no solo una pantalla. El núcleo es TypeScript puro. Las pantallas reciben datos por props y llaman esa API. No importan un backend.

La convención está en [CONVENCION.md](./CONVENCION.md). La idea y los criterios están en [IDEA.md](./IDEA.md).

## Instalar

El catálogo no trae tema. En el host, si la CLI pregunta si debe sobrescribir `button`, `input` u otro primitivo que ya existe, la respuesta es **no**.

Núcleo:

```bash
npx shadcn@latest add @retana/guard-rules
```

Pantallas (cada una declara `@retana/guard-rules` en `registryDependencies`, así que el núcleo se instala con ellas):

```bash
npx shadcn@latest add @retana/guard-rule-builder
npx shadcn@latest add @retana/guard-rule-simulator
npx shadcn@latest add @retana/guard-approval-queue
npx shadcn@latest add @retana/guard-audit-log
```

En este repo el demo está en `/herramientas` y en `/examples/guard-rules`.

## Primera herramienta

Motor de reglas de guardas.

Cuando (`action.kind`) → condiciones AND/OR anidadas → entonces:

| Decisión | Efecto |
| --- | --- |
| `block` | La acción no sigue. |
| `handoff_to_human` | La conversación pasa a una persona. |
| `require_approval` | Queda un ticket en `ApprovalGate` hasta que alguien aprueba, rechaza o vence. |
| `allow` | Puede seguir, si nada más fuerte disparó y no faltan datos. |
| `log` | Siempre se anota. No gana la decisión. |

Precedencia: `block > handoff_to_human > require_approval > allow`.

Si falta un dato que una condición necesita, el resultado no es `allow`. Cae en `require_approval` con `failClosed: true`. Un block o un handoff que sí disparó sigue ganando. `exists` y `missing` no son “dato desconocido”: solo miran si la ruta está.

El preset Mejoravit WhatsApp y el ejemplo `git.merge` usan datos inventados.

## Mapa

- [Integración y ApprovalGate](./integracion.md)
- [API](./api.md)
- [Esquema](./esquema.md)
- [Ejemplos](./ejemplos.md)
- [Limitaciones](./limitaciones.md)
- [Modelo de amenazas](./modelo-de-amenazas.md)

## Fuente

La idea de un constructor Cuando / Si / Entonces se vio en un post público: <https://x.com/heyanantj/status/2116917836086186436>. Idea only, sin licencia. El código, los textos y los datos de este repo son propios. Ver `NOTICE`.
