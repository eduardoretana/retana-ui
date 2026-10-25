"use client"

/** Compact stage dots. The host can replace this with `renderProgress`. */

import { cn } from "@/lib/utils"
import { atsStageClass, type AtsStage } from "@/registry/retana/lib/ats"

export function StageProgress({
  stages,
  stageId,
  label,
  className,
}: {
  stages: readonly AtsStage[]
  stageId: string
  label: string
  className?: string
}) {
  const index = stages.findIndex((stage) => stage.id === stageId)
  return (
    <span data-slot="ats-progress" role="img" aria-label={label} className={cn("inline-flex items-center gap-1", className)}>
      {stages.map((stage, position) => (
        <span
          key={stage.id}
          data-stage-id={stage.id}
          data-reached={position <= index && index >= 0 ? "true" : "false"}
          className={cn("size-1.5 rounded-full", position <= index && index >= 0 ? atsStageClass(stage) : "bg-muted")}
        />
      ))}
    </span>
  )
}

export function StagePill({ stage, className }: { stage?: AtsStage; className?: string }) {
  if (!stage) return null
  return (
    <span
      data-slot="ats-stage-pill"
      data-stage-id={stage.id}
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 text-xs font-medium",
        atsStageClass(stage),
        className,
      )}
    >
      {stage.label}
    </span>
  )
}
