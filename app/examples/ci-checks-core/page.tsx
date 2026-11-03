import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { normalizeCheckRunsPayload } from "@/registry/lib/ci-checks"

export const metadata: Metadata = {
  title: "Núcleo de comprobaciones",
  description: "TypeScript puro. No llama a la red ni importa React.",
}

export default function ExamplePage() {
  const checks = normalizeCheckRunsPayload({
    check_runs: [{ id: 4, name: "lint", status: "completed", conclusion: "success" }],
  })
  return (
    <ExampleFrame title="Núcleo de comprobaciones" description="Normaliza checks y statuses. El token no vive aquí.">
      <p className="text-sm text-foreground">
        Ejemplo ficticio: {checks[0]?.name} quedó en {checks[0]?.status}.
      </p>
    </ExampleFrame>
  )
}
