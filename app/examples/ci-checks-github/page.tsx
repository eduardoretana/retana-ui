import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

export const metadata: Metadata = {
  title: "Adaptador de GitHub",
  description: "La red vive en el adaptador. El token no se lee del entorno aquí.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame
      title="Adaptador de GitHub"
      description="check-runs, commit statuses y el PUT de fusión. El ejemplo de ruta está en app/api/ci-checks."
    >
      <p className="text-sm text-muted-foreground">
        Permisos mínimos: checks:read, statuses:read, pull_requests:read. contents:write solo si se enciende la fusión.
      </p>
    </ExampleFrame>
  )
}
