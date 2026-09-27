export type CsvColumn = {
  key: string
  header: string
}

export function escapeCsvCell(value: unknown): string {
  if (value == null) return ""
  const text = String(value)
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function toCsv(
  rows: readonly Record<string, unknown>[],
  columns: readonly CsvColumn[],
): string {
  const head = columns.map((column) => escapeCsvCell(column.header)).join(",")
  const body = rows
    .map((row) => columns.map((column) => escapeCsvCell(row[column.key])).join(","))
    .join("\n")
  return body ? `${head}\n${body}` : head
}

export function downloadCsv(filename: string, csv: string) {
  if (typeof document === "undefined") return
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
