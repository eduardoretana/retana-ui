"use client"

import { Columns3, Frame, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ViewCustomizer, ViewSwitcher } from "@/registry/ui/view-customizer"

const views = [
  { id: "board", label: "Tablero", icon: <Columns3 className="size-4" /> },
  { id: "canvas", label: "Lienzo", icon: <Frame className="size-4" /> },
]

export default function Preview() {
  return (
    <div className="flex h-full items-end justify-center bg-muted/40 p-4">
      <ViewSwitcher
        views={views}
        value="canvas"
        menu={
          <ViewCustomizer title="Vistas" subtitle="Colección Niebla" views={views} enabled={["board", "canvas"]} onEnabledChange={() => undefined} footer="En este proyecto.">
            <Button type="button" variant="outline" size="icon" className="rounded-full" aria-label="Vistas">
              <MoreHorizontal />
            </Button>
          </ViewCustomizer>
        }
      />
    </div>
  )
}
