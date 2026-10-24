export default function Preview() {
  return (
    <div className="flex h-full min-h-36 flex-col gap-1 bg-background p-2 text-[10px]">
      <p className="font-medium">Evaluación</p>
      <div className="flex h-8 items-end gap-1">
        <span className="h-1/2 w-3 bg-chart-2" />
        <span className="h-2/3 w-3 bg-chart-2" />
        <span className="h-full w-3 bg-chart-2" />
      </div>
      <p className="text-muted-foreground">Antes · Después</p>
    </div>
  )
}
