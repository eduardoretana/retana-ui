"use client"

/** Clean-room AE dashboard piece. A ranked "map-ish" list of clients per state. Theme tokens only. */

import { motion, useReducedMotion } from "motion/react"
import { MapPin } from "lucide-react"

import { growTransition } from "@/registry/retana/lib/ae-dash"
import { AeCard, AeEmpty } from "@/registry/retana/blocks/ae/card-shell"

export type StateDistributionCardProps = { title?: string; items: { label: string; value: number }[]; unit?: string; className?: string }

export function StateDistributionCard({ title = "Clientes por estado", items, unit = "clientes", className }: StateDistributionCardProps) {
  const reduce = !!useReducedMotion()
  const max = Math.max(1, ...items.map((item) => item.value))
  const total = items.reduce((sum, item) => sum + item.value, 0)
  return (
    <AeCard title={title} className={className} action={<span className="text-xs text-muted-foreground tabular-nums">{total.toLocaleString("es-MX")} {unit}</span>}>
      {items.length === 0 ? (
        <AeEmpty>Aún no hay clientes con estado.</AeEmpty>
      ) : (
        <ol className="grid gap-3">
          {items.map((item, index) => (
            <li key={item.label} className="grid min-w-0 gap-1.5">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <MapPin aria-hidden className={index === 0 ? "size-4 shrink-0 text-primary" : "size-4 shrink-0 text-muted-foreground"} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span className="font-semibold tabular-nums">{item.value.toLocaleString("es-MX")}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
                <motion.div className={index === 0 ? "h-full rounded-full bg-primary" : "h-full rounded-full bg-foreground/70"} style={{ originX: 0 }} initial={{ scaleX: reduce ? item.value / max : 0 }} animate={{ scaleX: item.value / max }} transition={growTransition(reduce, index)} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </AeCard>
  )
}
