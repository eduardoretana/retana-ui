"use client"

import { normalizeCheckRunsPayload } from "@/registry/lib/ci-checks"

const sample = {
  check_runs: [
    { id: 4, name: "lint", status: "completed", conclusion: "success", started_at: "2018-05-04T01:14:52Z", completed_at: "2018-05-04T01:14:52Z" },
  ],
}

export default function Preview() {
  const checks = normalizeCheckRunsPayload(sample)
  return (
    <p className="text-sm text-foreground">
      {checks[0]?.name} · {checks[0]?.status}
    </p>
  )
}
