import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Contacto",
  description: "Un formulario que se valida y se vuelve una confirmación.",
}

export default function ContactSectionPage() {
  return (
    <ExampleFrame wide title="Contacto" description="El formulario pide nombre, correo y un mensaje. Al enviarlo, la tarjeta confirma.">
      <Demo />
    </ExampleFrame>
  )
}
