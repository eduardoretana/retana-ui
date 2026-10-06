"use client"

import { useSyncExternalStore } from "react"

import { CodeBlock } from "@/app/catalog/code-block"

function subscribe() {
  return () => {}
}

const PINNED_SHA = "f5bde24bbd0d9cbbb749f1e8959a64470cc4d5dc"

export function InstallCommands({ name }: { name: string }) {
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "https://<your-deployment>",
  )

  const pinned = `npx shadcn@latest add https://raw.githubusercontent.com/eduardoretana/retana-ui/${PINNED_SHA}/public/r/${name}.json`
  const url = `npx shadcn@latest add ${origin}/r/${name}.json`
  const namespaced = `npx shadcn@latest add @retana/${name}`

  return (
    <div className="flex flex-col gap-3">
      <CodeBlock label="Pinned commit" code={pinned} />
      <CodeBlock label="From this deployment" code={url} />
      <CodeBlock label="Namespaced registry" code={namespaced} />
      <p className="text-sm text-muted-foreground">
        If the CLI asks to overwrite button, scroll-area, separator, or any other primitive this
        project already has, answer no and keep the host version.
      </p>
    </div>
  )
}
