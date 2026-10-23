"use client"

/** Clean-room AE dashboard piece. Ranking of advisors. Theme tokens only. */

import { Trophy } from "lucide-react"

import { cn } from "@/lib/utils"
import { initials } from "@/registry/retana/lib/ae-dash"
import { AeCard, AeEmpty } from "@/registry/retana/blocks/ae/card-shell"

export type Leader = { id: string; name: string; region?: string; score: number; closed?: number }

export type LeaderboardCardProps = { title?: string; leaders: Leader[]; scoreLabel?: string; highlightId?: string; className?: string }

export function LeaderboardCard({ title = "Ranking de asesores", leaders, scoreLabel = "pts", highlightId, className }: LeaderboardCardProps) {
  const sorted = [...leaders].sort((a, b) => b.score - a.score)
  return (
    <AeCard title={title} className={className} action={<Trophy aria-hidden className="size-5 text-primary" />}>
      {sorted.length === 0 ? (
        <AeEmpty>Aún no hay ranking.</AeEmpty>
      ) : (
        <ol className="grid gap-2">
          {sorted.map((leader, index) => {
            const me = leader.id === highlightId
            return (
              <li key={leader.id} aria-current={me ? "true" : undefined} className={cn("flex min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5", index === 0 ? "bg-primary/10" : "bg-muted/50", me && "ring-2 ring-primary")}>
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums", index === 0 ? "bg-primary text-primary-foreground" : "bg-background text-foreground")}>
                  <span className="sr-only">Lugar </span>
                  {index + 1}
                </span>
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">{initials(leader.name)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{leader.name}</span>
                  {leader.region ? <span className={cn("block truncate text-xs", index === 0 ? "text-foreground" : "text-muted-foreground")}>{leader.region}{leader.closed !== undefined ? ` · ${leader.closed} expedientes` : ""}</span> : null}
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {leader.score.toLocaleString("es-MX")} <span className={cn("text-xs font-normal", index === 0 ? "text-foreground" : "text-muted-foreground")}>{scoreLabel}</span>
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </AeCard>
  )
}
