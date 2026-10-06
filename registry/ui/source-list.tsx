"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/conversation/sources/sources.tsx

import * as React from "react"
import { ArrowUpRight, ChevronDown } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ConfidenceBadge } from "@/registry/retana/ui/confidence-badge"

export type SourceItem = {
  id: string
  title: string
  url?: string
  domain?: string
  excerpt?: string
  favicon?: string
  score?: number
  type?: "web" | "image" | "news"
  detail?: string
  icon?: React.ReactNode
}

export type SourceListProps = {
  sources: SourceItem[]
  highlightId?: string
  target?: string
  defaultOpen?: boolean
  /** citations is the collapsible source list. links is a flat reference list. */
  variant?: "citations" | "links"
  className?: string
  classNames?: { root?: string; row?: string }
}

export function SourceList({ sources, highlightId, target = "_blank", defaultOpen = false, variant = "citations", className, classNames }: SourceListProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const types = [...new Set(sources.map((source) => source.type).filter(Boolean))] as SourceItem["type"][]
  const contentId = React.useId()

  const list = (items: SourceItem[]) => (
    <ol className="flex flex-col gap-2">
      {items.map((source, index) => {
        const number = sources.findIndex((item) => item.id === source.id) + 1
        const highlighted = highlightId === source.id
        return (
          <li
            key={source.id}
            id={`source-${source.id}`}
            className={cn(
              "flex min-w-0 flex-col gap-1 rounded-md p-2",
              highlighted && "bg-accent motion-safe:animate-in motion-safe:fade-in-0",
              classNames?.row,
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">[{number || index + 1}]</span>
              {source.favicon ? (
                // Favicons are host-provided URLs. The box stays a semantic token if the image fails.
                <span className="size-4 shrink-0 overflow-hidden rounded-sm bg-muted" aria-hidden="true">
                  <img src={source.favicon} alt="" className="size-4" />
                </span>
              ) : (
                <span aria-hidden="true" className="size-4 shrink-0 rounded-sm bg-muted" />
              )}
              {source.url ? (
                <a
                  href={source.url}
                  target={target}
                  rel={target === "_blank" ? "noreferrer" : undefined}
                  className="min-w-0 truncate font-medium text-foreground underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={target === "_blank" ? `${source.title} (opens in new tab)` : source.title}
                >
                  {source.title}
                </a>
              ) : (
                <span className="min-w-0 truncate font-medium">{source.title}</span>
              )}
            </div>
            {source.domain ? <p className="truncate text-xs text-muted-foreground">{source.domain}</p> : null}
            {source.excerpt ? <p className="line-clamp-2 text-sm text-muted-foreground">{source.excerpt}</p> : null}
            {source.score != null ? <ConfidenceBadge score={source.score} /> : null}
          </li>
        )
      })}
    </ol>
  )

  if (variant === "links") {
    return (
      <ul data-slot="source-list" data-variant="links" className={cn("flex flex-col gap-1", className, classNames?.root)}>
        {sources.map((source) => {
          const row = (
            <>
              <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted [&_svg]:size-4">
                {source.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{source.title}</span>
                {source.detail || source.domain ? <span className="block truncate text-xs text-muted-foreground">{source.detail ?? source.domain}</span> : null}
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </>
          )
          return (
            <li key={source.id} className={classNames?.row}>
              {source.url ? (
                <a href={source.url} target={target} rel={target === "_blank" ? "noreferrer" : undefined} className="flex items-center gap-2 rounded-lg bg-card px-2 py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  {row}
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-card px-2 py-2">{row}</div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn("rounded-lg border border-border", className, classNames?.root)}>
      <CollapsibleTrigger
        aria-controls={contentId}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="flex -space-x-1" aria-hidden="true">
          {sources.slice(0, 3).map((source) => (
            <span key={source.id} className="size-4 rounded-full border border-background bg-muted" />
          ))}
        </span>
        Used {sources.length} sources
        <ChevronDown aria-hidden="true" className={cn("ml-auto size-4 transition-transform motion-reduce:transition-none", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent id={contentId} className="px-3 pb-3">
        {types.length > 1 ? (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {types.map((type) => (
                <TabsTrigger key={type} value={type ?? "web"}>
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all">{list(sources)}</TabsContent>
            {types.map((type) => (
              <TabsContent key={type} value={type ?? "web"}>
                {list(sources.filter((source) => source.type === type))}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          list(sources)
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
