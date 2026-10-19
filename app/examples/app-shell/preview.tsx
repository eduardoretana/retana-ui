export default function Preview() {
  return (
    <div className="flex h-full min-h-36 gap-1 bg-muted/40 p-1 text-[10px]">
      <div className="flex w-24 shrink-0 flex-col gap-1 rounded-md border border-sidebar-border bg-sidebar p-1 text-sidebar-foreground">
        <p className="truncate font-medium">Acme</p>
        {["Inicio", "Bandeja", "Asistente"].map((item, index) => (
          <p key={item} className={index === 0 ? "truncate rounded-sm bg-sidebar-accent px-1" : "truncate px-1 text-muted-foreground"}>{item}</p>
        ))}
        <p className="mt-auto truncate text-muted-foreground">Mara Solís</p>
      </div>
      <div className="min-w-0 flex-1 rounded-md border border-border bg-background p-2">
        <p className="font-medium">Hoy</p>
        <p className="mt-1 text-muted-foreground">Contenido</p>
      </div>
    </div>
  )
}
