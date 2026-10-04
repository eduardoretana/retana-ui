import type { Metadata } from "next"
import Link from "next/link"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Pila de avisos en profundidad",
  description: "Avisos en capas. Al descartar el de enfrente, el siguiente avanza.",
}

export default function NotificationStackPage() {
  return (
    <ExampleFrame
      title="Pila de avisos en profundidad"
      description="El de enfrente se descarta y el siguiente ocupa su lugar."
    >
      <p className="max-w-xl text-sm text-muted-foreground">
        No es toast-stack, ni el centro de avisos, ni card-stack. La inspiración visual es un reel de Design & Code
        With AV. No se usó su código. Los casos de estrés están en{" "}
        <Link href="/examples/notification-stack/stress" className="underline underline-offset-2">
          320px, vacío, RTL y cuarenta avisos
        </Link>
        .
      </p>
      <Demo />
    </ExampleFrame>
  )
}
