"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, unbreakable } from "@/app/examples/arc/demo-data"
import { ChangelogFeed, type ChangelogEntry } from "@/registry/blocks/changelog-feed"

const longEntry: ChangelogEntry = {
  id: "long",
  month: "2026-09",
  date: "Sep 1",
  iso: "2026-09-01",
  version: "4.0.0",
  kind: "new",
  title: unbreakable,
  summary: unbreakable,
  details: [unbreakable],
}

const crowd: ChangelogEntry[] = Array.from({ length: 10 }, (_, index) => ({
  id: `crowd-${index}`,
  month: "2026-09",
  date: "Sep 1",
  iso: "2026-09-01",
  version: "4.0.0",
  kind: "improved" as const,
  title: `Nota ${index + 1}`,
  summary: atelier.kiln,
  details: [atelier.city],
}))

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <ChangelogFeed />
      <StressCases
        empty={<ChangelogFeed entries={[]} subtitle="" endNote="Nada publicado todavía." className="h-80" />}
        long={<ChangelogFeed entries={[longEntry]} months={[{ key: "2026-09", label: "September 2026", short: "Sep" }]} title={unbreakable} className="h-80" />}
        crowded={<ChangelogFeed entries={crowd} months={[{ key: "2026-09", label: "September 2026", short: "Sep" }]} className="h-80" />}
      />
    </div>
  )
}
