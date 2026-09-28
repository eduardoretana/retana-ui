export default function OverviewDashboardPreview() {
  return (
    <div className="flex h-full min-h-36 flex-col gap-2 bg-background p-3 text-[11px]">
      <p className="font-medium">Resumen</p>
      <div className="grid grid-cols-4 gap-1">
        {["1.2k", "86", "4", "12"].map((value) => (
          <div key={value} className="rounded-md border border-border p-1.5">
            <p className="font-semibold tabular-nums">{value}</p>
            <span className="mt-1 block h-1 w-2/3 rounded-full bg-chart-1" />
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-[2fr_1fr] gap-2">
        <div className="rounded-md border border-border" />
        <div className="rounded-md border border-border p-2 text-muted-foreground">Próximas llamadas</div>
      </div>
    </div>
  )
}
