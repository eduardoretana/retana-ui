# L-KULESZO-workflow-builder

- Fuente: post de Adrian Kuleszo, «Workflow builder», marca i-Planner. https://x.com/adriankuleszo/status/2117685778264572393
- Licencia de la referencia: sin licencia, solo idea. Clean-room. No se copió código, copy, colores ni assets.
- ui-system: snapshot hub-vibecoding@419ad6481648c693d61f8e5ebfb8b8e80d8d8ab7, VERSION 4.0.0.

## Motor

Se evaluó `@xyflow/react` (MIT, licencia leída en github.com/xyflow/xyflow el 2026-11-04) y se descartó. Su CSS trae colores propios y su estado no deja el grafo en el anfitrión. El canvas es propio: SVG, tokens semánticos, teclado entre puertos y partículas apagadas con menos movimiento. No se copió código de xyflow.

Otras licencias leídas el mismo día, sin copiar código: Langflow MIT, Rivet MIT, Temporal UI MIT, Node-RED Apache-2.0, Flowise Apache-2.0 fuera de enterprise, Activepieces MIT fuera de ee. n8n es Sustainable Use (solo idea). Dify, Windmill (AGPL) e Inngest (SSPL) y Pipedream (source-available) son solo idea. Vellum, OpenAI Agent Builder, Gumloop y Retool no se citan como código público verificado.

## Variantes

Nodo elegido: tarjeta con título, subtítulo, estado en texto y puertos en el borde. Se descartaron la pastilla sin puertos y el riel de icono.

Menú elegido: lista por Herramientas, Lógica y Acción junto al cursor, con tooltip. Se descartaron la paleta a pantalla completa y la lista plana.

## Comparación ui-system 4.0.0

| Regla | Veredicto |
| --- | --- |
| RUI-TOKEN-001 | Cumple. Sin color literal. Retícula con `var(--border)`. |
| RUI-RADIUS-001 | Cumple. `rounded-md/lg/xl/full`. |
| RUI-ELEV-001 | Cumple. `shadow-sm/md/lg`. |
| RUI-TYPE-001 | Cumple. Escala `text-*` de Tailwind. |
| RUI-HEIGHT-001 | Cumple. Controles del anfitrión. |
| RUI-DARK-001 | No aplica. No se envía tema. |
| RUI-CONTRAST-001 | Cumple en tokens semánticos. |
| UIS-LAYOUT-001 | El layout de 390 usa panel inferior. |
| UIS-LAYOUT-002 | La página no desplaza al montar. |
| UIS-COMP-ISP-001 | Excepción. La API controlada del anfitrión pasa de 10 props. |
| UIS-COMP-OCP-001 | Cumple. Pieza nueva. |
| UIS-COMP-DIP-001 | Cumple. Sin `@supabase/*`. |
| RUI-CONTRACT-001 | Familia nueva: `contracts/workflow.contract.tsx`. |
| RUI-ANIM-PERF-001…007 | Transiciones solo transform y opacity. El arrastre escribe transform, no setState por frame. |
| RUI-TOUCH-001 | Aplicada (propuesta del PR 68, no está en este snapshot). Tap abre. En touch el arrastre espera 360 ms. |

## Reglas propuestas (no van al hub)

- `RUI-GRAPH-A11Y-001`: un grafo se recorre y se conecta por teclado, con el resultado en aria-live.
- `RUI-FLOW-PARTICLE-001`: la partícula es decorativa, aria-hidden, y no se monta con menos movimiento.

## cost-waterfall

No hay motor de precios ni waterfall. Los eventos `step.started`, `step.completed` y `step.failed` copian tokens y costo reportados. Ver `docs/workflow-builder-roadmap.md`.
