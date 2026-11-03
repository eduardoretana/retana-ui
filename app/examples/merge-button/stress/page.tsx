"use client"

import { StressCase } from "@/app/examples/stress-case"
import { MergeButton, mergeButtonLabelsEs } from "@/registry/ui/merge-button"

const long = "R".repeat(60)

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Botón de fusión</h1>
      <StressCase label="390 px" width={390}>
        <MergeButton phase="ready" labels={mergeButtonLabelsEs} />
        <MergeButton phase="rejected" reason={long} labels={mergeButtonLabelsEs} />
      </StressCase>
      <StressCase label="Deshabilitado, fusionando y fusionado" width={320}>
        <MergeButton phase="disabled" labels={mergeButtonLabelsEs} />
        <MergeButton phase="merging" labels={mergeButtonLabelsEs} />
        <MergeButton phase="merged" labels={mergeButtonLabelsEs} />
      </StressCase>
    </main>
  )
}
