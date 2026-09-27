"use client"

import { Marker } from "@/registry/ui/marker"

export default function MarkerPreview() {
  return (
    <p className="bg-background p-4 text-sm leading-7">
      El plazo pasa a <Marker>cuarenta y cinco días</Marker> desde la firma.
    </p>
  )
}
