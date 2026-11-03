"use client"

/**
 * Clean-room pull request chip.
 * Idea only, no license: a diff chip opens into a request and its commits.
 * No source, copy, or layout from the reference was copied.
 * The host passes the data. This file does not fetch.
 */

import * as React from "react"
import { GitPullRequest, Minus, Plus } from "lucide-react"
import { motion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

import { useReducedMotion } from "./use-reduced-motion"

export type PrState = "creating" | "open" | "merged" | "closed" | "error"

export type DiffStat = {
  add: number
  del: number
}

export type CommitNode = {
  sha: string
  message: string
  author: string
  timeLabel: string
  branches?: readonly string[]
}

export type PrCreateCardLabels = {
  state: (state: PrState) => string
  chip: (add: number, del: number) => string
  expand: string
  collapse: string
  commits: string
  emptyCommits: string
  liveCreating: string
  liveOpen: (pullNumber: number) => string
  liveMerged: (pullNumber: number) => string
  liveClosed: (pullNumber: number) => string
  liveError: string
  additions: string
  deletions: string
}

const prStateEn: Record<PrState, string> = {
  creating: "Creating",
  open: "Open",
  merged: "Merged",
  closed: "Closed",
  error: "Error",
}

const prStateEs: Record<PrState, string> = {
  creating: "Creando",
  open: "Abierto",
  merged: "Fusionado",
  closed: "Cerrado",
  error: "Error",
}

export const prCreateCardLabels: PrCreateCardLabels = {
  state: (state) => prStateEn[state],
  chip: (add, del) => `${add} additions, ${del} deletions`,
  expand: "Show the pull request",
  collapse: "Hide the pull request",
  commits: "Commits",
  emptyCommits: "No commits yet",
  liveCreating: "Creating the pull request.",
  liveOpen: (pullNumber) => `Pull request ${pullNumber} is open.`,
  liveMerged: (pullNumber) => `Pull request ${pullNumber} is merged.`,
  liveClosed: (pullNumber) => `Pull request ${pullNumber} is closed.`,
  liveError: "The pull request could not be opened.",
  additions: "additions",
  deletions: "deletions",
}

export const prCreateCardLabelsEs: PrCreateCardLabels = {
  state: (state) => prStateEs[state],
  chip: (add, del) => `${add} adiciones, ${del} supresiones`,
  expand: "Mostrar el pull request",
  collapse: "Ocultar el pull request",
  commits: "Commits",
  emptyCommits: "Sin commits",
  liveCreating: "Creando el pull request.",
  liveOpen: (pullNumber) => `El pull request ${pullNumber} está abierto.`,
  liveMerged: (pullNumber) => `El pull request ${pullNumber} está fusionado.`,
  liveClosed: (pullNumber) => `El pull request ${pullNumber} está cerrado.`,
  liveError: "No se pudo abrir el pull request.",
  additions: "adiciones",
  deletions: "supresiones",
}

export type PrCreateCardProps = {
  title: string
  number?: number
  state: PrState
  diffStat?: DiffStat
  commits?: readonly CommitNode[]
  errorMessage?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: "rail" | "compact"
  labels?: PrCreateCardLabels
  className?: string
}

function liveMessage(labels: PrCreateCardLabels, state: PrState, pullNumber?: number) {
  if (state === "creating") return labels.liveCreating
  if (state === "error") return labels.liveError
  if (pullNumber == null) return labels.state(state)
  if (state === "merged") return labels.liveMerged(pullNumber)
  if (state === "closed") return labels.liveClosed(pullNumber)
  if (state === "open") return labels.liveOpen(pullNumber)
  return labels.state(state)
}

export function PrCreateCard({
  title,
  number,
  state,
  diffStat = { add: 0, del: 0 },
  commits = [],
  errorMessage,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  variant = "rail",
  labels = prCreateCardLabels,
  className,
}: PrCreateCardProps) {
  const reduced = useReducedMotion()
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const panelId = React.useId()
  const setOpen = (next: boolean) => {
    onOpenChange?.(next)
    if (openProp === undefined) setUncontrolled(next)
  }
  const chipLabel = `${state === "creating" ? `${labels.state("creating")}. ` : ""}${labels.chip(diffStat.add, diffStat.del)}. ${open ? labels.collapse : labels.expand}`

  return (
    <div
      data-testid="pr-create-card"
      data-variant={variant}
      data-motion={reduced ? "reduced" : "full"}
      className={cn("flex w-full min-w-0 flex-col items-start gap-2", className)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={chipLabel}
        onClick={() => setOpen(!open)}
        className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-[opacity,transform] duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <GitPullRequest className="size-3.5 shrink-0" aria-hidden />
        {state === "creating" ? <span className="shrink-0">{labels.state("creating")}</span> : null}
        <span className="inline-flex items-center gap-1 font-mono text-xs">
          <Plus className="size-3" aria-hidden />
          <span>{diffStat.add}</span>
          <span className="sr-only">{labels.additions}</span>
          <Minus className="size-3" aria-hidden />
          <span>{diffStat.del}</span>
          <span className="sr-only">{labels.deletions}</span>
        </span>
      </button>
      {open ? (
        <motion.section
          id={panelId}
          aria-labelledby={`${panelId}-title`}
          initial={reduced ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: motionPresets.duration.standard, ease: motionPresets.ease.standard }}
          style={{ willChange: reduced ? "auto" : "transform, opacity" }}
          className="w-full min-w-0 rounded-xl border border-border bg-card p-3 shadow-sm"
        >
          <div className="flex min-w-0 flex-wrap items-start gap-2">
            <h2 id={`${panelId}-title`} className="min-w-0 flex-1 text-sm font-medium break-words text-foreground">
              {title}
            </h2>
            {number != null ? <span className="font-mono text-sm text-muted-foreground">#{number}</span> : null}
            <Badge variant={state === "error" ? "destructive" : "outline"}>
              <GitPullRequest aria-hidden />
              {labels.state(state)}
            </Badge>
          </div>
          {state === "error" && errorMessage ? (
            <p role="alert" className="mt-2 text-sm break-words text-destructive">
              {errorMessage}
            </p>
          ) : null}
          <h3 className="mt-3 text-xs font-medium text-muted-foreground">{labels.commits}</h3>
          {commits.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">{labels.emptyCommits}</p>
          ) : variant === "compact" ? (
            <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {commits.map((commit) => (
                <li key={commit.sha} className="min-w-0 rounded-md border border-border p-2">
                  <CommitBody commit={commit} />
                </li>
              ))}
            </ul>
          ) : (
            <ol className="mt-2 flex flex-col">
              {commits.map((commit, index) => (
                <li key={commit.sha} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2">
                  <span className="flex flex-col items-center" aria-hidden>
                    <span className="mt-1 size-2 shrink-0 rounded-full border border-foreground bg-background" />
                    {index < commits.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
                  </span>
                  <div className="min-w-0 pb-3">
                    <CommitBody commit={commit} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </motion.section>
      ) : null}
      <p role="status" aria-live="polite" className="sr-only">
        {liveMessage(labels, state, number)}
      </p>
    </div>
  )
}

function CommitBody({ commit }: { commit: CommitNode }) {
  return (
    <div className="min-w-0">
      <p className="text-sm break-words text-foreground">{commit.message}</p>
      <p className="font-mono text-xs break-all text-muted-foreground">{commit.sha}</p>
      <p className="text-xs break-words text-muted-foreground">
        {commit.author}
        <span aria-hidden> · </span>
        {commit.timeLabel}
      </p>
      {commit.branches && commit.branches.length > 0 ? (
        <p className="mt-1 flex flex-wrap gap-1">
          {commit.branches.map((branch) => (
            <Badge key={branch} variant="secondary" className="max-w-full">
              <span className="truncate">{branch}</span>
            </Badge>
          ))}
        </p>
      ) : null}
    </div>
  )
}
