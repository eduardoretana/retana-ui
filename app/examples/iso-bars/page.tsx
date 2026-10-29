import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barras isométricas",
  description: "El periodo cambia la altura. Las barras que no están en curso quedan en contorno.",
}

export default function Page() {
  return (
    <ExampleFrame title="Barras isométricas" description="El periodo cambia la altura. Las barras que no están en curso quedan en contorno.">
      <Demo />
    </ExampleFrame>
  )
}
