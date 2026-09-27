export default function AdminShellPreview() {
  const items = ["Resumen", "Proyectos", "Reservas"]
  return (
    <div className="flex h-full min-h-36 overflow-hidden bg-background text-[11px]">
      <div className="flex w-28 shrink-0 flex-col gap-1 border-r border-border bg-sidebar p-2 text-sidebar-foreground">
        <p className="px-1 text-[10px] font-semibold">Estudio</p>
        {items.map((item, index) => (
          <div
            key={item}
            className={index === 1 ? "rounded-md bg-sidebar-accent px-1.5 py-1" : "px-1.5 py-1 text-muted-foreground"}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex h-8 items-center gap-2 border-b border-border px-2 text-muted-foreground">
          <span>Admin</span>
          <span>/</span>
          <span className="text-foreground">Proyectos</span>
        </div>
        <p className="px-2 py-3 text-muted-foreground">Barra, migas y búsqueda.</p>
      </div>
    </div>
  )
}
