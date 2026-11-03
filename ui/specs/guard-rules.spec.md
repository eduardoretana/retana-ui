---
spec_id: guard-rules
version: 0.1.0
profile: STANDARD
spec_changelog:
  - origin: initial
    note: Primera herramienta. Núcleo fuera de UI Surface Impact. Cuatro pantallas STANDARD.
ui_system: 4.0.0
retana_ui:
  sha: local-branch
  registry_source: local-clone
  retana_ui_layer: DEGRADED
  reason: El ciclo vive dentro de retana-ui. No hay un SHA de catálogo anterior que instalar. Compensación - el código nuevo está en registry/ y el build del registry lo publica.
components:
  retana:
    - button
    - input
    - label
    - badge
    - separator
    - skeleton
    - scroll-area
    - checkbox
    - empty-state
  candidates_local:
    - guard-rule-builder
    - guard-rule-simulator
    - guard-approval-queue
    - guard-audit-log
  core: guard-rules
brief:
  outcome: Un host puede frenar una acción de un agente (WhatsApp o git.merge) con una decisión trazable y, si hace falta, una aprobación que vence.
  benefit: La misma API sirve para la primera herramienta y para la siguiente, sin un tipo nuevo en registry.json.
  sources: Post público de un rule builder, idea only, sin licencia (x.com/heyanantj/status/2116917836086186436). Código propio.
  scope: Núcleo registry:lib, cuatro registry:component, docs de Herramientas, demo /herramientas, preset sintético.
  checks: Precedencia, dato faltante, TTL, cuentas, bitácora, roles, ApprovalGate con git.merge, PLP, es-MX/EN, 390px, teclado.
  stop_when: pnpm test y pnpm build en verde, y la Spec cita RUI-TOOLS-001 como pendiente en el hub.
  deliverable: Un PR draft. No se mergea. No se toca producción.
states:
  - idle
  - pending
  - success
  - error
  - empty
  - loading
  - expired
  - permission_denied
  - overflow
  - i18n_long
acceptance:
  - id: AC-1
    measure: Para cada subconjunto no vacío de block, handoff_to_human, require_approval y allow, con y sin log, la decisión es la de mayor precedencia y log no la cambia.
    test: __tests__/guard-rules.test.ts evaluateRules precedence
  - id: AC-2
    measure: Si una condición necesita un dato ausente y ningún block ni handoff disparó, decision es require_approval, failClosed es true, y el texto no es allow.
    test: __tests__/guard-rules.test.ts evaluateRules missing data
  - id: AC-3
    measure: Con reloj inyectado, un pending cuyo now >= expiresAt pasa a expired y decide lanza GuardError expired.
    test: __tests__/guard-rules.test.ts ApprovalGate
  - id: AC-4
    measure: get y list de otra cuenta no devuelven tickets de marca-sintetica. save cruzado lanza isolation.
    test: __tests__/guard-rules.test.ts ApprovalGate y audit, versions, and permissions
  - id: AC-5
    measure: El registro devuelto por append está congelado. No hay update ni delete. Mutar el input después no cambia lo guardado.
    test: __tests__/guard-rules.test.ts appends frozen records
  - id: AC-6
    measure: La versión 1 sigue igual después de publicar la versión 2. Viewer y approver no guardan. Editor no decide.
    test: __tests__/guard-rules.test.ts versions rulesets
  - id: AC-7
    measure: evaluateRules y guardAction aceptan kind git.merge, crean un ticket y get lo devuelve solo en esa cuenta.
    test: __tests__/guard-rules.test.ts releases a git.merge y __tests__/guard-rules-snippets.test.ts
  - id: AC-8
    measure: Cada pieza UI muestra lleno, vacío, carga y error. La cola se aprueba con Enter. Un viewer y un ticket vencido no aprueban. La bitácora no tiene botón de borrar.
    test: __tests__/guard-rules-ui.test.tsx
  - id: AC-9
    measure: El lint de núcleo falla si el fixture importa react, next, css o components, o llama fetch. El núcleo real pasa el lint.
    test: __tests__/guard-rules.test.ts tool core purity y scripts/tool-core-purity.ts vía registry:build
  - id: AC-10
    measure: El preset bloquea “hasta $36 mil” sin validar, lo permite si offer.validated es true, y pide aprobación en etapa, documento, descuento y número frío.
    test: __tests__/guard-rules.test.ts Mejoravit preset
non_goals:
  - Backend real, Supabase, webhooks de un proveedor, secretos, merge, cambios al hub.
  - Tipo tool dentro de registry.json.
rule_pending_in_hub: RUI-TOOLS-001
---

# Spec — Motor de guardas

## Brief

1. Outcome: frenar o dejar pasar una acción de agente con una decisión trazable.
2. Benefit: WhatsApp y un `git.merge` usan el mismo puerto `ApprovalGate`.
3. Sources: idea de un rule builder público, sin licencia. Código propio. Datos ficticios.
4. Scope: núcleo puro, cuatro pantallas STANDARD, docs, demo.
5. Checks: los AC de arriba.
6. Stop when: tests y build en verde, sin auditar el propio trabajo.
7. Deliverable: PR draft.

## RUI-TOOLS-001

Pendiente en el hub. Se cumple aquí: núcleo TS puro y determinista, sin red, API tipada, pantallas que solo consumen esa API, demo `/herramientas` con datos ficticios.

## Fail-closed

La decisión por dato faltante es `require_approval`, no `allow`. Un block o un handoff que sí disparó gana. La razón está en `docs/herramientas/modelo-de-amenazas.md`.

## Dirección

Dos variantes de layout del constructor. Se elige la apilada. Ver `guard-rules.direction.md`. Sin imágenes: el tema se hereda y no hay proveedor de dirección en este ciclo. Modo text-degraded.
