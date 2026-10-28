import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Abanico de trabajo",
  description: "Ocho muestras para León repartidas entre Horno y Caja.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Abanico de trabajo"
      description="Abre una muestra o reintenta la tapa. El primer reintento en Reintento se deshace."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
