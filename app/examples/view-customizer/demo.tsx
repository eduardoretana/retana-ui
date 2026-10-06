"use client"

import { Columns3, Frame, LayoutGrid, List, MoreHorizontal } from "lucide-react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { useMultiView } from "@/registry/hooks/use-multi-view"
import type { ViewConfig } from "@/registry/lib/multi-view"
import { Button } from "@/components/ui/button"
import { ViewCustomizer, ViewSwitcher, type ViewOption } from "@/registry/ui/view-customizer"

const views: ViewConfig[] = [
  { id: "list", kind: "grouped-list", label: "Lista" },
  { id: "grid", kind: "gallery", label: "Rejilla" },
  { id: "board", kind: "kanban", label: "Tablero" },
  { id: "canvas", kind: "timeline", label: "Lienzo" },
]

const icons: Record<string, ViewOption["icon"]> = {
  list: <List className="size-4" />,
  grid: <LayoutGrid className="size-4" />,
  board: <Columns3 className="size-4" />,
  canvas: <Frame className="size-4" />,
}

export function ViewCustomizerDemo() {
  const state = useMultiView({
    views,
    defaultViewId: "list",
    defaultEnabledViews: ["list"],
    persistViews: { scope: "project", id: "coleccion-niebla" },
  })
  const options: ViewOption[] = views.map((view) => ({ id: view.id, label: view.label, icon: icons[view.id] }))
  const enabled = options.filter((view) => state.enabledViews.includes(view.id))
  return (
    <ExampleFrame
      title="Vistas de la colección"
      description="Enciende las vistas de Colección Niebla. Con una sola no hay pastilla; a partir de dos, aparece y el botón de al lado se corre."
    >
      <div className="flex min-h-64 items-end justify-center rounded-xl border border-border bg-muted/40 p-6">
        <ViewSwitcher
          label="Vistas"
          addLabel="Nueva idea"
          onAdd={() => undefined}
          views={enabled}
          value={state.viewId}
          onValueChange={state.setViewId}
          menu={
            <ViewCustomizer
              title="Vistas"
              subtitle="Elige cómo mirar Colección Niebla."
              showAllLabel="Ver todas"
              minimumLabel="Al menos una vista sigue encendida."
              footer="Se guarda con este proyecto del taller."
              views={options}
              enabled={state.enabledViews}
              onEnabledChange={state.setEnabledViews}
            >
              <Button type="button" variant="outline" size="icon" className="rounded-full" aria-label="Vistas">
                <MoreHorizontal />
              </Button>
            </ViewCustomizer>
          }
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Activa: {state.viewId}. Encendidas: {state.enabledViews.join(", ")}.
      </p>
    </ExampleFrame>
  )
}
