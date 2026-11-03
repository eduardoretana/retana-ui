"use client"

import { StressCase } from "@/app/examples/stress-case"
import { CiChecksLive, ciChecksLiveLabelsEs } from "@/registry/blocks/ci-checks-live"

import { filled, fixtureTransport } from "../transport"

const many = {
  ...filled.snapshot,
  total: 50,
  passed: 49,
  checks: Array.from({ length: 50 }, (_, index) => ({
    id: `c-${index}`,
    name: index === 0 ? "X".repeat(60) : `check-${index}`,
    status: index === 49 ? "failed" as const : "passed" as const,
    source: "check-run" as const,
    startedAt: null,
    completedAt: null,
    durationMs: 1000,
    url: null,
    description: null,
  })),
}

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · CI Checks Live</h1>
      <StressCase label="390 px y 50 checks" width={390}>
        <CiChecksLive transport={fixtureTransport({ snapshot: many })} labels={ciChecksLiveLabelsEs} now={Date.parse("2026-11-02T15:00:30Z")} />
      </StressCase>
    </main>
  )
}
