# Admin kit on Supabase

The UI pieces do not import Supabase. The host creates the client and passes it to `createSupabaseAdmin`.

## Install

```bash
npm install @supabase/supabase-js
npx shadcn@latest add @retana/admin-kit
```

Answer **no** if the CLI asks to overwrite primitives the host already has (`button`, `sidebar`, `dialog`, and the rest).

Apply `001_admin_content.sql` in the Supabase SQL editor. It creates the content tables, RLS, and a public `media` storage bucket.

Add yourself:

```sql
insert into public.admins (user_id) values ('<auth.users id>');
```

## Next.js

```tsx
// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

export function adminPorts() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return createSupabaseAdmin(client)
}
```

Guard the route in a server layout. The registry pieces do not import `next`.

```tsx
// app/admin/layout.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle()
  if (!admin) redirect("/")
  return children
}
```

Wire a screen with the same callbacks the demo uses:

```tsx
const ports = adminPorts()
const projects = await ports.projects.list()

<SortableBoard
  items={projects}
  categories={categories}
  onReorder={(ids) => ports.projects.reorder(ids)}
  onToggleHomepage={async (id, show) => {
    const row = projects.find((item) => item.id === id)
    if (row) await ports.projects.save({ ...row, showOnHomepage: show })
  }}
/>
```

## Vite + React 18

Same client, no server layout. Guard in the router:

```tsx
const { data: { session } } = await supabase.auth.getSession()
if (!session) return <Navigate to="/login" replace />
const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle()
if (!admin) return <Navigate to="/" replace />
```

Pass `themeController` from your theme hook if you have one. Otherwise the shell toggles the `dark` class itself.

## What the policies do

- `published = true` rows are readable without a session.
- `settings` and `media` are readable by the public site. Only admins write.
- `bookings` are invisible to anon. Insert them from a server action with the service role.
- Storage object writes on the `media` bucket require `is_admin()`.
