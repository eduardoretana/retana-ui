export default function SortableBoardPreview() {
  const tabs = [
    ["Todos", "8"],
    ["Producto", "3"],
    ["Web", "2"],
  ]
  return (
    <div className="flex h-full min-h-36 flex-col gap-2 bg-background p-3 text-[11px]">
      <div className="flex gap-1">
        {tabs.map(([label, count], index) => (
          <span
            key={label}
            className={
              index === 0
                ? "rounded-md bg-muted px-1.5 py-0.5"
                : "px-1.5 py-0.5 text-muted-foreground"
            }
          >
            {label} {count}
          </span>
        ))}
      </div>
      {["Lumen", "Norte", "Orión"].map((title) => (
        <div key={title} className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
          <span className="size-5 rounded-sm bg-muted" />
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <span className="text-muted-foreground">Portada</span>
          <span className="h-3 w-6 rounded-full bg-foreground" />
        </div>
      ))}
    </div>
  )
}
