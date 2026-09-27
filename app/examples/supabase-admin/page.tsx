import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Supabase admin",
  description: "Adaptador y migraciones SQL para el admin. No se conecta a una base real.",
}

export default function SupabaseAdminPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 bg-background px-6 py-10 text-sm leading-6">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground">Receta</p>
        <h1 className="text-3xl font-semibold tracking-tight">Supabase, cuando haga falta</h1>
        <p className="text-muted-foreground">
          Las piezas de interfaz no crean el cliente. El proyecto anfitrión pasa un{" "}
          <code>SupabaseClient</code> a <code>createSupabaseAdmin</code>. La demo del catálogo usa
          memoria. Esta página no toca ninguna base de datos.
        </p>
      </header>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Instalar</h2>
        <pre className="overflow-x-auto rounded-xl bg-muted p-4">{`npm install @supabase/supabase-js
npx shadcn@latest add @retana/supabase-admin`}</pre>
        <p className="text-muted-foreground">
          Aplica <code>registry/lib/supabase/001_admin_content.sql</code> en el editor SQL. Luego
          inserta tu usuario en <code>public.admins</code>. El texto completo está en{" "}
          <code>registry/lib/supabase/admin-kit.md</code> y en{" "}
          <Link href="/docs" className="underline-offset-2 hover:underline">
            la guía de instalación
          </Link>
          .
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Next.js y Vite</h2>
        <p className="text-muted-foreground">
          En Next.js, crea el cliente en el servidor y protege <code>app/admin/layout.tsx</code>{" "}
          comprobando la fila en <code>admins</code>. En Vite + React 18 haz la misma comprobación
          antes de renderizar la ruta. El shell acepta <code>themeController</code> si ya usas un
          hook de tema.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Políticas</h2>
        <ul className="list-disc pl-5 text-muted-foreground">
          <li>Quien no es admin solo lee filas con <code>published = true</code>.</li>
          <li>Escribir exige una fila en <code>admins</code>.</li>
          <li>
            <code>settings</code> y <code>media</code> se leen en público. Las reservas no.
          </li>
          <li>El bucket <code>media</code> se lee en público y se escribe solo siendo admin.</li>
        </ul>
      </section>
    </main>
  )
}
