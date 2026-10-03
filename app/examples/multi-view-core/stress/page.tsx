"use client"

import { ExampleFrame } from "@/app/examples/example-frame"
import { scaleRecords } from "@/app/examples/multi-view/data"
import { searchRecords } from "@/registry/lib/multi-view"
import { opportunityFields } from "@/app/examples/multi-view/data"

export default function MultiViewCoreStressPage() {
  const many = scaleRecords("opportunities", "200")
  const found = searchRecords(many, opportunityFields, "a", "en-US")
  return (
    <ExampleFrame title="Multi-view core stress" description="La búsqueda sobre 200 filas cabe en un contenedor de 320px.">
      <div className="w-[320px] max-w-full rounded-lg border border-border p-2 text-sm">{found.length} matches</div>
    </ExampleFrame>
  )
}
