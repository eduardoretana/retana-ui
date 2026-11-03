import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Demo } from "@/app/examples/ci-checks-live/demo"

export const metadata: Metadata = {
  title: "CI Checks Live",
  description: "Demo funcional con datos ficticios del Taller Ladrillo.",
}

export default function ToolPage() {
  return (
    <ExampleFrame
      size="wide"
      title="CI Checks Live"
      description="Los checks de esta página son ficticios. La fusión está apagada. El panel nace cerrado. La instalación real está en la documentación."
    >
      <Demo />
    </ExampleFrame>
  )
}
