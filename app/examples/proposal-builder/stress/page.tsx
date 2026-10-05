"use client"

import { ProposalBuilderDemo, StressFrame } from "@/app/examples/proposal/screens"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Constructor de propuestas</h1>
      <StressFrame label="320px"><ProposalBuilderDemo contained /></StressFrame>
      <section dir="rtl" className="grid gap-2">
        <h2 className="text-sm font-medium">RTL</h2>
        <div className="w-80 overflow-auto rounded-xl border border-border p-2"><ProposalBuilderDemo contained /></div>
      </section>
    </main>
  )
}
