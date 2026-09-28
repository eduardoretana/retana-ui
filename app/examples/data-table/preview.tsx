const rows = [
  ["Lucía Navarro", "Estudio", "Reservada"],
  ["Andrés Molina", "Taller", "Reservada"],
  ["Nora Vidal", "Estudio", "Cancelada"],
]

export default function DataTablePreview() {
  return (
    <div className="flex h-full min-h-36 flex-col gap-2 bg-background p-3 text-[11px]">
      <div className="flex gap-2 text-muted-foreground">
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-foreground">Todas 3</span>
        <span>Reservadas 2</span>
        <span>Canceladas 1</span>
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        {rows.map((row) => (
          <div key={row[0]} className="grid grid-cols-3 gap-2 border-b border-border px-2 py-1 last:border-0">
            {row.map((cell) => (
              <span key={cell} className="truncate">
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
