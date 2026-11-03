import { cloneDefined, deepFreeze } from "./freeze"
import type { Actor, Ruleset, RulesetDraft, RulesetSummary } from "./types"
import { GuardError } from "./types"

export interface RulesetPort {
  list(actor: Actor): readonly RulesetSummary[]
  get(actor: Actor, rulesetId: string, version: number): Ruleset | null
  active(actor: Actor): Ruleset | null
  /** System read. Returns only that account's active ruleset. */
  activeForAccount(accountId: string): Ruleset | null
  save(actor: Actor, draft: RulesetDraft): Ruleset
  activate(actor: Actor, rulesetId: string, version: number): void
}

type VersionMap = Map<string, Map<number, Ruleset>>

export class MemoryRulesetStore implements RulesetPort {
  private readonly accounts = new Map<string, VersionMap>()
  private readonly activePointer = new Map<string, { id: string; version: number }>()

  list(actor: Actor): readonly RulesetSummary[] {
    const versions = this.accounts.get(actor.accountId)
    if (!versions) return []
    const pointer = this.activePointer.get(actor.accountId)
    const summaries: RulesetSummary[] = []
    for (const [id, history] of versions) {
      const latest = [...history.keys()].sort((a, b) => a - b).at(-1)
      if (latest === undefined) continue
      const ruleset = history.get(latest)
      if (!ruleset) continue
      summaries.push({
        id,
        name: ruleset.name,
        version: latest,
        active: pointer?.id === id && pointer.version === latest,
      })
    }
    return summaries.sort((a, b) => a.id.localeCompare(b.id))
  }

  get(actor: Actor, rulesetId: string, version: number): Ruleset | null {
    return this.accounts.get(actor.accountId)?.get(rulesetId)?.get(version) ?? null
  }

  active(actor: Actor): Ruleset | null {
    return this.activeForAccount(actor.accountId)
  }

  activeForAccount(accountId: string): Ruleset | null {
    const pointer = this.activePointer.get(accountId)
    if (!pointer) return null
    return this.accounts.get(accountId)?.get(pointer.id)?.get(pointer.version) ?? null
  }

  save(actor: Actor, draft: RulesetDraft): Ruleset {
    if (actor.role !== "editor") throw new GuardError("permission", "Only an editor can save a ruleset version.")
    if (actor.accountId !== draft.accountId) {
      throw new GuardError("isolation", "An editor cannot write a ruleset into another account.")
    }
    const history = this.history(draft.accountId, draft.id)
    const nextVersion = ([...history.keys()].sort((a, b) => a - b).at(-1) ?? 0) + 1
    const ruleset = deepFreeze(
      cloneDefined({
        id: draft.id,
        accountId: draft.accountId,
        version: nextVersion,
        name: draft.name,
        rules: draft.rules,
      }),
    )
    history.set(nextVersion, ruleset)
    return ruleset
  }

  activate(actor: Actor, rulesetId: string, version: number): void {
    if (actor.role !== "editor") throw new GuardError("permission", "Only an editor can activate a ruleset.")
    const ruleset = this.accounts.get(actor.accountId)?.get(rulesetId)?.get(version)
    if (!ruleset) throw new GuardError("not_found", "That ruleset version does not exist in this account.")
    this.activePointer.set(actor.accountId, { id: rulesetId, version })
  }

  private history(accountId: string, rulesetId: string) {
    let versions = this.accounts.get(accountId)
    if (!versions) {
      versions = new Map()
      this.accounts.set(accountId, versions)
    }
    let history = versions.get(rulesetId)
    if (!history) {
      history = new Map()
      versions.set(rulesetId, history)
    }
    return history
  }
}
