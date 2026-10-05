"use client"

/** Clean-room send dialog. The link is read-only; sending is a callback. */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/registry/retana/ui/copy-button"
import { ProposalMotionDialog } from "@/registry/retana/ui/proposal-dialog"

export type SendRecipient = { value: string; label: string }

export type ProposalSendProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  recipients: readonly SendRecipient[]
  recipient?: string
  onRecipientChange?: (value: string) => void
  recipientLabel?: string
  project: string
  price: string
  weeks: string
  projectLabel?: string
  priceLabel?: string
  weeksLabel?: string
  message?: string
  onMessageChange?: (value: string) => void
  messageLabel?: string
  link: string
  linkLabel?: string
  copyLabel?: string
  copiedLabel?: string
  cancelLabel?: string
  sendLabel?: string
  onSend?: () => void
  closeLabel?: string
  inline?: boolean
  className?: string
}

export function ProposalSend({
  open,
  onOpenChange,
  title = "Send proposal",
  recipients,
  recipient,
  onRecipientChange,
  recipientLabel = "Recipient",
  project,
  price,
  weeks,
  projectLabel = "Project",
  priceLabel = "Price",
  weeksLabel = "Weeks",
  message = "",
  onMessageChange,
  messageLabel = "Message",
  link,
  linkLabel = "Link",
  copyLabel = "Copy",
  copiedLabel = "Copied",
  cancelLabel = "Cancel",
  sendLabel = "Send",
  onSend,
  closeLabel = "Close",
  inline = false,
  className,
}: ProposalSendProps) {
  const form = (
      <div data-slot="proposal-send" className={cn("grid gap-4", inline && className)}>
        <div className="grid gap-1.5">
          <Label htmlFor="proposal-recipient">{recipientLabel}</Label>
          <Select value={recipient} onValueChange={onRecipientChange}>
            <SelectTrigger id="proposal-recipient" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {recipients.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <dl className="grid gap-2 rounded-lg bg-muted/50 p-3 text-sm sm:grid-cols-3">
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{projectLabel}</dt>
            <dd className="truncate">{project}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{priceLabel}</dt>
            <dd className="tabular-nums">{price}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{weeksLabel}</dt>
            <dd className="tabular-nums">{weeks}</dd>
          </div>
        </dl>
        <div className="grid gap-1.5">
          <Label htmlFor="proposal-message">{messageLabel}</Label>
          <Textarea id="proposal-message" value={message} onChange={(event) => onMessageChange?.(event.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="proposal-link">{linkLabel}</Label>
          <div className="flex min-w-0 items-center gap-2">
            <Input id="proposal-link" readOnly value={link} className="min-w-0" />
            <CopyButton value={link} label={copyLabel} copiedLabel={copiedLabel} />
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button type="button" disabled={!recipient} onClick={onSend}>
            {sendLabel}
          </Button>
        </div>
      </div>
  )

  if (inline) return form

  return (
    <ProposalMotionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      closeLabel={closeLabel}
      className={cn("w-[min(100%-2rem,32rem)]", className)}
    >
      {form}
    </ProposalMotionDialog>
  )
}
