"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/artifacts/artifact/artifact.tsx

import * as React from "react"
import { Download, RefreshCw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/registry/retana/ui/copy-button"

export type ArtifactAction = {
  id: string
  label: string
  icon?: React.ReactNode
  onSelect: () => void
}

export type ArtifactPanelProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  content?: string
  fileName?: string
  mimeType?: string
  actions?: ArtifactAction[]
  onRefresh?: () => void
  children?: React.ReactNode
  className?: string
}

function useNarrow() {
  const [narrow, setNarrow] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)")
    const apply = () => setNarrow(query.matches)
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])
  return narrow
}

export function downloadArtifact(content: string, fileName: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function Toolbar({
  title,
  description,
  content,
  fileName,
  mimeType,
  actions,
  onRefresh,
  onClose,
}: ArtifactPanelProps & { onClose: () => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 border-b border-border px-3 py-2">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{title}</p>
          {description ? <p className="truncate text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {content ? <CopyButton value={content} iconOnly label="Copy" /> : null}
          {content && fileName ? (
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Download" onClick={() => downloadArtifact(content, fileName, mimeType)}>
              <Download data-icon="inline-start" />
            </Button>
          ) : null}
          {onRefresh ? (
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Refresh" onClick={onRefresh}>
              <RefreshCw data-icon="inline-start" />
            </Button>
          ) : null}
          {actions?.map((action) => (
            <Button key={action.id} type="button" size="sm" variant="ghost" aria-label={action.label} onClick={action.onSelect}>
              {action.icon}
              <span className="sr-only">{action.label}</span>
            </Button>
          ))}
          <Button type="button" size="icon-sm" variant="ghost" aria-label="Close" onClick={onClose}>
            <X data-icon="inline-start" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ArtifactPanel(props: ArtifactPanelProps) {
  const { open: openProp, defaultOpen = false, onOpenChange, children, className, title } = props
  const [internal, setInternal] = React.useState(defaultOpen)
  const open = openProp ?? internal
  const narrow = useNarrow()
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  const body = (
    <div className="min-h-0 flex-1 overflow-auto p-3 text-sm">
      {children ?? (props.content ? <pre className="overflow-auto font-mono text-xs">{props.content}</pre> : null)}
    </div>
  )

  if (!open) return null

  if (narrow) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className={cn("flex w-full flex-col gap-0 p-0 sm:max-w-md", className)} onKeyDown={(event) => event.key === "Escape" && setOpen(false)}>
          <SheetHeader className="sr-only">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <Toolbar {...props} onClose={() => setOpen(false)} />
          {body}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      className={cn("flex min-h-64 w-full min-w-80 flex-col rounded-xl border border-border bg-card", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false)
      }}
    >
      <Toolbar {...props} onClose={() => setOpen(false)} />
      {body}
    </aside>
  )
}
