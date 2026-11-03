import { actionHash } from "./hash"
import { cloneDefined, deepFreeze } from "./freeze"
import type { GuardAction, TerminalDecision } from "./types"

export type AuditRecord = {
  id: string
  accountId: string
  rulesetId: string
  rulesetVersion: number
  ruleIds: readonly string[]
  kind: string
  actionHash: string
  input: GuardAction
  decision: TerminalDecision
  failClosed: boolean
  createdAt: number
  agentResponse?: string
  approver?: string
}

export type AuditDraft = {
  id: string
  accountId: string
  rulesetId: string
  rulesetVersion: number
  ruleIds: readonly string[]
  input: GuardAction
  decision: TerminalDecision
  failClosed: boolean
  createdAt: number
  agentResponse?: string
  approver?: string
}

/** Append-only port. There is no update or delete. */
export interface AuditLog {
  append(entry: AuditDraft): AuditRecord
  list(accountId: string): readonly AuditRecord[]
}

export class MemoryAuditLog implements AuditLog {
  private readonly records: AuditRecord[] = []

  append(entry: AuditDraft): AuditRecord {
    const record = deepFreeze({
      id: entry.id,
      accountId: entry.accountId,
      rulesetId: entry.rulesetId,
      rulesetVersion: entry.rulesetVersion,
      ruleIds: [...entry.ruleIds],
      kind: entry.input.kind,
      actionHash: actionHash(entry.input),
      input: cloneDefined(entry.input),
      decision: entry.decision,
      failClosed: entry.failClosed,
      createdAt: entry.createdAt,
      ...(entry.agentResponse !== undefined ? { agentResponse: entry.agentResponse } : {}),
      ...(entry.approver !== undefined ? { approver: entry.approver } : {}),
    })
    this.records.push(record)
    return record
  }

  list(accountId: string): readonly AuditRecord[] {
    return this.records.filter((record) => record.accountId === accountId)
  }
}
