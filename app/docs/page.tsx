import type { Metadata } from "next"
import Link from "next/link"

import { SiteHeader } from "@/app/catalog/site-header"

export const metadata: Metadata = {
  title: "Install",
  description: "Install items from the Retana UI shadcn registry.",
}

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Retana UI</p>
          <h1 className="text-3xl font-semibold tracking-tight">Install the registry</h1>
          <p className="text-muted-foreground">
            This app is the catalog and the registry host. Items are listed on the{" "}
            <Link href="/" className="underline-offset-2 hover:underline">
              catalog
            </Link>
            . Each item page has its install command.
          </p>
        </header>
        <section className="flex flex-col gap-3 text-sm leading-6">
          <h2 className="text-lg font-semibold">URL</h2>
          <p className="text-muted-foreground">
            Deploy this app so <code>public/r/&lt;name&gt;.json</code> is reachable. The registry
            is public when production sets <code>REGISTRY_PUBLIC=true</code>.{" "}
            <code>REGISTRY_TOKEN</code> is optional and only applies if that deployment gates{" "}
            <code>/r/*</code>: <code>proxy.ts</code> then requires{" "}
            <code>Authorization: Bearer &lt;token&gt;</code>. With neither variable in production,
            those routes return 401. Development serves them with no token.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4">
            <code>npx shadcn@latest add https://&lt;your-deployment&gt;/r/&lt;name&gt;.json</code>
          </pre>
        </section>
        <section className="flex flex-col gap-3 text-sm leading-6">
          <h2 className="text-lg font-semibold">Namespace</h2>
          <p className="text-muted-foreground">
            In the host project&apos;s <code>components.json</code>:
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
            <code>/r/*</code>. The shadcn CLI substitutes <code>{"${REGISTRY_TOKEN}"}</code>. Drop
            the headers block when <code>REGISTRY_PUBLIC=true</code> and no token is set.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-muted p-4">
            <code>npx shadcn@latest add @retana/&lt;name&gt;</code>
          </pre>
        </section>
        <section className="flex flex-col gap-3 text-sm leading-6 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Host theme</h2>
          <p>
            Items ship no theme, no <code>cssVars</code>, and no copies of button, badge, or other
            primitives. When the CLI asks to overwrite a file the host already has, answer no.
            The rule for new items is in CONTRIBUTING.md.
          </p>
        </section>
      </main>
    </>
  )
}
