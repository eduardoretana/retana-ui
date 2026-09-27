const tables = ["projects", "settings", "media", "bookings"]

export default function SupabaseAdminPreview() {
  return (
    <div className="flex h-full min-h-36 flex-col gap-1 bg-background p-3 font-mono text-[11px]">
      <p className="font-sans text-xs font-medium">Supabase</p>
      {tables.map((table) => (
        <p key={table} className="text-muted-foreground">
          public.{table}
        </p>
      ))}
      <p className="mt-1 font-sans text-[10px] text-muted-foreground">Lectura pública solo si published.</p>
    </div>
  )
}
