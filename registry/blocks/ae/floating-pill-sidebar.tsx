"use client"

/** Clean-room AE dashboard piece. A floating vertical pill of icon links. Theme tokens only. */

import type { ComponentType, SVGProps } from "react"

import { cn } from "@/lib/utils"

export type FloatingPillItem = { id: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>>; href?: string }

export type FloatingPillSidebarProps = {
  items: FloatingPillItem[]
  active: string
  onNavigate?: (id: string) => void
  footer?: FloatingPillItem[]
  /** "horizontal" lays the pill out as a row, for small screens. */
  orientation?: "vertical" | "horizontal"
  className?: string
}

function PillLink({ item, current, onNavigate }: { item: FloatingPillItem; current: boolean; onNavigate?: (id: string) => void }) {
  const Icon = item.icon
  return (
    <li>
      <a
        href={item.href ?? `#${item.id}`}
        aria-label={item.label}
        title={item.label}
        aria-current={current ? "page" : undefined}
        onClick={(event) => {
          if (onNavigate) {
            event.preventDefault()
            onNavigate(item.id)
          }
        }}
        className={cn("grid size-11 shrink-0 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none", current ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
      >
        <Icon aria-hidden className="size-5" />
      </a>
    </li>
  )
}

export function FloatingPillSidebar({ items, active, onNavigate, footer = [], orientation = "vertical", className }: FloatingPillSidebarProps) {
  return (
    <nav aria-label="Secciones" data-slot="floating-pill-sidebar" data-orientation={orientation} className={cn("flex items-center justify-between rounded-full border border-border/60 bg-card p-2 shadow-md", orientation === "vertical" ? "w-fit flex-col gap-6" : "w-full max-w-full flex-row gap-2 overflow-x-auto", className)}>
      <ul className={cn("flex items-center gap-2", orientation === "vertical" && "flex-col")}>
        {items.map((item) => (
          <PillLink key={item.id} item={item} current={item.id === active} onNavigate={onNavigate} />
        ))}
      </ul>
      {footer.length ? (
        <ul className={cn("flex items-center gap-2", orientation === "vertical" && "flex-col")}>
          {footer.map((item) => (
            <PillLink key={item.id} item={item} current={item.id === active} onNavigate={onNavigate} />
          ))}
        </ul>
      ) : null}
    </nav>
  )
}
