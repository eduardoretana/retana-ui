"use client"

import { useState } from "react"
import type { LegacyColumnDef } from "@tanstack/react-table/legacy"
import { toast } from "sonner"

import { AdminDataTable } from "@/registry/ui/data-table"

type Booking = {
  id: string
  name: string
  email: string
  phone: string
  plan: string
  status: "booked" | "cancelled"
  needs: string
}

const seed: Booking[] = [
  {
    id: "b1",
    name: "Lucía Navarro",
    email: "lucia.navarro@acme.example",
    phone: "+34 600 010 101",
    plan: "Estudio",
    status: "booked",
    needs: "Rediseño del sitio",
  },
  {
    id: "b2",
    name: "Andrés Molina",
    email: "andres.molina@acme.example",
    phone: "+34 600 010 102",
    plan: "Taller",
    status: "booked",
    needs: "Sistema de diseño",
  },
  {
    id: "b3",
    name: "Nora Vidal",
    email: "nora.vidal@acme.example",
    phone: "+34 600 010 103",
    plan: "Estudio",
    status: "cancelled",
    needs: "App interna",
  },
  {
    id: "b4",
    name: "Hugo Serra",
    email: "hugo.serra@acme.example",
    phone: "+34 600 010 104",
    plan: "Taller",
    status: "booked",
    needs: "Investigación",
  },
]

const columns: LegacyColumnDef<Booking>[] = [
  { accessorKey: "name", header: "Nombre" },
  { accessorKey: "email", header: "Correo" },
  { accessorKey: "plan", header: "Plan" },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => (getValue() === "cancelled" ? "Cancelada" : "Reservada"),
  },
]

export function DataTableDemo() {
  const [rows, setRows] = useState(seed)

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-4 bg-background p-6">
      <header>
        <h1 className="text-xl font-semibold">Reservas</h1>
        <p className="text-sm text-muted-foreground">
          Pestañas, búsqueda, filtro, orden, columnas, selección múltiple, CSV y ficha lateral.
        </p>
      </header>
      <AdminDataTable
        data={rows}
        columns={columns}
        searchPlaceholder="Buscar reservas"
        searchText={(row) => `${row.name} ${row.email} ${row.plan} ${row.needs}`}
        emptyTitle="Ninguna reserva"
        csvFilename="reservas.csv"
        csvColumns={[
          { key: "name", header: "Nombre" },
          { key: "email", header: "Correo" },
          { key: "plan", header: "Plan" },
          { key: "status", header: "Estado" },
        ]}
        toCsvRow={(row) => row}
        tabs={[
          { id: "all", label: "Todas" },
          { id: "booked", label: "Reservadas", predicate: (row) => row.status === "booked" },
          { id: "cancelled", label: "Canceladas", predicate: (row) => row.status === "cancelled" },
        ]}
        filters={[
          {
            id: "plan",
            label: "Plan",
            options: [
              { value: "Estudio", label: "Estudio" },
              { value: "Taller", label: "Taller" },
            ],
            predicate: (row, value) => row.plan === value,
          },
        ]}
        bulkActions={[
          {
            id: "cancel",
            label: "Cancelar selección",
            destructive: true,
            onAction: (selected) => {
              const ids = new Set(selected.map((row) => row.id))
              setRows((current) =>
                current.map((row) => (ids.has(row.id) ? { ...row, status: "cancelled" } : row)),
              )
              toast.success("Reservas canceladas")
            },
          },
        ]}
        detailTitle={(row) => row.name}
        renderDetail={(row) => (
          <dl className="mt-4 grid gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Correo</dt>
              <dd>{row.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Teléfono</dt>
              <dd>{row.phone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Necesidad</dt>
              <dd>{row.needs}</dd>
            </div>
          </dl>
        )}
      />
    </main>
  )
}
