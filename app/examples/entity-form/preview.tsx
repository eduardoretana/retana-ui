export default function EntityFormPreview() {
  return (
    <div className="grid h-full min-h-36 place-items-center bg-muted/40 p-3">
      <div className="w-full max-w-xs rounded-lg border border-border bg-background p-3 text-[11px] shadow-lg">
        <p className="font-medium">Editar proyecto</p>
        <p className="mt-2 text-muted-foreground">Título</p>
        <div className="mt-1 h-6 rounded-md border border-border bg-muted/40" />
        <div className="mt-3 flex justify-end gap-1">
          <span className="rounded-md border border-border px-2 py-1">Cancelar</span>
          <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground">Guardar</span>
        </div>
      </div>
    </div>
  )
}
