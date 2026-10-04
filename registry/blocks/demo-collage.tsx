"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/src/components/live-collage.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

export type DemoCollageItem = {
  name: string
  href: string
  render: () => React.ReactNode
}

export type DemoCollageProps = {
  items: DemoCollageItem[]
  ctaHref?: string
  ctaLabel?: string
  linkComponent?: React.ElementType<{ href: string; className?: string; children?: React.ReactNode }>
  className?: string
}

function Cell({ item, linkComponent: Link = "a" }: { item: DemoCollageItem; linkComponent?: DemoCollageProps["linkComponent"] }) {
  const ref = React.useRef<HTMLElement>(null)
  const [shown, setShown] = React.useState(false)
  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setShown(true)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <article ref={ref} className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-border bg-card">
      <Link href={item.href} className="flex items-center justify-between bg-muted/40 px-3 py-2 font-mono text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        {item.name}
        <span aria-hidden="true">↗</span>
      </Link>
      <div className="pointer-events-none p-3">{shown ? item.render() : <div className="h-16" />}</div>
    </article>
  )
}

export function DemoCollage({ items, ctaHref = "/", ctaLabel = "Explore all components", linkComponent: Link = "a", className }: DemoCollageProps) {
  return (
    <div className={cn("columns-1 gap-3 sm:columns-2", className)}>
      {items.map((item) => (
        <Cell key={item.name} item={item} linkComponent={Link} />
      ))}
      <Link href={ctaHref} className="mb-3 flex break-inside-avoid items-center justify-center rounded-xl border border-dashed border-border p-6 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        {ctaLabel}
      </Link>
    </div>
  )
}
