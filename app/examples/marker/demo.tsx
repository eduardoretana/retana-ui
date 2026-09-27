"use client"

import { Marker } from "@/registry/ui/marker"

export function Demo() {
  return (
    <p className="max-w-prose text-base leading-8">
      Nube marcó la frase del anexo: la entrega será en <Marker>cuarenta y cinco días</Marker> y la cláusula de pago{" "}
      <Marker highlightClassName="bg-destructive/20">no se modifica</Marker>.
    </p>
  )
}
