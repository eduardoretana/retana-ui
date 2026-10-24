"use client"

import { aeLeaders } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { LeaderboardCard } from "@/registry/blocks/ae/leaderboard-card"

export function Demo() {
  return (
    <div className="ae-ember rounded-[2rem] bg-muted/50 p-6">
      <AeStagger className="mx-auto max-w-md">
        <LeaderboardCard leaders={aeLeaders} highlightId="a1" />
      </AeStagger>
    </div>
  )
}
