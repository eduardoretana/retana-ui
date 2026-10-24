export default function Preview() {
  return (
    <div className="flex h-full min-h-36 flex-col gap-1 bg-background p-2 text-[10px]">
      <p className="font-medium">Integraciones</p>
      <div className="h-3 rounded-sm border border-border" />
      <div className="grid flex-1 grid-cols-2 gap-1">
        <div className="rounded-sm border border-border p-1">Buzón</div>
        <div className="rounded-sm border border-border p-1">Caja</div>
      </div>
    </div>
  )
}
