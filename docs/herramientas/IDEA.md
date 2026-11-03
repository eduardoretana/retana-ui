# Idea — Herramientas y motor de guardas

Estado: plan de este PR. El código que lo sigue está en el mismo cambio.

## Outcome

Un agente que atiende WhatsApp en un CRM puede preguntar, antes de actuar, si la acción se permite, se bloquea, se pasa a una persona o espera una aprobación que vence. La misma pregunta sirve para otra acción, por ejemplo `kind: "git.merge"`, a través del puerto `ApprovalGate`.

## Usuario

Quien integra el agente (desarrollador del host) y quien opera una cuenta: viewer lee, editor publica una versión del ruleset, approver decide la cola. Los datos de la demo son ficticios (marca sintética, +52 55 0000 0000).

## Alcance

- Núcleo TypeScript puro, sin React, sin red, sin tema.
- Evaluador determinista con reloj inyectado. Precedencia `block > handoff_to_human > require_approval > allow`. `log` siempre se acumula.
- Si falta un dato que una condición necesita, la decisión no es `allow`: cae en `require_approval` con `failClosed: true`, salvo que un block o un handoff ya hayan ganado.
- Aprobaciones `pending | approved | rejected | expired`, TTL, actor y hora. No se aprueba algo vencido. Un consumo por ticket.
- Bitácora append-only en memoria.
- Rulesets por cuenta, versiones inmutables, una activa, roles viewer / editor / approver.
- Cuatro piezas UI: constructor, simulador, cola, bitácora. PLP. es-MX y EN.
- Preset Mejoravit WhatsApp, sintético.
- Docs de instalación, integración, API, esquema, ejemplos, límites y amenazas.
- Infraestructura genérica: `registry:lib`, `tools[]` en `retana-ui.json`, lint de imports del núcleo. Otra herramienta solo agrega una entrada.

## Fuera de alcance

Backend real, Supabase, webhooks de Vambe o n8n, secretos, producción, merge de este PR, cambios al hub, tipo `tool` dentro de `registry.json`.

## Riesgos

- Un matcher de texto se evade con unicode. Por eso el dato estructurado manda y el texto es secundario.
- Si el host omite campos, todo cae en aprobación. Está documentado a propósito.
- Dos herramientas que editen `retana-ui.json` a la vez pueden chocar. La convención es agregar un objeto, no reescribir el arreglo.

## Criterios de aceptación

1. El evaluador cubre las combinaciones de precedencia y los casos de dato faltante.
2. El reloj falso vence una aprobación y esa aprobación no se puede decidir.
3. Una cuenta no lee ni escribe la otra.
4. La bitácora no se puede mutar ni borrar.
5. Una versión vieja del ruleset no cambia cuando se publica la siguiente.
6. Viewer no edita. Editor no aprueba. Approver no publica.
7. `evaluateRules` y `ApprovalGate` aceptan `kind: "git.merge"` sin código de WhatsApp.
8. Las cuatro piezas muestran lleno, vacío, carga y error, en es-MX y EN, y se usan con teclado.
9. `pnpm test` y `pnpm build` quedan en verde.
