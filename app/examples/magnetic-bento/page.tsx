import type { Metadata } from "next"
import Link from "next/link"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Rejilla magnética",
  description: "Un resalte compartido que se desliza entre las tarjetas.",
}

export default function MagneticBentoPage() {
  return (
    <ExampleFrame
      wide
      title="Rejilla magnética"
      description="El resalte sigue a la tarjeta bajo el puntero, el foco o un toque, y se queda ahí al salir de la rejilla."
    >
      <p className="max-w-3xl text-sm text-muted-foreground">
        En Chrome desde mediados de 2024, Safari desde septiembre de 2025 y Firefox 147, el resalte usa anclaje CSS (
        <code>anchor-name</code>, <code>position-anchor</code>, <code>inset: anchor(inside)</code>). Si{" "}
        <code>CSS.supports(&apos;anchor-name: --x&apos;)</code> es falso, la misma pieza mide la tarjeta. La idea del
        anclaje es de{" "}
        <a
          href="https://x.com/jh3yy/status/2105823926978814273"
          className="underline underline-offset-2"
        >
          jh3yy
        </a>
        . Los casos de estrés están en{" "}
        <Link href="/examples/magnetic-bento/stress" className="underline underline-offset-2">
          320px, RTL y títulos largos
        </Link>
        .
      </p>
      <Demo />
    </ExampleFrame>
  )
}
