"use client"

import { useSyncExternalStore } from "react"

import { CodeBlock } from "@/app/catalog/code-block"

function subscribe() {
  return () => {}
}

export function InstallCommands({ name }: { name: string }) {
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "https://<your-deployment>",
  )

  const url = `npx shadcn@latest add ${origin}/r/${name}.json`
  const namespaced = `npx shadcn@latest add @retana/${name}`

  return (
    <div className="flex flex-col gap-3">
      <CodeBlock label="From this deployment" code={url} />
      <CodeBlock label="Namespaced registry" code={namespaced} />
      <p className="text-sm text-muted-foreground">
        If the CLI asks to overwrite button, scroll-area, separator, or any other primitive this
        project already has, answer no and keep the host version.
      </p>
    </div>
  )
}
