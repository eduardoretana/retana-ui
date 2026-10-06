"use client"

import { AccentCalloutStress as Stress } from "@/app/examples/review/stress-views"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Aviso de acento</h1>
      <Stress />
    </main>
  )
}
