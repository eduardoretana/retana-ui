export default function Preview() {
  return (
    <div className="flex h-full min-h-36 flex-col bg-background text-[10px]">
      <p className="border-b border-border px-2 py-1 font-medium">Cartera</p>
      <div className="grid grid-cols-4 gap-px bg-border p-px">
        {["Empresa", "Etapa", "Dueño", "Valor"].map((cell) => (
          <span key={cell} className="bg-background px-1 py-0.5 text-muted-foreground">{cell}</span>
        ))}
        {["Bruma", "Propuesta", "Inés", "48k"].map((cell) => (
          <span key={cell} className="truncate bg-background px-1 py-0.5">{cell}</span>
        ))}
      </div>
    </div>
  )
}
