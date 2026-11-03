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
