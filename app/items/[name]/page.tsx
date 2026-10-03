import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodeBlock } from "@/app/catalog/code-block"
import { InstallCommands } from "@/app/catalog/install-commands"
import { PreviewStage } from "@/app/catalog/preview-stage"
import { SiteHeader } from "@/app/catalog/site-header"
import { getCatalog, getCatalogItem } from "@/lib/catalog"
import { readRegistrySource } from "@/lib/catalog-source"

type PageProps = {
  params: Promise<{ name: string }>
}

export function generateStaticParams() {
  return getCatalog().map((item) => ({ name: item.name }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params
  const item = getCatalogItem(name)
  if (!item) return { title: name }
  return {
    title: item.titleEs,
    description: item.descriptionEs,
  }
}

export default async function ItemPage({ params }: PageProps) {
  const { name } = await params
  const item = getCatalogItem(name)
  if (!item) notFound()

  const sources = item.files.map((file) => ({
    ...file,
    source: readRegistrySource(file.path),
  }))

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="hover:underline">
              Catalog
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="font-mono">{item.name}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{item.titleEs}</h1>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
              {item.kind}
            </span>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">{item.descriptionEs}</p>
          {item.description && item.description !== item.descriptionEs ? (
            <p className="max-w-3xl text-sm text-muted-foreground">{item.description}</p>
          ) : null}
          <ul className="flex flex-wrap gap-1.5" aria-label="Categories">
            {item.categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/?category=${category}`}
                  className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </header>

        <PreviewStage src={item.previewHref} title={`${item.titleEs} preview`} />

        {item.examples.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Examples</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {item.examples.map((example) => (
                <li key={example.href}>
                  <Link
                    href={example.href}
                    className="flex h-full flex-col gap-1 rounded-xl border border-border p-4 hover:bg-muted/50"
                  >
                    <span className="font-medium">{example.title}</span>
                    {example.description ? (
                      <span className="text-sm text-muted-foreground">{example.description}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Install</h2>
          <InstallCommands name={item.name} />
          <p className="text-sm text-muted-foreground">
            <code>https://&lt;your-deployment&gt;</code> in the URL command is a placeholder until
            the catalog domain is chosen. On this site the command uses the current origin.
          </p>
        </section>

        {item.docs ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Notes</h2>
            <Notes text={item.docs} />
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Dependencies</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <DependencyList title="npm" values={item.dependencies} />
            <DependencyList title="registryDependencies" values={item.registryDependencies} />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">API</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {item.api.map((row) => (
                  <tr key={row.name} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 align-top font-mono text-xs">{row.name}</td>
                    <td className="px-3 py-2 align-top font-mono text-xs text-muted-foreground">
                      {row.type}
                    </td>
                    <td className="px-3 py-2 align-top text-muted-foreground">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Usage</h2>
          <CodeBlock label="usage.tsx" code={item.usage} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Source</h2>
          {sources.map((file) => (
            <CodeBlock
              key={file.path}
              label={file.target ? `${file.path} → ${file.target}` : file.path}
              code={file.source}
            />
          ))}
        </section>
      </main>
    </>
  )
}

function Notes({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g)
  return (
    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
      {parts.map((part, index) =>
        part.startsWith("http") ? (
          <a key={index} href={part} className="underline-offset-2 hover:underline">
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  )
}

function DependencyList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      {values.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">None</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1 font-mono text-sm text-muted-foreground">
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
