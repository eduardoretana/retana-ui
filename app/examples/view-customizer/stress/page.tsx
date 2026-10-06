"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ViewCustomizer, ViewSwitcher } from "@/registry/ui/view-customizer"
import { LONG_TOKEN } from "@/app/examples/desk/bruma"

const four = [
  { id: "list", label: "Lista" },
  { id: "grid", label: "Rejilla" },
  { id: "board", label: "Tablero" },
  { id: "canvas", label: LONG_TOKEN },
]

export default function StressPage() {
  const [enabled, setEnabled] = useState(["list"])
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Vistas</h1>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">Una vista, sin pastilla</h2>
        <ViewSwitcher views={four.filter((view) => view.id === "list")} value="list" menu={<Button type="button" size="icon" variant="outline" className="rounded-full" aria-label="Vistas"><MoreHorizontal /></Button>} />
      </section>
      <section className="grid gap-2">
        <h2 className="text-sm font-medium">320px y cuatro vistas</h2>
        <div className="w-80">
          <ViewSwitcher
            views={four.filter((view) => enabled.includes(view.id))}
            value={enabled[0]}
            onValueChange={() => undefined}
            onAdd={() => undefined}
            menu={
              <ViewCustomizer title="Vistas" subtitle={LONG_TOKEN} views={four} enabled={enabled} onEnabledChange={setEnabled} footer="مشروع">
                <Button type="button" size="icon" variant="outline" className="rounded-full" aria-label="Vistas"><MoreHorizontal /></Button>
              </ViewCustomizer>
            }
          />
        </div>
      </section>
      <section dir="rtl">
        <h2 className="mb-2 text-sm font-medium">RTL</h2>
        <ViewSwitcher views={[{ id: "a", label: "قائمة" }, { id: "b", label: "لوحة" }]} value="a" />
      </section>
    </main>
  )
}
