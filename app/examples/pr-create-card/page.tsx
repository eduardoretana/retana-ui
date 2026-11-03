import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de pull request",
  description: "Un chip de diff que se abre en la tarjeta del pull request y su riel de commits.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame
      title="Tarjeta de pull request"
      description="Un chip de diff que se abre en la tarjeta del pull request y su riel de commits. Taller Ladrillo, datos inventados."
    >
      <Demo />
    </ExampleFrame>
  )
}
