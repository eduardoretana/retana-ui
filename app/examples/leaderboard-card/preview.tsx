"use client"

import { aeLeaders } from "@/registry/lib/ae-dash-data"
import { AeStagger } from "@/registry/blocks/ae/card-shell"
import { LeaderboardCard } from "@/registry/blocks/ae/leaderboard-card"

export default function Preview() {
  return (
    <div className="ae-ember flex h-full items-center justify-center overflow-hidden bg-muted/50 p-3">
      <AeStagger className="w-full max-w-sm">
        <LeaderboardCard leaders={aeLeaders} highlightId="a1" />
      </AeStagger>
    </div>
  )
}
