import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Hook de cámara",
  description: "Arranca, detiene y cambia la cámara. Los tracks se cierran al desmontar.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Hook de cámara" description="Arranca, detiene y cambia la cámara. Los tracks se cierran al desmontar.">
      <Demo />
    </ExampleFrame>
  )
}
