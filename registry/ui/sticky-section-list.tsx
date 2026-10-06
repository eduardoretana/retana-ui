"use client"

/**
 * Grouped list whose headers stick until the next group pushes them.
 * Clean-room. Sticky positioning only — there is no tween to disable.
 */

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type StickySectionItem = {
  id: string
  title: string
  detail?: ReactNode
}

export type StickySection = {
  id: string
  label: string
  items: StickySectionItem[]
}

export type StickySectionListProps = {
  sections: StickySection[]
  /** Accessible name for the whole list. */
  label?: string
  emptyLabel?: string
  className?: string
  headerClassName?: string
  itemClassName?: string
  /** Distance from the top of the scrollport, in pixels. */
  offset?: number
}

export function StickySectionList({
  sections,
  label = "Grouped list",
  emptyLabel = "Nothing in this group",
  className,
  headerClassName,
  itemClassName,
  offset = 0,
}: StickySectionListProps) {
  if (!sections.length) {
    return (
      <p data-slot="sticky-section-list" data-state="empty" className={cn("text-sm text-muted-foreground", className)}>
        {emptyLabel}
      </p>
    )
  }

  return (
    <div data-slot="sticky-section-list" aria-label={label} className={cn("min-w-0", className)}>
      {sections.map((section) => {
        const headingId = `sticky-section-${section.id.replace(/[^a-zA-Z0-9_-]/g, "")}`
        return (
          <section key={section.id} aria-labelledby={headingId}>
            <h3
              id={headingId}
              className={cn(
                "sticky z-10 border-b border-border bg-background px-3 py-2 text-sm font-medium [overflow-wrap:anywhere]",
                headerClassName,
              )}
              style={{ top: offset }}
            >
              {section.label}
            </h3>
            {section.items.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">{emptyLabel}</p>
            ) : (
              <ul>
                {section.items.map((item) => (
                  <li key={item.id} className={cn("min-w-0 border-b border-border px-3 py-3", itemClassName)}>
                    <p className="text-sm [overflow-wrap:anywhere]">{item.title}</p>
                    {item.detail != null && item.detail !== "" ? (
                      <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{item.detail}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
