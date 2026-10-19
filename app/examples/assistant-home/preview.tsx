export default function Preview() {
  return (
    <div className="flex h-full min-h-36 flex-col justify-center gap-1 bg-background p-3 text-[10px]">
      <p className="font-medium">Buenas tardes, Mara</p>
      <div className="rounded-md border border-border p-1 text-muted-foreground">Pide un plan…</div>
      <div className="flex gap-1">
        <span className="rounded-full border border-border px-1">Correo</span>
        <span className="rounded-full border border-border px-1">Calendario</span>
      </div>
    </div>
  )
}
