export default function Preview() {
  return (
    <div className="flex h-full min-h-36 flex-col gap-1 bg-background p-2 text-[10px]">
      <p className="font-medium">Esta semana</p>
      <div className="grid grid-cols-4 gap-1">
        {["Ing.", "Ped.", "Tck.", "Rec."].map((item) => (
          <span key={item} className="rounded-sm border border-border px-1">{item}</span>
        ))}
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-full w-2/3 rounded-full bg-primary" /></div>
    </div>
  )
}
