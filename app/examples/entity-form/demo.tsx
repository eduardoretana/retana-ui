"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminSection, ConfirmDelete, EmptyState, EntityForm } from "@/registry/ui/entity-form"
import { keepPosition } from "@/registry/lib/reorder"

type Project = { id: string; title: string; position: number }

const seed: Project[] = [
  { id: "lumen", title: "App Lumen", position: 0 },
  { id: "norte", title: "Identidad Norte", position: 1 },
]

export function EntityFormDemo() {
  const [rows, setRows] = useState(seed)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [confirm, setConfirm] = useState(false)

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-4 bg-background p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Ficha de proyecto</h1>
        <Button
          type="button"
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Añadir proyecto
        </Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Sin proyectos" description="Añade el primero para ver la ficha." />
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  setEditing(row)
                  setOpen(true)
                }}
              >
                <span>{row.title}</span>
                <span className="text-muted-foreground">Posición {row.position + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <AdminSection title="Notas internas" description="Esta sección se pliega.">
        <p className="text-sm text-muted-foreground">
          Al guardar un proyecto existente se conserva su posición. Borrar pide confirmación.
        </p>
        <Button type="button" variant="outline" onClick={() => setConfirm(true)}>
          Borrar un ejemplo
        </Button>
      </AdminSection>
      <EntityForm
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Editar proyecto" : "Nuevo proyecto"}
        description="Los datos se quedan en memoria."
        submitLabel="Guardar"
        pendingLabel="Guardando…"
        cancelLabel="Cancelar"
        deleteLabel="Eliminar"
        onDelete={
          editing
            ? async () => {
                setRows((current) => current.filter((row) => row.id !== editing.id))
                toast.success("Proyecto eliminado")
              }
            : undefined
        }
        onSubmit={async (form) => {
          const title = String(form.get("title") ?? "").trim()
          if (!title) return
          setRows((current) => {
            if (!editing) {
              return [...current, { id: `p-${current.length + 1}`, title, position: current.length }]
            }
            return current.map((row) =>
              row.id === editing.id ? keepPosition(row, { ...row, title, position: 0 }) : row,
            )
          })
          toast.success("Proyecto guardado")
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" defaultValue={editing?.title ?? ""} required />
        </div>
      </EntityForm>
      <ConfirmDelete
        open={confirm}
        onOpenChange={setConfirm}
        title="¿Borrar el ejemplo?"
        description="No hay un servidor. Solo cierra este aviso."
        confirmLabel="Borrar"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          toast.success("Confirmado")
        }}
      />
    </main>
  )
}
