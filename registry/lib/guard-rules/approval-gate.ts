import { actionHash } from "./hash"
import { cloneDefined, deepFreeze } from "./freeze"
import type { Actor, ApprovalStatus, GuardAction } from "./types"
import { GuardError } from "./types"

/**
 * Stable approval port (API v1).
 * CI Checks Live and any other tool call this. It is not WhatsApp-specific.
 * `kind` on the ticket is the action kind, for example "git.merge".
 */
export type ApprovalTicket = {
  id: string
  accountId: string
  kind: string
  action: GuardAction
  actionHash: string
  rulesetId: string
  rulesetVersion: number
  reasonKey: string
  status: ApprovalStatus
  createdAt: number
  expiresAt: number
  decidedAt?: number
  decidedBy?: string
  consumedAt?: number
}

export type ApprovalRequest = {
  accountId: string
  action: GuardAction
  rulesetId: string
  rulesetVersion: number
  reasonKey: string
  ttlMs: number
  now: number
  id?: string
}

export type ApprovalListQuery = {
  now: number
  status?: ApprovalStatus
  kind?: string
}

export type ApprovalDecisionCommand = {
  accountId: string
  actor: Actor
  id: string
  outcome: "approved" | "rejected"
  now: number
}

export type ApprovalConsumeCommand = {
  accountId: string
  id: string
  action: GuardAction
  now: number
}

export interface ApprovalGate {
  create(request: ApprovalRequest): ApprovalTicket
  get(accountId: string, id: string, now: number): ApprovalTicket | null
  list(accountId: string, query: ApprovalListQuery): readonly ApprovalTicket[]
  decide(command: ApprovalDecisionCommand): ApprovalTicket
  consume(command: ApprovalConsumeCommand): ApprovalTicket
}

function strip<T extends Record<string, unknown>>(value: T): T {
  const out: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined) out[key] = item
  }
  return out as T
}

export class MemoryApprovalGate implements ApprovalGate {
  private readonly buckets = new Map<string, Map<string, ApprovalTicket>>()
  private sequence = 0

  constructor(private readonly ids: () => string = () => {
    this.sequence += 1
    return `apr_${this.sequence}`
  }) {}

  create(request: ApprovalRequest): ApprovalTicket {
    if (request.action.accountId !== request.accountId) {
      throw new GuardError("isolation", "Approval account does not match the action account.")
    }
    if (!(request.ttlMs > 0)) throw new GuardError("invalid", "Approval TTL must be greater than zero.")
    this.expireAccount(request.accountId, request.now)
    const hash = actionHash(request.action)
    const existing = this.openFor(request, hash)
    if (existing) return existing
    const id = request.id ?? this.ids()
    if (this.bucket(request.accountId).has(id)) throw new GuardError("invalid", "Approval id already exists in this account.")
    const ticket = this.store({
      id,
      accountId: request.accountId,
      kind: request.action.kind,
      action: cloneDefined(request.action),
      actionHash: hash,
      rulesetId: request.rulesetId,
      rulesetVersion: request.rulesetVersion,
      reasonKey: request.reasonKey,
      status: "pending",
      createdAt: request.now,
      expiresAt: request.now + request.ttlMs,
    })
    return ticket
  }

  get(accountId: string, id: string, now: number): ApprovalTicket | null {
    this.expireAccount(accountId, now)
    return this.bucket(accountId).get(id) ?? null
  }

  list(accountId: string, query: ApprovalListQuery): readonly ApprovalTicket[] {
    this.expireAccount(accountId, query.now)
    return [...this.bucket(accountId).values()]
      .filter((ticket) => (query.status ? ticket.status === query.status : true))
      .filter((ticket) => (query.kind ? ticket.kind === query.kind : true))
      .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id))
  }

  decide(command: ApprovalDecisionCommand): ApprovalTicket {
    if (command.actor.accountId !== command.accountId) {
      throw new GuardError("isolation", "The actor cannot decide an approval for another account.")
    }
    if (command.actor.role !== "approver") {
      throw new GuardError("permission", "Only an approver can approve or reject.")
    }
    this.expireAccount(command.accountId, command.now)
    const ticket = this.must(command.accountId, command.id)
    if (ticket.status === "expired") throw new GuardError("expired", "An expired approval cannot be decided.")
    if (ticket.status !== "pending") throw new GuardError("terminal", "That approval is already decided.")
    return this.store({
      ...ticket,
      status: command.outcome,
      decidedAt: command.now,
      decidedBy: command.actor.id,
    })
  }

  consume(command: ApprovalConsumeCommand): ApprovalTicket {
    if (command.action.accountId !== command.accountId) {
      throw new GuardError("isolation", "Consume account does not match the action account.")
    }
    this.expireAccount(command.accountId, command.now)
    const ticket = this.must(command.accountId, command.id)
    if (ticket.status === "expired") throw new GuardError("expired", "An expired approval cannot be used.")
    if (ticket.status !== "approved") throw new GuardError("terminal", "Only an approved ticket can be consumed.")
    if (ticket.consumedAt !== undefined) throw new GuardError("replay", "That approval was already used.")
    if (ticket.actionHash !== actionHash(command.action)) {
      throw new GuardError("replay", "The action does not match the approved payload.")
    }
    return this.store({ ...ticket, consumedAt: command.now })
  }

  private openFor(request: ApprovalRequest, hash: string) {
    for (const ticket of this.bucket(request.accountId).values()) {
      if (ticket.actionHash !== hash) continue
      if (ticket.rulesetId !== request.rulesetId || ticket.rulesetVersion !== request.rulesetVersion) continue
      if (ticket.status === "pending") return ticket
      if (ticket.status === "approved" && ticket.consumedAt === undefined) return ticket
    }
    return null
  }

  private expireAccount(accountId: string, now: number) {
    for (const ticket of this.bucket(accountId).values()) {
      if ((ticket.status === "pending" || ticket.status === "approved") && now >= ticket.expiresAt) {
        this.store({ ...ticket, status: "expired" })
      }
    }
  }

  private must(accountId: string, id: string) {
    const ticket = this.bucket(accountId).get(id)
    if (!ticket) throw new GuardError("not_found", "No approval with that id exists in this account.")
    return ticket
  }

  private bucket(accountId: string) {
    const found = this.buckets.get(accountId)
    if (found) return found
    const created = new Map<string, ApprovalTicket>()
    this.buckets.set(accountId, created)
    return created
  }

  private store(ticket: ApprovalTicket) {
    const frozen = deepFreeze(strip(cloneDefined(ticket) as unknown as Record<string, unknown>) as unknown as ApprovalTicket)
    this.bucket(ticket.accountId).set(ticket.id, frozen)
    return frozen
  }
}
