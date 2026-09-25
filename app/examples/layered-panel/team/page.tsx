import { Suspense } from "react"
import type { Metadata } from "next"

import { TeamDashboard } from "@/components/demo/team-dashboard"

export const metadata: Metadata = {
  title: "Team example",
  description: "Layered panel on a team directory. Peek a member, then expand the profile in place.",
}

export default function TeamExamplePage() {
  return (
    <Suspense fallback={<ExampleFallback label="Loading team…" />}>
      <TeamDashboard />
    </Suspense>
  )
}

function ExampleFallback({ label }: { label: string }) {
  return (
    <div className="grid h-dvh place-items-center text-sm text-muted-foreground">{label}</div>
  )
}
