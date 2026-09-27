"use client"

import * as React from "react"
import { ChevronDown, Inbox } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export type EntityFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  presentation?: "dialog" | "sheet"
  onSubmit: (formData: FormData) => Promise<void> | void
  onDelete?: () => Promise<void> | void
  submitLabel?: string
  cancelLabel?: string
  deleteLabel?: string
  busy?: boolean
  children?: React.ReactNode
  className?: string
}

/**
 * Create or edit one record in a dialog or a sheet.
 *
 * Position is not part of the form. The parent should pass the existing
 * `position` through `keepPosition` so a save does not send the row to the end.
 * While `busy` is true (an upload, for example) submit stays disabled.
 */
export function EntityForm({
  open,
  onOpenChange,
  title,
  description,
  presentation = "dialog",
  onSubmit,
  onDelete,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  deleteLabel = "Delete",
  busy = false,
  children,
  className,
}: EntityFormProps) {
  const [pending, setPending] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const locked = busy || pending

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked) return
    const formData = new FormData(event.currentTarget)
    setPending(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  const form = (
    <form className="flex min-h-0 flex-1 flex-col gap-4" onSubmit={handleSubmit}>
      <div className={cn("flex flex-col gap-3", className)}>{children}</div>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {onDelete ? (
          <Button type="button" variant="destructive" onClick={() => setConfirmOpen(true)} disabled={locked}>
            {deleteLabel}
          </Button>
        ) : null}
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={locked}>
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={locked}>
            {pending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )

  return (
    <>
      {presentation === "sheet" ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent className="flex w-full flex-col sm:max-w-md" side="right">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              {description ? <SheetDescription>{description}</SheetDescription> : null}
            </SheetHeader>
            {form}
            <SheetFooter className="hidden" />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </DialogHeader>
            <div className="min-h-0 overflow-y-auto">{form}</div>
            <DialogFooter className="hidden" />
          </DialogContent>
        </Dialog>
      )}
      {onDelete ? (
        <ConfirmDelete
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={deleteLabel}
          description={description ?? title}
          confirmLabel={deleteLabel}
          onConfirm={async () => {
            await onDelete()
            setConfirmOpen(false)
            onOpenChange(false)
          }}
        />
      ) : null}
    </>
  )
}

export type ConfirmDeleteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => Promise<void> | void
}

export function ConfirmDelete({
  open,
  onOpenChange,
  title = "Delete",
  description = "This cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
}: ConfirmDeleteProps) {
  const [pending, setPending] = React.useState(false)
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault()
              setPending(true)
              Promise.resolve(onConfirm()).finally(() => setPending(false))
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-10 text-center",
        className,
      )}
    >
      <Inbox className="size-5 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  )
}

export function AdminSection({
  title,
  description,
  defaultOpen = true,
  children,
  className,
}: {
  title: string
  description?: string
  defaultOpen?: boolean
  children?: React.ReactNode
  className?: string
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className={cn("rounded-xl bg-card ring-1 ring-foreground/10", className)}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{title}</span>
          {description ? <span className="block text-xs text-muted-foreground">{description}</span> : null}
        </span>
        <ChevronDown className="size-4 text-muted-foreground transition-transform in-data-[state=open]:rotate-180 motion-reduce:transition-none" />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-3 px-4 pb-4">{children}</CollapsibleContent>
    </Collapsible>
  )
}
