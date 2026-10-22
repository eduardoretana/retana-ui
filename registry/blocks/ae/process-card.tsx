"use client"

/** Clean-room AE dashboard piece. A course or process card with members, progress and a round call to action. Theme tokens only. */

import { ArrowUpRight, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { AvatarGroup } from "@/registry/retana/ui/avatar-group"
import { AeCard } from "@/registry/retana/blocks/ae/card-shell"

export type ProcessCardProps = {
  title: string
  meta?: string
  progress: number
  people: string[]
  onOpen?: () => void
  highlighted?: boolean
  className?: string
}

export function ProcessCard({ title, meta, progress, people, onOpen, highlighted = false, className }: ProcessCardProps) {
  const value = Math.max(0, Math.min(100, Math.round(progress)))
  const done = value >= 100
  return (
    <AeCard as="article" label={title} className={cn(highlighted && "bg-primary/5 ring-1 ring-primary/30", className)}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base leading-snug font-semibold break-words">{title}</h3>
          {meta ? <p className="mt-1 text-xs text-muted-foreground">{meta}</p> : null}
        </div>
        <button
          type="button"
          onClick={onOpen}
          aria-label={done ? `Repasar ${title}` : `Continuar ${title}`}
          className={cn("grid size-11 shrink-0 place-items-center rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100", done ? "bg-muted text-foreground" : "bg-primary text-primary-foreground shadow-md")}
        >
          {done ? <Check aria-hidden className="size-5" /> : <ArrowUpRight aria-hidden className="size-5" />}
        </button>
      </div>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <AvatarGroup members={people.map((name) => ({ name }))} max={3} size="sm" label="Asesores inscritos" />
        <span className="text-sm font-semibold tabular-nums">{done ? "Completo" : `${value}%`}</span>
      </div>
      <div role="progressbar" aria-label={`Avance de ${title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${value}%` }} />
      </div>
    </AeCard>
  )
}
