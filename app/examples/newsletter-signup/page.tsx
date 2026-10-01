import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Boletín",
  description: "La siguiente edición llega al suscribirte.",
}

export default function NewsletterSignupPage() {
  return (
    <ExampleFrame title="Boletín" description="Al suscribirte, la próxima edición cae al frente del montón y el conteo sube uno.">
      <Demo />
    </ExampleFrame>
  )
}
