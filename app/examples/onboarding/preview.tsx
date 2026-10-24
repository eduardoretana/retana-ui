export default function Preview() {
  return (
    <div className="flex h-full min-h-36 gap-1 bg-background p-2 text-[10px]">
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-4 gap-1">
          {["1", "2", "3", "4"].map((step, index) => (
            <span key={step} className={index === 0 ? "rounded-sm border border-primary px-1" : "rounded-sm border border-border px-1"}>{step}</span>
          ))}
        </div>
        <p className="mt-2 font-medium">Nombra el espacio</p>
      </div>
      <div className="w-16 shrink-0 rounded-sm border border-border p-1 text-muted-foreground">Lista</div>
    </div>
  )
}
