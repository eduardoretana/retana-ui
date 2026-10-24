const groups = [
  { name: "Torno", count: "2", rows: ["Jarra niebla", "Plato de marea"] },
  { name: "Cochura", count: "2", rows: ["Vaso de río", "Bol de ceniza"] },
]

export default function DataTableGroupingPreview() {
  return (
    <div className="flex h-full min-h-36 flex-col gap-2 bg-background p-3 text-[11px]">
      <div className="flex gap-1 text-muted-foreground">
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-foreground">Etapa</span>
        <span className="rounded-md border border-border px-1.5 py-0.5">Cliente</span>
        <span className="ms-auto">2 seleccionadas</span>
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        {groups.map((group) => (
          <div key={group.name}>
            <div className="flex items-center gap-2 bg-muted/40 px-2 py-1">
              <span className="font-medium">{group.name}</span>
              <span className="rounded-full bg-secondary px-1.5 text-secondary-foreground">{group.count}</span>
            </div>
            {group.rows.map((row) => (
              <div key={row} className="border-t border-border px-2 py-1">
                {row}
              </div>
            ))}
          </div>
        ))}
        <div className="flex justify-between border-t border-border bg-muted px-2 py-1 font-medium">
          <span>Total</span>
          <span className="tabular-nums">$9,700</span>
        </div>
      </div>
    </div>
  )
}
