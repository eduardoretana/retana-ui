import type { Metadata } from "next"
import Link from "next/link"

import { SiteHeader } from "@/app/catalog/site-header"
import { getCatalog } from "@/lib/catalog"

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Install Retana UI, publish the registry, and choose among overlapping pieces.",
}

const tables = [
  ["data-table", "Bookings-style admin list: tabs, search, filters, sorting, bulk actions, CSV, and a detail panel."],
  ["crm-table", "Fixed contact columns: avatar, name, status, stage, owner, and last activity."],
  ["adaptive-table", "Grouped table in a narrow panel. Columns drop, fold, and stretch to the container."],
  ["view-table", "Schema-driven rows that also appear in the other multi-view layouts."],
] as const

const boards = [
  ["sortable-board", "Homepage project board with category tabs, counts, and a homepage switch."],
  ["view-kanban", "Status columns over a field schema, with counts, sums, and drag."],
] as const

const time = [
  ["timeline", "Activity feed, newest first, grouped by day."],
  ["record-timeline", "One record's lifecycle, oldest first, with status marks."],
  ["view-timeline", "Horizontal start and end schedule, with zoom and a today line."],
] as const

const dashboards = [
  ["overview-dashboard", "Admin KPIs, a trend, upcoming items, and content counts."],
  ["triage-dashboard", "Greeting, a dense stat row, an annotated trend, and a needs-you list."],
  ["case-review", "One record: header, timeline, suggestion, cost breakdown, and an undo toast."],
  ["metric-card", "A single number with a count-up change."],
  ["stat-strip", "A dense row or divided panel of labelled numbers."],
  ["stats-band", "A marketing band of figures."],
] as const

const meters = [
  ["gauge", "A filled arc that names the threshold the value has reached."],
  ["radial-gauge", "A half-circle needle meter with an explicit over-budget state."],
  ["usage-meter", "Segments measured against a limit."],
  ["tier-distribution", "Two to four share blocks, selectable as a radio group."],
  ["line-chart", "A generic multi-series trend with a crosshair."],
  ["annotated-trend-chart", "A trend with a target line, a highlighted band, and an end value."],
] as const

const editing = [
  ["inline-edit", "One string in place."],
  ["record-properties", "A schema of property rows, including inside layered-panel."],
] as const

const people = [
  ["avatar-group", "A static stack of people, with an overflow count."],
  ["presence-avatars", "People in a presence room. Reads PresenceProvider."],
] as const

const layouts = [
  ["magnetic-bento", "Mixed spans with one highlight that glides between cards."],
  ["blog-grid", "A page of posts."],
  ["card-stack", "A triage deck you flick left or right. For a depth stack of notices, use notification-stack."],
  ["radio-cards", "One choice among option cards."],
  ["view-gallery", "Schema records as cards, inside multi-view."],
] as const

const verification = [
  ["otp-field", "The code field alone, with an error, a success line, and a resend cooldown."],
  ["two-factor-card", "The whole verification card: countdown, verify, alternate methods, and a success handoff. Same input-otp primitive."],
] as const

const notices = [
  ["toast-stack", "Short results at the edge. The undo appearance is a dark pill that pauses on hover."],
  ["notification-center", "A grouped list that keeps read state."],
  ["notification-stack", "A depth stack. Dismiss the front card and the next one steps forward."],
  ["card-stack", "A triage deck you flick left or right."],
] as const

export default function DocsPage() {
  const count = getCatalog().length

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Retana UI</p>
          <h1 className="text-3xl font-semibold tracking-tight">Registry docs</h1>
          <p className="text-muted-foreground">
            {count} components, blocks, hooks, and libraries. Each item inherits the host shadcn
            theme, including dark mode, and ships no colors, fonts, or tokens of its own. The{" "}
            <Link href="/" className="underline-offset-2 hover:underline">
              catalog
            </Link>{" "}
            lists every item. Each{" "}
            <Link href="/items/layered-panel" className="underline-offset-2 hover:underline">
              item page
            </Link>{" "}
            has the Spanish description, an install command, and the notes for that piece.
          </p>
        </header>

        <section className="flex flex-col gap-3 text-sm leading-6">
          <h2 className="text-lg font-semibold">Install</h2>
          <p className="text-muted-foreground">
            The catalog domain is not chosen yet. <code>https://&lt;your-deployment&gt;</code> is a
            placeholder everywhere it appears.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4">
            <code>npx shadcn@latest add @retana/&lt;name&gt;</code>
          </pre>
          <p className="text-muted-foreground">
            Or one JSON file, with no namespace:
          </p>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4">
            <code>npx shadcn@latest add https://&lt;your-deployment&gt;/r/&lt;name&gt;.json</code>
          </pre>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-6">
          <h2 className="text-lg font-semibold">Publishing</h2>
          <p className="text-muted-foreground">
            Import this repository in Vercel and set the production branch to <code>CPL</code>. To
            serve <code>/r/*</code> with no token, set <code>REGISTRY_PUBLIC=true</code> and leave{" "}
            <code>REGISTRY_TOKEN</code> unset.
          </p>
          <p className="text-muted-foreground">
            <code>proxy.ts</code> checks <code>REGISTRY_TOKEN</code> first. If it is set,{" "}
            <code>/r/*</code> requires <code>Authorization: Bearer &lt;token&gt;</code> in
            production and in development, and <code>REGISTRY_PUBLIC</code> is ignored. If no token
            is set, production serves <code>/r/*</code> only when <code>REGISTRY_PUBLIC=true</code>{" "}
            and otherwise returns 401. Development serves <code>/r/*</code> with no token.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-6">
          <h2 className="text-lg font-semibold">Namespace</h2>
          <p className="text-muted-foreground">
            In the host project&apos;s <code>components.json</code>. Drop the headers block when{" "}
            <code>REGISTRY_PUBLIC=true</code> and no token is set.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4">{`{
  "registries": {
    "@retana": {
      "url": "https://<your-deployment>/r/{name}.json",
      "headers": {
        "Authorization": "Bearer \${REGISTRY_TOKEN}"
      }
    }
  }
}`}</pre>
          <p className="text-muted-foreground">
            Put the token in <code>.env.local</code> only when the deployment gates{" "}
            <code>/r/*</code>. The shadcn CLI substitutes <code>{"${REGISTRY_TOKEN}"}</code>. You
            can register the same URL from the CLI:
          </p>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4">
            <code>npx shadcn@latest registry add @retana=https://&lt;your-deployment&gt;/r/{"{name}"}.json</code>
          </pre>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-6">
          <h2 className="text-lg font-semibold">Host theme</h2>
          <p className="text-muted-foreground">
            Items ship no theme, no <code>cssVars</code>, and no copies of button, badge, or other
            primitives meant to replace the host. When the CLI asks to overwrite a file the host
            already has, answer no. The rule for new items is in CONTRIBUTING.md in the repository.
            Pieces use semantic classes such as <code>bg-background</code>,{" "}
            <code>text-foreground</code>, and <code>border-border</code>, so the host&apos;s light
            and dark tokens apply.
          </p>
        </section>

        <section className="flex flex-col gap-4 text-sm leading-6">
          <h2 className="text-lg font-semibold">Which piece should I use</h2>
          <p className="text-muted-foreground">
            Nearby names do different jobs. Open the item page for the install command.
          </p>
          <ChoiceTable title="Tables" rows={tables} />
          <ChoiceTable title="Boards" rows={boards} />
          <ChoiceTable title="Time" rows={time} />
          <ChoiceTable title="Dashboards" rows={dashboards} />
          <ChoiceTable title="Meters and trends" rows={meters} />
          <ChoiceTable title="Editing a record" rows={editing} />
          <ChoiceTable title="People" rows={people} />
          <ChoiceTable title="Layouts" rows={layouts} />
          <ChoiceTable title="Verification" rows={verification} />
          <ChoiceTable title="Notices" rows={notices} />
          <p className="text-muted-foreground">
            <ItemLink name="view-calendar" /> is a month grid. <ItemLink name="view-grouped-list" />{" "}
            is collapsible groups of compact rows. <ItemLink name="view-gallery" /> is cards.{" "}
            <ItemLink name="multi-view" /> switches those views and opens the record panel.{" "}
            <ItemLink name="admin-shell" /> is the admin sidebar. <ItemLink name="rail-sidebar" />{" "}
            is the icon rail plus a section panel.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-6">
          <h2 className="text-lg font-semibold">Admin kit</h2>
          <p className="text-muted-foreground">
            The admin pieces are router-agnostic. They take data and callbacks as props, so the
            same files work in Next.js and in a Vite + React 18 app. The catalog demo at{" "}
            <Link href="/examples/admin-kit" className="underline-offset-2 hover:underline">
              /examples/admin-kit
            </Link>{" "}
            keeps everything in memory.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4">
            <code>npx shadcn@latest add @retana/admin-kit</code>
          </pre>
          <p className="text-muted-foreground">
            That install also copies <code>lib/supabase/001_admin_content.sql</code> and{" "}
            <code>lib/supabase/admin-kit.md</code>. In this repository those files live under{" "}
            <code>registry/lib/supabase/</code>. Apply the SQL in the host project when you want
            Supabase. Until then, use <code>createMemoryAdmin</code>. For the adapter and SQL
            alone:
          </p>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4">
            <code>npx shadcn@latest add @retana/supabase-admin</code>
          </pre>
          <p className="text-muted-foreground">
            Answer no when the CLI asks to overwrite primitives you already ship. Adapted list
            behavior is credited in NOTICE. The recipe page is{" "}
            <Link href="/examples/supabase-admin" className="underline-offset-2 hover:underline">
              /examples/supabase-admin
            </Link>
            .
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-6">
          <h2 className="text-lg font-semibold">Presence</h2>
          <p className="text-muted-foreground">
            UI pieces read <code>PresenceProvider</code>. Connect the in-memory adapter, Liveblocks,
            or Supabase Realtime. The setup that ships with the item is{" "}
            <code>registry/lib/presence/README.md</code>.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4">{`npx shadcn@latest add @retana/presence
npx shadcn@latest add @retana/presence-avatars
npx shadcn@latest add @retana/live-cursors
npx shadcn@latest add @retana/typing-indicator
npx shadcn@latest add @retana/presence-outline`}</pre>
          <p className="text-muted-foreground">
            Add <ItemLink name="presence-liveblocks" /> or <ItemLink name="presence-supabase" />.
            Liveblocks stays on the Apache-2.0 packages <code>@liveblocks/client</code> and{" "}
            <code>@liveblocks/react</code>. <code>@liveblocks/node</code> is documented for a host
            auth route. <code>@liveblocks/server</code> and the <code>liveblocks</code> CLI are
            AGPL-3.0 and are not part of this registry. The Free plan needs a visible Liveblocks
            badge and allows 10 concurrent connections per room.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-6">
          <h2 className="text-lg font-semibold">Multi-view</h2>
          <p className="text-muted-foreground">
            One install copies the block, the six views, <code>record-properties</code>, the schema
            helpers, <code>layered-panel</code>, and <code>entity-form</code>. Pass records in.
            Saves go through callbacks. Wiring for Supabase and REST ships in{" "}
            <code>registry/lib/multi-view/README.md</code>.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4">
            <code>npx shadcn@latest add @retana/multi-view</code>
          </pre>
          <p className="text-muted-foreground">
            Answer no if the CLI asks to overwrite <code>layered-panel</code> or{" "}
            <code>entity-form</code> when the host already has them. The live demo is{" "}
            <Link href="/examples/multi-view" className="underline-offset-2 hover:underline">
              /examples/multi-view
            </Link>
            .
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-6">
          <h2 className="text-lg font-semibold">Credits</h2>
          <ul className="list-disc pl-5 text-muted-foreground">
            <li>
              Arc UI free tier by Elia Kuratli (MIT). Charts, blocks, inputs, and the optional
              behaviors on a few older pieces. Pro items are outside this registry. Adapted motion
              uses the <code>motion</code> package.
            </li>
            <li>
              Sakani Design System by Samuel Okpere (MIT) inspired <code>rail-sidebar</code>. No
              code, CSS modules, tokens, Geist, or logo were copied.
            </li>
            <li>
              <code>adaptive-table</code> and the multi-view pieces are clean-room implementations.
            </li>
            <li>
              Dashboard wells, triage, case review, the radial gauge, and the tier meter are an
              independent implementation of common dashboard patterns.
            </li>
            <li>
              <code>magnetic-bento</code> takes the anchor-positioning idea from{" "}
              <a href="https://x.com/jh3yy/status/2105823926978814273" className="underline-offset-2 hover:underline">
                jh3yy
              </a>
              . The cards, labels, and icons here are original.
            </li>
            <li>
              <code>two-factor-card</code> and <code>notification-stack</code> take visual inspiration
              from Design &amp; Code With AV Facebook reels. No code was used.
            </li>
            <li>
              Some admin list behavior is adapted from Maniruzzaman Jubayer&apos;s MIT admin panel
              and reimplemented on shadcn primitives.
            </li>
          </ul>
          <p className="text-muted-foreground">
            The upstream MIT texts are in the repository file NOTICE.
          </p>
        </section>
      </main>
    </>
  )
}

function ItemLink({ name }: { name: string }) {
  return (
    <Link href={`/items/${name}`} className="underline-offset-2 hover:underline">
      <code>{name}</code>
    </Link>
  )
}

function ChoiceTable({
  title,
  rows,
}: {
  title: string
  rows: readonly (readonly [string, string])[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-medium">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[36rem] text-left">
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Piece</th>
              <th className="px-3 py-2 font-medium">Use it for</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, use]) => (
              <tr key={name} className="border-b border-border last:border-0">
                <td className="px-3 py-2 align-top">
                  <ItemLink name={name} />
                </td>
                <td className="px-3 py-2 align-top text-muted-foreground">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
