export default function MediaLibraryPreview() {
  return (
    <div className="grid h-full min-h-36 grid-cols-3 gap-2 bg-background p-3">
      {["A", "B", "C", "D"].map((letter) => (
        <div
          key={letter}
          className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border bg-muted text-[11px] text-muted-foreground"
        >
          {letter}
        </div>
      ))}
    </div>
  )
}
