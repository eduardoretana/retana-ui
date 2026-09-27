"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export type DiffLineKind = "add" | "delete" | "context" | "meta"

export type DiffLine = {
  kind: DiffLineKind
  text: string
  oldNumber?: number
  newNumber?: number
}

export type FileDiffProps = {
  /** Unified diff text, or pre-parsed lines. */
  patch?: string
  lines?: readonly DiffLine[]
  filename?: string
  /** Collapse context runs longer than this many lines. */
  collapseAfter?: number
  expandLabel?: string
  collapseLabel?: string
  additionsLabel?: string
  deletionsLabel?: string
  className?: string
}

export function parseUnifiedDiff(patch: string): DiffLine[] {
  const rows: DiffLine[] = []
  let oldLine = 0
  let newLine = 0
  for (const raw of patch.replace(/\n$/, "").split("\n")) {
    if (raw.startsWith("@@")) {
      const match = /@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(raw)
      oldLine = match ? Number(match[1]) : oldLine
      newLine = match ? Number(match[2]) : newLine
      rows.push({ kind: "meta", text: raw })
      continue
    }
    if (raw.startsWith("---") || raw.startsWith("+++") || raw.startsWith("diff ") || raw.startsWith("index ")) {
      rows.push({ kind: "meta", text: raw })
      continue
    }
    if (raw.startsWith("+")) {
      rows.push({ kind: "add", text: raw.slice(1), newNumber: newLine })
      newLine += 1
      continue
    }
    if (raw.startsWith("-")) {
      rows.push({ kind: "delete", text: raw.slice(1), oldNumber: oldLine })
      oldLine += 1
      continue
    }
    const text = raw.startsWith(" ") ? raw.slice(1) : raw
    rows.push({ kind: "context", text, oldNumber: oldLine, newNumber: newLine })
    oldLine += 1
    newLine += 1
  }
  return rows
}

type Block =
  | { type: "lines"; lines: DiffLine[] }
  | { type: "collapse"; lines: DiffLine[] }

function groupLines(lines: readonly DiffLine[], collapseAfter: number): Block[] {
  const blocks: Block[] = []
  let context: DiffLine[] = []

  function flush(forceLines = false) {
    if (!context.length) return
    if (!forceLines && context.length > collapseAfter) blocks.push({ type: "collapse", lines: context })
    else blocks.push({ type: "lines", lines: context })
    context = []
  }

  for (const line of lines) {
    if (line.kind === "context") {
      context.push(line)
      continue
    }
    flush()
    const last = blocks[blocks.length - 1]
    if (last && last.type === "lines") last.lines.push(line)
    else blocks.push({ type: "lines", lines: [line] })
  }
  flush()
  return blocks
}

export function FileDiff({
  patch = "",
  lines,
  filename,
  collapseAfter = 5,
  expandLabel = "Show unchanged lines",
  collapseLabel = "Hide unchanged lines",
  additionsLabel = "additions",
  deletionsLabel = "deletions",
  className,
}: FileDiffProps) {
  const parsed = React.useMemo(() => lines ?? parseUnifiedDiff(patch), [lines, patch])
  const blocks = React.useMemo(() => groupLines(parsed, collapseAfter), [parsed, collapseAfter])
  const [open, setOpen] = React.useState<Record<number, boolean>>({})
  const additions = parsed.filter((line) => line.kind === "add").length
  const deletions = parsed.filter((line) => line.kind === "delete").length

  return (
    <figure data-slot="file-diff" className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <figcaption className="flex items-center gap-3 border-b border-border px-3 py-2 text-xs">
        <span className="min-w-0 flex-1 truncate font-mono">{filename ?? "diff"}</span>
        <span className="text-primary tabular-nums">+{additions} {additionsLabel}</span>
        <span className="text-destructive tabular-nums">−{deletions} {deletionsLabel}</span>
      </figcaption>
      <div className="overflow-x-auto font-mono text-[12.5px] leading-6">
        {blocks.map((block, index) => {
          if (block.type === "collapse" && !open[index]) {
            return (
              <button
                key={index}
                type="button"
                className="flex w-full items-center gap-2 bg-muted/50 px-3 py-1 text-left text-xs text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-expanded={false}
                onClick={() => setOpen((current) => ({ ...current, [index]: true }))}
              >
                <ChevronDown className="size-3 -rotate-90" />
                {expandLabel} ({block.lines.length})
              </button>
            )
          }
          const rows = block.type === "collapse" ? block.lines : block.lines
          return (
            <div key={index}>
              {block.type === "collapse" ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 bg-muted/50 px-3 py-1 text-left text-xs text-muted-foreground hover:bg-muted"
                  aria-expanded
                  onClick={() => setOpen((current) => ({ ...current, [index]: false }))}
                >
                  <ChevronDown className="size-3" />
                  {collapseLabel}
                </button>
              ) : null}
              {rows.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  data-kind={line.kind}
                  className={cn(
                    "grid grid-cols-[2.5rem_2.5rem_1fr] gap-2 px-2",
                    line.kind === "add" && "bg-primary/10",
                    line.kind === "delete" && "bg-destructive/10",
                    line.kind === "meta" && "bg-muted/40 text-muted-foreground",
                  )}
                >
                  <span className="text-right text-muted-foreground tabular-nums select-none" aria-hidden>
                    {line.oldNumber ?? ""}
                  </span>
                  <span className="text-right text-muted-foreground tabular-nums select-none" aria-hidden>
                    {line.newNumber ?? ""}
                  </span>
                  <span className="whitespace-pre">
                    <span className="select-none text-muted-foreground" aria-hidden>
                      {line.kind === "add" ? "+" : line.kind === "delete" ? "−" : line.kind === "meta" ? "" : " "}
                    </span>
                    {line.text || " "}
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </figure>
  )
}
