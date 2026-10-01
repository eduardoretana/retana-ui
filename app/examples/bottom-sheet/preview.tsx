"use client"

import { atelier } from "@/app/examples/arc/demo-data"
import { Button } from "@/components/ui/button"
import { BottomSheet } from "@/registry/ui/bottom-sheet"

export default function BottomSheetPreview() {
  return (
    <div className="flex h-full items-center bg-background p-3">
      <BottomSheet title={atelier.kiln} description={atelier.city} className="max-w-full" trigger={<Button variant="outline" className="w-full">Abrir hoja</Button>}>
        <p className="text-sm text-muted-foreground">Seis piezas en el estante de arriba.</p>
      </BottomSheet>
    </div>
  )
}
