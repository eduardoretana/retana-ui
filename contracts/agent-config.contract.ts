/**
 * Family contract for the agent configuration console.
 * A later variant must keep draft/published versions, the band partition,
 * declarative guardrails, and example per-1M rates that convert to the
 * per-1K figure model-router stores. This file does not import that branch.
 */

import {
  VERSION_STATES,
  GUARDRAIL_ACTIONS,
  RUN_EVENT_KINDS,
  bandsAreValid,
  exampleAmountPer1k,
  partitionBands,
  type AgentVersion,
  type ExampleModel,
} from "@/registry/lib/agent-config"
import type { AgentConfigProps, ModelSlotProps } from "@/registry/ui/agent-config"

export type AgentConfigFamily = {
  version: AgentVersion
  props: AgentConfigProps
  modelSlot: ModelSlotProps
}

const sample: ExampleModel = {
  id: "norte",
  name: "Ejemplo Norte",
  vendor: "Ejemplo",
  currency: "USD",
  inputPerMillion: 3,
  outputPerMillion: 15,
  p95Ms: 1400,
  example: true,
}

export function assertAgentConfigContract() {
  if (VERSION_STATES.join(",") !== "draft,published") throw new Error("version states drifted")
  if (!GUARDRAIL_ACTIONS.includes("require_approval") || !GUARDRAIL_ACTIONS.includes("redact")) {
    throw new Error("guardrail actions drifted")
  }
  if (RUN_EVENT_KINDS.join(",") !== "decision,guardrail,fallback,test") throw new Error("run events drifted")
  if (!bandsAreValid(partitionBands(70, 92))) throw new Error("70/92 must stay a valid partition")
  if (exampleAmountPer1k(sample) !== (3 * 0.75 + 15 * 0.25) / 1000) {
    throw new Error("per-1M example must convert to amountPer1k")
  }
}
