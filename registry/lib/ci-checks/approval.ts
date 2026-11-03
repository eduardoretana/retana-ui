/**
 * Port for the guard-rule engine (RUI-TOOLS-001 / require_approval).
 * The real engine is not in this repo yet. This adapter never grants a merge
 * unless the caller passes an explicit confirmation and a person id.
 * Passing checks is not approval.
 */

export type MergeApprovalRequest = {
  owner: string
  repo: string
  pullNumber: number
  sha: string
  confirmed: boolean
  grantedBy?: string
}

export type MergeApproval =
  | { decision: "required" }
  | { decision: "granted"; grantedBy: string }
  | { decision: "denied"; reason: string }

export type ApprovalGate = {
  review(request: MergeApprovalRequest): Promise<MergeApproval> | MergeApproval
}

export function alwaysAskApproval(): ApprovalGate {
  return {
    review(request) {
      if (request.confirmed && request.grantedBy && request.grantedBy.trim()) {
        return { decision: "granted", grantedBy: request.grantedBy.trim() }
      }
      return { decision: "required" }
    },
  }
}
