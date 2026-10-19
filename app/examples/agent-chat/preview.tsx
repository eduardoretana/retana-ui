export default function Preview() {
  return (
    <div className="flex h-full min-h-36 text-[10px]">
      <div className="w-16 shrink-0 border-r border-border bg-sidebar p-1 text-sidebar-foreground">Acme</div>
      <div className="min-w-0 flex-1 p-1">
        <p className="font-medium">Encargo</p>
        <p className="mt-1 rounded-sm bg-muted px-1">Coordinación</p>
      </div>
      <div className="w-20 shrink-0 border-l border-border p-1">
        <p className="text-muted-foreground">Producto</p>
        <p className="truncate">Linterna</p>
      </div>
    </div>
  )
}
