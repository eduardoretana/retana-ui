"use client"

import { StressCase } from "@/app/examples/stress-case"
import { CiChecksStory, ciChecksStoryLabelsEs } from "@/registry/blocks/ci-checks-story"

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Escenario de comprobaciones</h1>
      <StressCase label="390 px, fallo" width={390}>
        <CiChecksStory phase="failing" labels={ciChecksStoryLabelsEs} />
      </StressCase>
      <StressCase label="390 px, variante compacta" width={390}>
        <CiChecksStory phase="fixing" variant="compact" labels={ciChecksStoryLabelsEs} />
      </StressCase>
      <StressCase label="Vacío" width={320}>
        <CiChecksStory phase="empty" labels={ciChecksStoryLabelsEs} />
      </StressCase>
    </main>
  )
}
