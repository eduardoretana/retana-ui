export default function AdminChartsPreview() {
  return (
    <div className="grid h-full min-h-36 grid-cols-2 gap-2 bg-background p-3 text-[11px]">
      <div className="rounded-md border border-border p-2">
        <p className="text-muted-foreground">Visitantes</p>
        <p className="text-base font-semibold tabular-nums">1.284</p>
        <div className="mt-2 h-1.5 w-3/4 rounded-full bg-chart-1" />
      </div>
      <div className="rounded-md border border-border p-2">
        <p className="text-muted-foreground">Clics</p>
        <p className="text-base font-semibold tabular-nums">86</p>
        <div className="mt-2 h-1.5 w-1/2 rounded-full bg-chart-2" />
      </div>
      <div className="col-span-2 flex h-10 items-end gap-1">
        {[40, 70, 55, 90, 60, 80].map((height) => (
          <span key={height} className="flex-1 rounded-sm bg-chart-1/70" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  )
}
