/**
 * Family contract for a priced agent run.
 * workflow-builder maps nodes with `runFromWorkflowNodes`.
 * model-router asks `blendedCostPer1k` for one model mix.
 * Neither piece is imported here.
 */
import type {
  applyRunEvent,
  blendedCostPer1k,
  consumeRunEvents,
  ownCost,
  rollupRun,
  runFromWorkflowNodes,
  runToCsv,
  runToJson,
} from "@/registry/lib/cost-waterfall"

export type CostRunFamily = {
  ownCost: typeof ownCost
  rollup: typeof rollupRun
  reduce: typeof applyRunEvent
  stream: typeof consumeRunEvents
  json: typeof runToJson
  csv: typeof runToCsv
  fromWorkflowNodes: typeof runFromWorkflowNodes
  blendedPer1k: typeof blendedCostPer1k
}

export const costRunContract = {
  unit: "micro",
  scale: 1_000_000,
  events: ["step.started", "step.progress", "step.completed", "step.failed", "run.completed"],
  statuses: ["queued", "running", "success", "error", "skipped"],
} as const
