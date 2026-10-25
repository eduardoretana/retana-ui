"use client"

import { AssessmentForm } from "@/registry/ui/assessment-form"
import type { AtsCriterion } from "@/registry/lib/ats"

import { demoCandidates, demoPeople } from "../../ats/data"

const token = "C".repeat(60)
const candidate = demoCandidates[0]!
const criteria: AtsCriterion[] = [
  { key: "vacio", label: "" },
  { key: "una", label: "Una" },
  { key: "larga", label: "Un criterio con varias frases para ver cómo se parte el renglón en el formulario." },
  { key: "token", label: token },
  { key: "emoji", label: "🎨 🙂 مرشح" },
]

export default function StressPage() {
  return (
    <main className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Evaluación</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Sin criterios</h2>
        <div className="h-64 overflow-hidden rounded-xl border border-border">
          <AssessmentForm candidate={{ ...candidate, name: "" }} criteria={[]} />
        </div>
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Token, emoji y 320px</h2>
        <div className="h-[36rem] w-full max-w-80 overflow-hidden rounded-xl border border-border">
          <AssessmentForm candidate={{ ...candidate, name: token }} criteria={criteria} author={demoPeople[0]} />
        </div>
      </section>
    </main>
  )
}
