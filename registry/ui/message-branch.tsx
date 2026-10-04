"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/conversation/branch/branch.tsx

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type MessageBranchClassNames = {
  root?: string
  content?: string
  selector?: string
  page?: string
}

export type MessageBranchProps = {
  count: number
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  followNewest?: boolean
  hideWhenSingle?: boolean
  children?: React.ReactNode
  label?: string
  className?: string
  classNames?: MessageBranchClassNames
}

function clamp(index: number, count: number) {
  if (count <= 0) return 0
  return Math.min(Math.max(index, 0), count - 1)
}

export function MessageBranch({
  count,
  index,
  defaultIndex = 0,
  onIndexChange,
  followNewest = true,
  hideWhenSingle = true,
  children,
  label = "Response versions",
  className,
  classNames,
}: MessageBranchProps) {
  const [internal, setInternal] = React.useState(() => clamp(defaultIndex, count))
  const [seenCount, setSeenCount] = React.useState(count)
  if (count !== seenCount) {
    setSeenCount(count)
    if (index === undefined) {
      const next = count > seenCount && followNewest ? Math.max(0, count - 1) : clamp(internal, count)
      if (next !== internal) setInternal(next)
    }
  }
  const current = clamp(index ?? internal, count)
  const items = React.Children.toArray(children)

  const go = (next: number) => {
    const clamped = clamp(next, count)
    if (index === undefined) setInternal(clamped)
    onIndexChange?.(clamped)
  }

  const showSelector = !(hideWhenSingle && count <= 1)

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className, classNames?.root)}>
      <div className={cn("min-w-0", classNames?.content)}>{items[current] ?? null}</div>
      {showSelector ? (
        <div
          role="group"
          aria-label={label}
          className={cn("flex items-center gap-1", classNames?.selector)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault()
              go(current - 1)
            }
            if (event.key === "ArrowRight") {
              event.preventDefault()
              go(current + 1)
            }
          }}
        >
          <Button type="button" variant="outline" size="icon-sm" aria-label="Previous version" disabled={current <= 0} onClick={() => go(current - 1)}>
            <ChevronLeft data-icon="inline-start" />
          </Button>
          <span aria-live="polite" className={cn("min-w-16 text-center text-xs text-muted-foreground tabular-nums", classNames?.page)}>
            Version {current + 1} of {count}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next version"
            disabled={current >= count - 1}
            onClick={() => go(current + 1)}
          >
            <ChevronRight data-icon="inline-start" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function MessageBranchContent({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function MessageBranchSelector(props: Omit<MessageBranchProps, "children">) {
  return <MessageBranch {...props} />
}
