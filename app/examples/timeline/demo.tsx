"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { people, unbreakable } from "@/app/examples/arc/demo-data"
import { Timeline, type TimelineEvent } from "@/registry/ui/timeline"

const now = Date.parse("2026-04-02T18:00:00Z")

const events: TimelineEvent[] = people.slice(0, 4).map((person, index) => ({
  id: person.id,
  at: now - index * 3_600_000 * (index === 3 ? 20 : 1),
  actor: person.name,
  title: index === 0 ? "cerró el horno" : "anotó el lote",
  meta: person.role,
  detail: index % 2 === 0 ? `Nota de ${person.role}.` : undefined,
  tone: index === 1 ? "success" : "neutral",
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <Timeline events={events} now={now} label="Bitácora del taller" maxHeight={360} />
      <StressCases
        empty={<Timeline events={[]} now={now} label="Vacía" />}
        long={<Timeline events={[{ id: "long", at: now, actor: unbreakable, title: unbreakable, detail: unbreakable }]} now={now} label="Larga" />}
        crowded={
          <Timeline
            events={people.map((person, index) => ({
              id: person.id,
              at: now - index * 60_000,
              actor: person.name,
              title: person.role,
              detail: person.role,
            }))}
            now={now}
            label="Diez"
            maxHeight={240}
          />
        }
      />
    </div>
  )
}
