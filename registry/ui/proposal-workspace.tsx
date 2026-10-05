"use client"

/** Clean-room deal workspace. The underline slides; the panel crossfades. */

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type ProposalCrumb = { id: string; label: string; href?: string }

export type ProposalWorkspaceTab = { id: string; label: string }

export type ProposalWorkspaceProps = {
  crumbs: readonly ProposalCrumb[]
  tabs: readonly ProposalWorkspaceTab[]
  value: string
  onValueChange: (id: string) => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function ProposalWorkspace({
  crumbs,
  tabs,
  value,
  onValueChange,
  title,
  children,
  className,
}: ProposalWorkspaceProps) {
  const reduced = !!useReducedMotion()
  const listRef = React.useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = React.useState({ left: 0, width: 0 })

  const measure = React.useCallback(() => {
    const list = listRef.current
    if (!list) return
    const current = list.querySelector<HTMLElement>("[data-state=active]")
    if (!current) return
    const listBox = list.getBoundingClientRect()
    const tabBox = current.getBoundingClientRect()
    setIndicator({ left: tabBox.left - listBox.left + list.scrollLeft, width: tabBox.width })
  }, [])

  React.useLayoutEffect(() => {
    measure()
  }, [measure, value, tabs])

  React.useEffect(() => {
    const list = listRef.current
    if (!list || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => measure())
    observer.observe(list)
    return () => observer.disconnect()
  }, [measure])

  return (
    <section data-slot="proposal-workspace" className={cn("flex min-w-0 flex-col gap-4", className)}>
      <div className="min-w-0">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1
              return (
                <React.Fragment key={crumb.id}>
                  <BreadcrumbItem>
                    {last || !crumb.href ? (
                      <BreadcrumbPage className="max-w-48 truncate">{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href} className="max-w-40 truncate">
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {last ? null : <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        {title ? <h1 className="mt-2 text-xl font-medium tracking-tight wrap-break-word">{title}</h1> : null}
      </div>
      <Tabs value={value} onValueChange={onValueChange}>
        <div className="overflow-x-auto">
          <div ref={listRef} className="relative w-max min-w-full">
            <TabsList variant="line" className="h-auto w-max min-w-full justify-start gap-1 bg-transparent p-0">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="h-9 flex-none px-2 after:hidden">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <motion.span
              data-slot="proposal-tab-indicator"
              className="pointer-events-none absolute bottom-0 h-0.5 bg-foreground"
              initial={false}
              animate={{ left: indicator.left, width: indicator.width }}
              transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            />
          </div>
        </div>
      </Tabs>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={value}
          data-slot="proposal-panel"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
