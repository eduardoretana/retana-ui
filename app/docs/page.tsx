import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Docs",
  description: "Install the layered panel from the Retana UI registry.",
};

export default function DocsPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Retana UI</p>
        <h1 className="text-3xl font-semibold tracking-tight">Layered panel</h1>
        <p className="text-muted-foreground">
          A peek sheet that grows into a two-column detail view. The route never
          changes, so the table underneath keeps its scroll position.
        </p>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="underline-offset-2 hover:underline">
            Team demo
          </Link>
          <Link href="/leads" className="underline-offset-2 hover:underline">
            Pipeline demo (español)
          </Link>
        </div>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Install</h2>
        <p className="text-sm text-muted-foreground">
          After this app is deployed, install from the generated registry item.
          Full steps, private-registry auth, and a copy-paste fallback are in the
          README.
        </p>
        <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-sm">
          <code>npx shadcn@latest add https://&lt;your-deployment&gt;/r/layered-panel.json</code>
        </pre>
      </section>
      <section className="flex flex-col gap-3 text-sm leading-6">
        <h2 className="text-lg font-semibold">Three steps</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Add the registry item. It pulls in button, scroll-area, and separator.</li>
          <li>
            Render <code>LayeredPanel</code> on the same page as your table. Put the
            summary in <code>Peek</code> and the record fields in <code>Full</code>.
          </li>
          <li>
            On row click call <code>openItem(id)</code>. Optional:{" "}
            <code>useLayeredPanelUrlState</code> maps <code>?member=id&view=full</code>{" "}
            so links are shareable and Back collapses, then closes.
          </li>
        </ol>
      </section>
      <section className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Behavior</h2>
        <p>
          Esc collapses full to peek, then closes. Click-outside and the X close
          immediately. Below 1024px the panel is a full-screen sheet with Overview /
          Profile tabs. Columns scroll independently. Motion is a 280ms width
          transition and respects reduced motion.
        </p>
      </section>
    </main>
  );
}
