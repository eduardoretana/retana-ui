export default function Preview() {
  return (
    <div className="flex h-full min-h-36 flex-col gap-1 bg-background p-2 text-[10px]">
      <p className="font-medium">Facturación</p>
      <div className="flex gap-1 text-muted-foreground">
        <span>General</span><span className="text-foreground">Facturación</span><span>API</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-1/2 bg-primary" /></div>
      <p className="text-muted-foreground">Mensual · Anual</p>
    </div>
  )
}
