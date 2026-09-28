"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { moveItem } from "@/registry/lib/reorder"
import { slugify, uniqueSlug } from "@/registry/lib/slug"

const taken = ["norte", "norte-2"]

export function AdminUtilsDemo() {
  const [title, setTitle] = useState("Diseño de producto")
  const [rows, setRows] = useState(["Lumen", "Norte", "Orión"])
  const slug = useMemo(() => uniqueSlug(title, taken), [title])

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 bg-background p-6">
      <header>
        <h1 className="text-xl font-semibold">Utilidades</h1>
        <p className="text-sm text-muted-foreground">
          Slug único y movimiento de filas. El resto de helpers se cubre con pruebas.
        </p>
      </header>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <p className="text-sm">
          slugify: <span className="font-mono">{slugify(title) || "item"}</span>
        </p>
        <p className="text-sm">
          único (norte y norte-2 ocupados): <span className="font-mono">{slug}</span>
        </p>
      </div>
      <ol className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <li key={row} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span>
              {index + 1}. {row}
            </span>
            <span className="flex gap-1">
              <Button type="button" size="sm" variant="outline" onClick={() => setRows((current) => moveItem(current, index, Math.max(0, index - 1)))}>
                Subir
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setRows((current) => moveItem(current, index, Math.min(current.length - 1, index + 1)))}>
                Bajar
              </Button>
            </span>
          </li>
        ))}
      </ol>
    </main>
  )
}
