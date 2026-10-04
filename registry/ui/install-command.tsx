"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/src/components/install-tabs.tsx

import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/registry/retana/ui/copy-button"

const RUNNERS = [
  { id: "pnpm", label: "pnpm", rewrite: (command: string) => command.replace(/^npx /, "pnpm dlx ") },
  { id: "npm", label: "npm", rewrite: (command: string) => command },
  { id: "yarn", label: "yarn", rewrite: (command: string) => command.replace(/^npx /, "yarn dlx ") },
  { id: "bun", label: "bun", rewrite: (command: string) => command.replace(/^npx /, "bunx --bun ") },
] as const

export type InstallCommandProps = {
  command: string
  storageKey?: string
  className?: string
}

export function InstallCommand({ command, storageKey = "retana-package-manager", className }: InstallCommandProps) {
  const [manager, setManager] = React.useState<(typeof RUNNERS)[number]["id"]>("npm")

  React.useEffect(() => {
    const apply = () => {
      const stored = window.localStorage.getItem(storageKey)
      if (stored === "pnpm" || stored === "npm" || stored === "yarn" || stored === "bun") setManager(stored)
    }
    const timer = window.setTimeout(apply, 0)
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return
      if (event.newValue === "pnpm" || event.newValue === "npm" || event.newValue === "yarn" || event.newValue === "bun") {
        setManager(event.newValue)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("storage", onStorage)
    }
  }, [storageKey])

  return (
    <Tabs
      value={manager}
      onValueChange={(value) => {
        if (value !== "pnpm" && value !== "npm" && value !== "yarn" && value !== "bun") return
        setManager(value)
        window.localStorage.setItem(storageKey, value)
      }}
      className={className}
    >
      <TabsList>
        {RUNNERS.map((runner) => (
          <TabsTrigger key={runner.id} value={runner.id}>
            {runner.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {RUNNERS.map((runner) => {
        const text = runner.rewrite(command)
        return (
          <TabsContent key={runner.id} value={runner.id}>
            <div className={cn("flex items-center gap-2 rounded-lg bg-muted py-1.5 pr-1.5 pl-3")}>
              <code className="min-w-0 flex-1 overflow-x-auto font-mono text-sm whitespace-nowrap [mask-image:linear-gradient(to_right,var(--foreground),var(--foreground)_calc(100%-1.5rem),transparent)]">
                {text}
              </code>
              <CopyButton value={text} iconOnly label="Copy command" />
              <span className="sr-only" aria-live="polite" />
            </div>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
