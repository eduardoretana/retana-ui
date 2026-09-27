export default function SettingsFormPreview() {
  return (
    <div className="flex h-full min-h-36 flex-col bg-background p-3 text-[11px]">
      <p className="font-medium">Textos</p>
      <div className="mt-2 h-6 rounded-md border border-border" />
      <div className="mt-2 h-10 rounded-md border border-border" />
      <div className="mt-auto flex items-center justify-between rounded-md border border-border px-2 py-1">
        <span className="text-muted-foreground">Cambios sin guardar</span>
        <span className="rounded-md bg-primary px-2 py-0.5 text-primary-foreground">Guardar</span>
      </div>
    </div>
  )
}
