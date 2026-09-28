const rows = ["Lumen", "Norte", "Orión"]

export default function SortableListPreview() {
  return (
    <div className="flex h-full min-h-36 flex-col gap-1.5 bg-background p-3 text-[11px]">
      {rows.map((title, index) => (
        <div key={title} className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5">
          <span className="text-muted-foreground">⋮⋮</span>
          <span className="w-4 tabular-nums text-muted-foreground">{index + 1}</span>
          <span className="size-5 rounded-sm bg-muted" />
          <span className="min-w-0 flex-1 truncate">{title}</span>
        </div>
      ))}
    </div>
  )
}
