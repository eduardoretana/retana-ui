"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { DataTableMeter, DataTableReorder, DataTableSparkline, DataTableTrend } from "@/registry/ui/data-table-reorder"
import { dataTableReorderLabelsEn, type DataTableSort } from "@/registry/lib/data-table-reorder"

import { demoPeople, demoRows, type DeskRow } from "../portfolio-desk/data"

export function DataTableReorderDemo({ english = false }: { english?: boolean }) {
  const [sort, setSort] = useState<DataTableSort | null>({ columnId: "hours", direction: "desc" })
  const [selected, setSelected] = useState<string | null>(null)
  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Pieza",
        width: "minmax(10rem,1.4fr)",
        sortValue: (row: DeskRow) => row.name,
        cell: (row: DeskRow) => row.name,
      },
      {
        id: "hours",
        header: "Horas",
        align: "end" as const,
        width: "7rem",
        sortValue: (row: DeskRow) => row.hours,
        cell: (row: DeskRow) => <span className="tabular-nums">{row.hours}</span>,
      },
      {
        id: "series",
        header: "Semana",
        sortable: false,
        width: "7rem",
        cell: (row: DeskRow) => <DataTableSparkline values={row.series} label={`Horas de ${row.name}`} />,
      },
      {
        id: "progress",
        header: "Avance",
        width: "10rem",
        sortValue: (row: DeskRow) => row.progress,
        cell: (row: DeskRow) => <DataTableMeter value={row.progress} label={`${row.progress}%`} />,
      },
      {
        id: "trend",
        header: "Tendencia",
        width: "8rem",
        sortValue: (row: DeskRow) => (row.trend === "up" ? 1 : row.trend === "flat" ? 0 : -1),
        cell: (row: DeskRow) => <DataTableTrend direction={row.trend} label={row.trendLabel} />,
      },
    ],
    [],
  )

  return (
    <DataTableReorder
      rows={demoRows}
      columns={columns}
      sort={sort}
      onSortChange={setSort}
      selectedId={selected}
      onRowSelect={(row) => {
        setSelected(row.id)
        toast(row.name)
      }}
      labels={english ? dataTableReorderLabelsEn : undefined}
      detail={(row) => ({
        label: row.name,
        title: row.name,
        eyebrow: row.owner,
        description: row.note,
        people: demoPeople.filter((person) => person.name === row.owner),
        metrics: [
          { id: "hours", label: "Horas", value: String(row.hours) },
          { id: "progress", label: "Avance", value: `${row.progress}%` },
        ],
        actions: [{ id: "open", label: "Abrir", onSelect: () => toast(`Abrir ${row.name}`) }],
      })}
    />
  )
}
