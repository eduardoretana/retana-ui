# API v1

Import público: `@/registry/retana/lib/guard-rules` en este repo, `@/lib/guard-rules` cuando el host instala el item.

## Evaluación

`evaluateRules(ruleset, action, clock) → Evaluation`

`action` es `{ accountId, kind, data, text? }`. `kind` es un string abierto. `clock` devuelve milisegundos. La función no llama `Date.now`.

Si `ruleset.accountId` no es `action.accountId`, lanza `GuardError` `isolation`.

`Evaluation` trae `decision`, `failClosed`, `fired`, `logs`, `missingPaths` y `traces` en el orden de las reglas. `explain(evaluation, locale)` arma el texto es-MX o EN. `decisionLabel` es la etiqueta corta.

`failClosed` es verdadero cuando al menos una regla cuyo kind coincidió no pudo leer un dato y ningún block ni handoff ganó. La decisión entonces es `require_approval`.

Un AND con un hijo falso es falso aunque otro hijo no tenga dato. Un OR con un hijo verdadero es verdadero aunque otro no tenga dato. Esos casos no alimentan `missingPaths`.

## Aprobaciones

Ver [integracion.md](./integracion.md). Tipos: `ApprovalGate`, `ApprovalTicket`, `ApprovalRequest`, `ApprovalDecisionCommand`, `ApprovalConsumeCommand`, `ApprovalListQuery`.

Estados: `pending`, `approved`, `rejected`, `expired`.

TTL: `expiresAt = now + ttlMs` al crear. `DEFAULT_APPROVAL_TTL_MS` es 15 minutos. Un ticket `rejected` no pasa a `expired`. `pending` y `approved` sí, cuando `now >= expiresAt`.

## Bitácora

`AuditLog.append` y `AuditLog.list(accountId)`. No hay update ni delete. `MemoryAuditLog` devuelve objetos congelados.

## Rulesets

`RulesetPort` / `MemoryRulesetStore`.

| Acción | viewer | editor | approver |
| --- | --- | --- | --- |
| Leer | sí | sí | sí |
| `save` (nueva versión) | no | sí | no |
| `activate` | no | sí | no |
| `ApprovalGate.decide` | no | no | sí |

`save` copia y congela. La versión anterior queda. `activeForAccount` solo ve el puntero de esa cuenta.

## Preset y ejemplos

- `mejoravitWhatsappRuleset({ accountId, stuckMessageThreshold?, approvalTtlMs? })`
- `mejoravitRequiredPaths(kind)`
- `syntheticSafeSend`, `syntheticUnvalidatedOffer`, `syntheticValidatedOffer`
- `gitMergeApprovalRuleset`, `syntheticGitMerge`
- `mapExampleCrmWebhook` — ejemplo, no un proveedor real
- `guardAction(deps, action)` — el hook
- `parseRuleset` — rechaza un `allow` con AND vacío
- `flattenData` / `unflattenData` — los usa el simulador
- `createIdSequence(prefix)`

## Copy

`GUARD_MESSAGES` y `guardMessage(key, locale, extra?)`. Una clave que el núcleo no conoce se muestra como `Regla <key>.` / `Rule <key>.`. Otra herramienta puede pasar un catálogo extra a `explain` y a `guardMessage`.

## Errores

`GuardError` con `code`: `isolation`, `permission`, `expired`, `terminal`, `replay`, `not_found`, `invalid`.
