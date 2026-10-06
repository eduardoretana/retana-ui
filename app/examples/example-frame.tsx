"use client"

import type { ReactNode } from "react"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { cn } from "@/lib/utils"

export function ExampleFrame({
  title,
  description,
  children,
  wide = false,
  size,
}: {
  title: string
  description?: string
  children: ReactNode
  wide?: boolean
  size?: "default" | "wide" | "desk"
}) {
  const width = size === "desk" ? "max-w-[90rem]" : size === "wide" || wide ? "max-w-5xl" : "max-w-2xl"
  return (
    <main className={cn("mx-auto flex min-h-dvh w-full flex-col gap-8 px-4 py-8", width)}>
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Ejemplo
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <ThemeToggle />
      </header>
      {children}
    </main>
  )
}
