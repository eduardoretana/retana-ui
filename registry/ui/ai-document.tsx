"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type AiDocumentSegment =
  | { id: string; type: "text"; text: string }
  | {
      id: string
      type: "edit"
      kind: "insert" | "delete" | "replace"
      text: string
      replacement?: string
      status?: "pending" | "accepted" | "rejected"
    }

export type AiDocumentDecision = "accepted" | "rejected"

export type AiDocumentProps = {
  title?: string
  segments: readonly AiDocumentSegment[]
  onResolve?: (id: string, decision: AiDocumentDecision) => void
  acceptLabel?: string
  rejectLabel?: string
  insertLabel?: string
  deleteLabel?: string
  replaceLabel?: string
  className?: string
}

function resultingText(segment: Extract<AiDocumentSegment, { type: "edit" }>, decision: AiDocumentDecision | "pending") {
  if (decision === "rejected") {
    if (segment.kind === "insert") return ""
    return segment.text
  }
  if (decision === "accepted") {
    if (segment.kind === "delete") return ""
    if (segment.kind === "replace") return segment.replacement ?? ""
    return segment.text
  }
  return null
}

export function AiDocument({
  title = "Document",
  segments,
  onResolve,
  acceptLabel = "Accept",
  rejectLabel = "Reject",
  insertLabel = "Insert",
  deleteLabel = "Delete",
  replaceLabel = "Replace",
  className,
}: AiDocumentProps) {
  const [local, setLocal] = React.useState<Record<string, AiDocumentDecision>>({})
  const kindLabel = { insert: insertLabel, delete: deleteLabel, replace: replaceLabel }

  function resolve(id: string, decision: AiDocumentDecision) {
    setLocal((current) => ({ ...current, [id]: decision }))
    onResolve?.(id, decision)
  }

  return (
    <article data-slot="ai-document" className={cn("rounded-xl border border-border bg-card shadow-sm", className)}>
      <header className="border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
      </header>
      <div className="flex flex-col gap-3 px-5 py-4 text-sm leading-7">
        {segments.map((segment) => {
          if (segment.type === "text") {
            return (
              <p key={segment.id} className="whitespace-pre-wrap">
                {segment.text}
              </p>
            )
          }
          const decision = local[segment.id] ?? segment.status ?? "pending"
          const settled = resultingText(segment, decision)
          if (settled !== null) {
            if (!settled) return null
            return (
              <p key={segment.id} className="whitespace-pre-wrap">
                {settled}
              </p>
            )
          }
          return (
            <div
              key={segment.id}
              data-edit={segment.kind}
              data-status="pending"
              className="rounded-lg border border-border bg-muted/30 p-3"
            >
              <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {kindLabel[segment.kind]}
              </p>
              {segment.kind !== "insert" ? (
                <p className="whitespace-pre-wrap rounded-md bg-destructive/10 px-2 py-1 line-through decoration-destructive/70">
                  {segment.text}
                </p>
              ) : null}
              {segment.kind !== "delete" ? (
                <p className={cn("whitespace-pre-wrap rounded-md bg-primary/10 px-2 py-1", segment.kind === "replace" && "mt-1")}>
                  {segment.kind === "replace" ? segment.replacement : segment.text}
                </p>
              ) : null}
              <div className="mt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" size="xs" onClick={() => resolve(segment.id, "rejected")}>
                  {rejectLabel}
                </Button>
                <Button type="button" size="xs" onClick={() => resolve(segment.id, "accepted")}>
                  {acceptLabel}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
