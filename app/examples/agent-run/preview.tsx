export default function Preview() {
  return (
    <div className="flex h-full min-h-36 flex-col gap-1 bg-background p-2 text-[10px]">
      <p className="font-medium">Corrida</p>
      <div className="grid flex-1 grid-cols-2 gap-1">
        <div className="rounded-sm border border-border p-1">Plan</div>
        <div className="rounded-sm border border-border p-1">Actividad</div>
      </div>
      <p className="text-muted-foreground">Aceptar · Rechazar</p>
    </div>
  )
}
