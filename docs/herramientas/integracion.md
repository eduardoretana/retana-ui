# Integración

El núcleo no habla con la red. El host llama `guardAction` antes de que el agente ejecute la acción. El reloj lo pone el host.

## Hook pre-acción

Este archivo compila y está cubierto por `__tests__/guard-rules-snippets.test.ts`. El cuerpo del webhook es un ejemplo. No es el contrato de Vambe ni de n8n. No tiene URL ni secreto.

```ts
import {
  MemoryApprovalGate,
  MemoryAuditLog,
  MemoryRulesetStore,
  createIdSequence,
  guardAction,
  mapExampleCrmWebhook,
  mejoravitWhatsappRuleset,
} from "@/registry/retana/lib/guard-rules"

/**
 * Example pre-action hook. The webhook shape is fictional.
 * It is not a Vambe or n8n contract and it has no URL or secret.
 */
export function antesDeEnviar(now: number) {
  const store = new MemoryRulesetStore()
  const editor = { id: "editor-ficticio", accountId: "marca-sintetica", role: "editor" as const }
  const saved = store.save(editor, mejoravitWhatsappRuleset({ accountId: "marca-sintetica", stuckMessageThreshold: 4 }))
  store.activate(editor, saved.id, saved.version)
  const ruleset = store.activeForAccount("marca-sintetica")
  const action = mapExampleCrmWebhook({
    accountId: "marca-sintetica",
    kind: "whatsapp.before_send",
    message: { text: "Hola, soy la asesora demo.", to: "+525500000000" },
    crm: {
      topic: "mejoravit",
      direction: "outbound",
      contactInitiated: true,
      offerKind: "none",
      offerValidated: false,
      requestedSecrets: [],
    },
  })
  return guardAction(
    {
      ruleset,
      gate: new MemoryApprovalGate(createIdSequence("apr")),
      audit: new MemoryAuditLog(),
      clock: () => now,
      nextAuditId: createIdSequence("aud"),
    },
    action,
  )
}
```

Lectura del resultado:

| `decision` | Qué hace el loop |
| --- | --- |
| `allow` | Sigue. Si venía de un ticket, `approval.consumedAt` ya quedó puesto. |
| `require_approval` | No envía. Muestra `approval.id` en la cola. |
| `block` | No envía. |
| `handoff_to_human` | Deja de contestar el bot y avisa a una persona. |

Un block o un handoff no se saltan con un ticket viejo. Solo `require_approval` se libera, y solo si el ticket está `approved`, no consumido, no vencido, y el hash de la acción y la versión del ruleset coinciden.

## Puerto ApprovalGate

API estable v1. Otra herramienta, incluida una de checks de CI, no necesita WhatsApp. Evalúa una acción genérica y crea o consulta la aprobación por este puerto.

Nombres que no deben renombrarse sin un cambio mayor: `GuardAction`, `GuardAction.kind`, `evaluateRules`, `ApprovalGate`, `ApprovalTicket`, `MemoryApprovalGate`, `guardAction`.

```ts
import {
  MemoryApprovalGate,
  MemoryAuditLog,
  createIdSequence,
  evaluateRules,
  guardAction,
  gitMergeApprovalRuleset,
  syntheticGitMerge,
} from "@/registry/retana/lib/guard-rules"

/** Stable example for another tool. kind is "git.merge". No network. */
export function simularMerge(now: number) {
  const ruleset = { ...gitMergeApprovalRuleset("marca-sintetica"), version: 1 }
  const action = syntheticGitMerge("marca-sintetica")
  const evaluation = evaluateRules(ruleset, action, () => now)
  const gate = new MemoryApprovalGate(createIdSequence("apr"))
  const audit = new MemoryAuditLog()
  const outcome = guardAction(
    { ruleset, gate, audit, clock: () => now, nextAuditId: createIdSequence("aud") },
    action,
  )
  const stored = outcome.approval ? gate.get(action.accountId, outcome.approval.id, now) : null
  return { evaluation, outcome, stored }
}
```

Contrato de `ApprovalGate`:

| Método | Hace |
| --- | --- |
| `create` | Abre un ticket `pending`. Si ya hay uno pending o approved sin consumir para el mismo hash, cuenta, ruleset y versión, devuelve ese. |
| `get(accountId, id, now)` | Un ticket de esa cuenta, o `null`. No revela otra cuenta. `now` vence lo que ya cumplió el TTL. |
| `list(accountId, { now, status?, kind? })` | Solo esa cuenta. |
| `decide` | `pending` → `approved` o `rejected`. Exige rol `approver` de la misma cuenta. Un ticket vencido lanza `GuardError` `expired`. |
| `consume` | Gasta una vez un `approved` cuyo hash coincide. El segundo intento lanza `replay`. |

`MemoryApprovalGate` es el adaptador en memoria. Un host puede implementar la misma interfaz sobre su base. Este repo no trae ese adaptador.

Para enganchar un merge, la otra herramienta arma un `GuardAction` con `kind: "git.merge"` y los datos que sus reglas lean (`checksGreen`, `repository`, `pullRequest`), evalúa con su ruleset y usa el mismo `ApprovalGate`. No hace falta un tipo nuevo en `registry.json`. Si publica su propia herramienta, agrega una entrada a `tools[]` como dice [CONVENCION.md](./CONVENCION.md).
