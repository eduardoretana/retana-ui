"use client"

/** Clean-room AE dashboard piece. Centered pill navigation with a sliding active pill. Theme tokens only. */

import { useId, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Bell, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { initials } from "@/registry/retana/lib/ae-dash"

export type PillNavItem = { id: string; label: string; href?: string }

export type PillTopNavProps = {
  brand?: ReactNode
  items: PillNavItem[]
  active: string
  onNavigate?: (id: string) => void
  user?: { name: string }
  unread?: number
  onSearch?: () => void
  onNotifications?: () => void
  className?: string
}

export function PillTopNav({ brand, items, active, onNavigate, user, unread = 0, onSearch, onNotifications, className }: PillTopNavProps) {
  const reduce = !!useReducedMotion()
  const layoutId = useId()
  return (
    <header data-slot="pill-top-nav" className={cn("flex min-w-0 flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2 text-lg font-bold">{brand}</div>
      <nav aria-label="Principal" className="order-last w-full overflow-x-auto md:order-none md:w-auto">
        <ul className="flex w-max items-center gap-1 rounded-full border border-border/60 bg-card p-1 shadow-sm">
          {items.map((item) => {
            const current = item.id === active
            return (
              <li key={item.id} className="relative">
                {current ? <motion.span layoutId={reduce ? undefined : layoutId} aria-hidden className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", visualDuration: 0.3, bounce: 0.15 }} /> : null}
                <a
                  href={item.href ?? `#${item.id}`}
                  aria-current={current ? "page" : undefined}
                  onClick={(event) => {
                    if (onNavigate) {
                      event.preventDefault()
                      onNavigate(item.id)
                    }
                  }}
                  className={cn("relative block rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", current ? "text-background" : "text-muted-foreground hover:text-foreground")}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Buscar" onClick={onSearch} className="grid size-10 place-items-center rounded-full border border-border/60 bg-card shadow-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          <Search aria-hidden className="size-4" />
        </button>
        <button type="button" aria-label={unread ? `Notificaciones, ${unread} sin leer` : "Notificaciones"} onClick={onNotifications} className="relative grid size-10 place-items-center rounded-full border border-border/60 bg-card shadow-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          <Bell aria-hidden className="size-4" />
          {unread ? <span aria-hidden className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-card" /> : null}
        </button>
        {user ? (
          <span role="img" aria-label={user.name} className="grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials(user.name)}
          </span>
        ) : null}
      </div>
    </header>
  )
}
