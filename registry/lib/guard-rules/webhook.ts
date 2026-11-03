import type { GuardAction } from "./types"
import { REASON } from "./types"
import { WHATSAPP_KINDS, SYNTHETIC_ACCOUNT, SYNTHETIC_PHONE } from "./preset"

/** Example CRM webhook body. Not a Vambe or n8n contract. No URL and no secret. */
export type ExampleCrmWebhook = {
  accountId: string
  kind: string
  message?: { text?: string; to?: string }
  crm?: {
    stage?: string
    topic?: string
    contactInitiated?: boolean
    stuckCount?: number
    documentType?: string
    discountRequested?: boolean
    offerKind?: string
    offerValidated?: boolean
    requestedSecrets?: string[]
    intent?: string
    mentions?: string[]
    requestedHuman?: boolean
    direction?: string
  }
}

const KINDS = new Set<string>(Object.values(WHATSAPP_KINDS))

/**
 * Maps a fictional webhook into a guard action.
 * Omitted CRM fields stay omitted so the engine can fail closed.
 */
export function mapExampleCrmWebhook(body: ExampleCrmWebhook): GuardAction {
  if (!KINDS.has(body.kind) && body.kind !== "git.merge") {
    throw new Error(`Example mapper does not know kind "${body.kind}". Pass a whatsapp.* kind or "git.merge".`)
  }
  const crm = body.crm ?? {}
  const data: Record<string, unknown> = {}
  if (crm.stage !== undefined) data.stage = crm.stage
  if (crm.topic !== undefined) data.topic = crm.topic
  if (crm.contactInitiated !== undefined) data.contactInitiated = crm.contactInitiated
  if (crm.stuckCount !== undefined) data.stuckCount = crm.stuckCount
  if (crm.documentType !== undefined) data.documentType = crm.documentType
  if (crm.discountRequested !== undefined) data.discountRequested = crm.discountRequested
  if (crm.requestedSecrets !== undefined) data.requestedSecrets = crm.requestedSecrets
  if (crm.intent !== undefined) data.intent = crm.intent
  if (crm.mentions !== undefined) data.mentions = crm.mentions
  if (crm.requestedHuman !== undefined) data.requestedHuman = crm.requestedHuman
  if (crm.direction !== undefined) data.direction = crm.direction
  if (body.message?.to !== undefined) data.destinationPhone = body.message.to
  if (crm.offerKind !== undefined || crm.offerValidated !== undefined) {
    data.offer = {
      ...(crm.offerKind !== undefined ? { kind: crm.offerKind } : {}),
      ...(crm.offerValidated !== undefined ? { validated: crm.offerValidated } : {}),
    }
  }
  if (body.kind === "git.merge") {
    data.repository = "ejemplo/demo"
    data.pullRequest = 0
  }
  return {
    accountId: body.accountId || SYNTHETIC_ACCOUNT,
    kind: body.kind,
    data,
    ...(body.message?.text !== undefined ? { text: body.message.text } : {}),
  }
}

export function syntheticGitMerge(accountId = SYNTHETIC_ACCOUNT): GuardAction {
  return {
    accountId,
    kind: "git.merge",
    data: { repository: "ejemplo/demo", pullRequest: 0, checksGreen: true },
  }
}

export function gitMergeApprovalRuleset(accountId = SYNTHETIC_ACCOUNT) {
  return {
    id: "ci-merge-ficticio",
    accountId,
    name: "Merge ficticio",
    rules: [
      {
        id: "merge-needs-human",
        name: "Merge con checks verdes",
        enabled: true,
        kinds: ["git.merge"],
        conditions: { op: "eq" as const, path: "checksGreen", value: true },
        decision: "require_approval" as const,
        reasonKey: REASON.gitMerge,
        approvalTtlMs: 60_000,
      },
      {
        id: "log-all",
        name: "Bitácora",
        enabled: true,
        kinds: ["*"],
        conditions: { op: "and" as const, conditions: [] },
        decision: "log" as const,
        reasonKey: REASON.log,
      },
    ],
  }
}

export { SYNTHETIC_PHONE }
