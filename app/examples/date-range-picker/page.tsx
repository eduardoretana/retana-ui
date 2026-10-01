import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Rango de fechas",
  description: "Dos meses, atajos y teclado.",
}

export default function DateRangePickerPage() {
  return (
    <ExampleFrame title="Rango de fechas" description="El disparador crece hasta el panel. Hay atajos, dos meses cuando cabe, y las flechas mueven el día." wide>
      <Demo />
    </ExampleFrame>
  )
}
