import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Pasos",
  description: "Un avance que deja volver a lo ya hecho.",
}

export default function StepperPage() {
  return (
    <ExampleFrame title="Pasos" description="El conector se llena al avanzar y un paso hecho se puede elegir de nuevo.">
      <Demo />
    </ExampleFrame>
  )
}
