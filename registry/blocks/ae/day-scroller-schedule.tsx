"use client"

/** Clean-room AE dashboard piece. A horizontal day picker with the next appointment in a dark nested card. Theme tokens only. */

import { useRef, useState, type KeyboardEvent } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Clock, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { AvatarGroup } from "@/registry/retana/ui/avatar-group"
import { AeCard, AeEmpty } from "@/registry/retana/blocks/ae/card-shell"

export type ScheduleDay = { id: string; weekday: string; day: number }
export type ScheduleItem = { id: string; day: string; time: string; title: string; client: string; people: string[]; place: string }

export type DayScrollerScheduleProps = {
  title?: string
  days: ScheduleDay[]
  items: ScheduleItem[]
  defaultDay?: string
  onSelectDay?: (day: string) => void
  className?: string
}

export function DayScrollerSchedule({ title = "Agenda de citas", days, items, defaultDay, onSelectDay, className }: DayScrollerScheduleProps) {
  const reduce = !!useReducedMotion()
  const [selected, setSelected] = useState(defaultDay ?? days[0]?.id ?? "")
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const dayItems = items.filter((item) => item.day === selected).sort((a, b) => a.time.localeCompare(b.time))
  const [next, ...rest] = dayItems
  const pick = (id: string) => {
    setSelected(id)
    onSelectDay?.(id)
  }
  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const to = ({ ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: days.length - 1 } as Record<string, number>)[event.key]
    if (to === undefined) return
    event.preventDefault()
    const clamped = Math.max(0, Math.min(days.length - 1, to))
    pick(days[clamped].id)
    refs.current[clamped]?.focus()
  }
  return (
    <AeCard title={title} className={className}>
      <div role="tablist" aria-label="Días" className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {days.map((day, index) => {
          const active = day.id === selected
          const count = items.filter((item) => item.day === day.id).length
          return (
            <button
              key={day.id}
              ref={(node) => {
                refs.current[index] = node
              }}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              aria-label={`${day.weekday} ${day.day}, ${count} ${count === 1 ? "cita" : "citas"}`}
              onClick={() => pick(day.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "relative flex w-14 shrink-0 snap-start flex-col items-center gap-1 rounded-full px-2 py-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="text-xs">{day.weekday}</span>
              <span className="text-lg font-bold tabular-nums">{day.day}</span>
              <span aria-hidden className={cn("size-1 rounded-full", count ? (active ? "bg-primary-foreground" : "bg-primary") : "bg-transparent")} />
            </button>
          )
        })}
      </div>
      <div role="tabpanel" aria-label="Citas del día" className="grid gap-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={selected} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.22 }} className="grid gap-3">
            {!next ? (
              <AeEmpty>No hay citas este día.</AeEmpty>
            ) : (
              <>
                <article aria-label={`Próxima cita: ${next.title}`} className="grid gap-3 rounded-3xl bg-foreground p-5 text-background shadow-lg">
                  <p className="text-xs font-medium tracking-wide uppercase opacity-70">Próxima cita</p>
                  <h4 className="text-lg leading-tight font-semibold">{next.title}</h4>
                  <p className="text-sm opacity-80">con {next.client}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-80">
                    <span className="inline-flex items-center gap-1">
                      <Clock aria-hidden className="size-3.5" />
                      {next.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin aria-hidden className="size-3.5" />
                      {next.place}
                    </span>
                  </div>
                  <AvatarGroup members={next.people.map((name) => ({ name }))} max={4} size="sm" label="Participantes" />
                </article>
                {rest.map((item) => (
                  <div key={item.id} className="flex min-w-0 items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3 text-sm">
                    <span className="font-semibold tabular-nums">{item.time}</span>
                    <span className="min-w-0 flex-1 truncate">{item.title} · {item.client}</span>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AeCard>
  )
}
