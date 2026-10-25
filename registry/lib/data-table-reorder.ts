/**
 * Stable column sort for a dense table.
 * Empty values stay last in both directions. Ties keep the original order.
 * Spanish collation is the default. The table never reads `meta`.
 */

export const SORT_DIRECTIONS = ["asc", "desc"] as const

export type SortDirection = (typeof SORT_DIRECTIONS)[number]

export type DataTableSort = {
  columnId: string
  direction: SortDirection
}

export type DataTableReorderLabels = {
  caption: string
  emptyTitle: string
  emptyHint: string
  loading: string
  errorTitle: string
  retry: string
  disabledNote: string
  announcements: string
  sortAscending: (column: string) => string
  sortDescending: (column: string) => string
  sorted: (column: string, direction: SortDirection) => string
  rowDetail: (label: string) => string
}

export const dataTableReorderLabels: DataTableReorderLabels = {
  caption: "Tabla",
  emptyTitle: "Nada que mostrar",
  emptyHint: "No hay filas con estos datos.",
  loading: "Cargando la tabla",
  errorTitle: "No se pudo mostrar la tabla",
  retry: "Reintentar",
  disabledNote: "La tabla está deshabilitada",
  announcements: "Avisos de la tabla",
  sortAscending: (column) => `Ordenar ${column} ascendente`,
  sortDescending: (column) => `Ordenar ${column} descendente`,
  sorted: (column, direction) => `Ordenado por ${column}, ${direction === "asc" ? "ascendente" : "descendente"}`,
  rowDetail: (label) => `Detalle de ${label}`,
}

export const dataTableReorderLabelsEn: DataTableReorderLabels = {
  caption: "Table",
  emptyTitle: "Nothing to show",
  emptyHint: "There are no rows for this data.",
  loading: "Loading the table",
  errorTitle: "The table could not be shown",
  retry: "Try again",
  disabledNote: "The table is disabled",
  announcements: "Table announcements",
  sortAscending: (column) => `Sort ${column} ascending`,
  sortDescending: (column) => `Sort ${column} descending`,
  sorted: (column, direction) => `Sorted by ${column}, ${direction === "asc" ? "ascending" : "descending"}`,
  rowDetail: (label) => `Details for ${label}`,
}

export function withTableLabels(labels?: Partial<DataTableReorderLabels>): DataTableReorderLabels {
  return { ...dataTableReorderLabels, ...labels }
}

export function nextSort(current: DataTableSort | null, columnId: string): DataTableSort {
  if (!current || current.columnId !== columnId || current.direction === "desc") {
    return { columnId, direction: "asc" }
  }
  return { columnId, direction: "desc" }
}

function isEmpty(value: string | number | null | undefined) {
  return value == null || value === ""
}

export function sortTableRows<T>(
  rows: readonly T[],
  read: (row: T) => string | number | null | undefined,
  direction: SortDirection,
  locale = "es-MX",
): T[] {
  return rows
    .map((row, index) => ({ row, index, value: read(row) }))
    .sort((a, b) => {
      const aEmpty = isEmpty(a.value)
      const bEmpty = isEmpty(b.value)
      if (aEmpty && bEmpty) return a.index - b.index
      if (aEmpty) return 1
      if (bEmpty) return -1
      const result =
        typeof a.value === "number" && typeof b.value === "number"
          ? a.value - b.value
          : String(a.value).localeCompare(String(b.value), locale, { numeric: true, sensitivity: "base" })
      if (result === 0) return a.index - b.index
      return direction === "asc" ? result : -result
    })
    .map((entry) => entry.row)
}

/** Points for a dense sparkline. One value draws a centered dot. */
export function sparklinePoints(values: readonly number[], width: number, height: number) {
  const finite = values.filter((value) => Number.isFinite(value))
  if (!finite.length || width <= 0 || height <= 0) return ""
  const min = Math.min(...finite)
  const max = Math.max(...finite)
  const span = max - min || 1
  return finite
    .map((value, index) => {
      const x = finite.length === 1 ? width / 2 : (index / (finite.length - 1)) * width
      const y = height - ((value - min) / span) * (height - 2) - 1
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")
}
