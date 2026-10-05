"use client"

export default function CrmNewCompanyDialogPreview() {
  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden bg-background p-3 text-xs">
      <p className="font-medium">Nueva empresa</p>
      <div className="rounded-md border border-border px-2 py-1 text-muted-foreground">Nombre</div>
      <div className="rounded-md border border-border px-2 py-1 text-muted-foreground">Estado</div>
      <div className="rounded-md border border-border px-2 py-1 text-muted-foreground">Valor</div>
    </div>
  )
}
