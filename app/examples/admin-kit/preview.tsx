export default function AdminKitPreview() {
  return (
    <div className="flex h-full min-h-36 overflow-hidden bg-background text-[10px]">
      <div className="w-24 shrink-0 border-r border-border bg-sidebar p-2 text-sidebar-foreground">
        {["Resumen", "Reservas", "Proyectos", "Medios"].map((item, index) => (
          <p key={item} className={index === 2 ? "rounded-sm bg-sidebar-accent px-1 py-0.5" : "px-1 py-0.5 text-muted-foreground"}>
            {item}
          </p>
        ))}
      </div>
      <div className="min-w-0 flex-1 p-2">
        <p className="font-medium">Proyectos</p>
        <div className="mt-2 flex flex-col gap-1">
          {["Lumen", "Norte", "Orión"].map((title) => (
            <div key={title} className="flex items-center gap-1 rounded-sm border border-border px-1 py-0.5">
              <span className="size-3 bg-muted" />
              <span className="truncate">{title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
