"use client"

/**
 * Clean-room task detail. Fields, subtasks, comments, reminder, and attachments.
 * The host saves through callbacks. This file does not fetch.
 */

import * as React from "react"
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Tag,
  Users,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PriorityBadge } from "@/registry/retana/ui/priority-badge"
import {
  defaultPriorities,
  defaultSubtaskStatuses,
  formatFileSize,
  formatTaskDate,
  fromDateTimeLocal,
  isTaskPriority,
  personName,
  resolveTaskBoardLabels,
  threadComments,
  toDateTimeLocal,
  type TaskBoardLabels,
  type TaskComment,
  type TaskCommentInput,
  type TaskOption,
  type TaskPatch,
  type TaskPerson,
  type TaskPriority,
  type TaskRecord,
  type TaskSubtaskDraft,
} from "@/registry/retana/lib/task-board"

const selectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"

export type TaskDetailProps<TMeta = Record<string, unknown>> = {
  task: TaskRecord<TMeta>
  people?: readonly TaskPerson[]
  stages?: readonly TaskOption[]
  categories?: readonly TaskOption[]
  priorities?: readonly { id: TaskPriority; label: string }[]
  subtaskStatuses?: readonly TaskOption[]
  /** 1-based index in the ordered collection. */
  position?: number
  total?: number
  locale?: string
  labels?: Partial<TaskBoardLabels>
  readOnly?: boolean
  onClose?: () => void
  onPrevious?: () => void
  onNext?: () => void
  onUpdate?: (id: string, patch: TaskPatch<TMeta>) => void | Promise<void>
  onStageChange?: (stageId: string) => void
  onAddSubtask?: (id: string, draft: TaskSubtaskDraft) => void | Promise<void>
  onSubtaskStatusChange?: (taskId: string, subtaskId: string, statusId: string) => void | Promise<void>
  onComment?: (id: string, input: TaskCommentInput) => void | Promise<void>
  onAttach?: (id: string, files: readonly File[]) => void | Promise<void>
  onRemoveAttachment?: (taskId: string, attachmentId: string) => void | Promise<void>
  className?: string
}

export function TaskDetail<TMeta extends Record<string, unknown> = Record<string, unknown>>(props: TaskDetailProps<TMeta>) {
  return <TaskDetailForm key={props.task.id} {...props} />
}

function TaskDetailForm<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  task,
  people = [],
  stages = [],
  categories = [],
  priorities,
  subtaskStatuses,
  position = 1,
  total = 1,
  locale = "es",
  labels: labelOverrides,
  readOnly = false,
  onClose,
  onPrevious,
  onNext,
  onUpdate,
  onStageChange,
  onAddSubtask,
  onSubtaskStatusChange,
  onComment,
  onAttach,
  onRemoveAttachment,
  className,
}: TaskDetailProps<TMeta>) {
  const labels = resolveTaskBoardLabels(labelOverrides)
  const priorityOptions = priorities ?? defaultPriorities(labels)
  const statusOptions = subtaskStatuses ?? defaultSubtaskStatuses(labels)
  const threads = threadComments(task.comments)
  const [expanded, setExpanded] = React.useState(false)
  const [editing, setEditing] = React.useState(false)
  const [description, setDescription] = React.useState(task.description ?? "")
  const [subtaskTitle, setSubtaskTitle] = React.useState("")
  const [body, setBody] = React.useState("")
  const [parentId, setParentId] = React.useState<string | null>(null)
  const [files, setFiles] = React.useState<File[]>([])
  const fileRef = React.useRef<HTMLInputElement>(null)
  const commentRef = React.useRef<HTMLTextAreaElement>(null)
  const long = (task.description ?? "").length > 180

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (target.closest("input, textarea, select, [contenteditable='true']")) return
    if (event.key === "ArrowLeft" && onPrevious) {
      event.preventDefault()
      onPrevious()
    }
    if (event.key === "ArrowRight" && onNext) {
      event.preventDefault()
      onNext()
    }
  }

  function patch(next: TaskPatch<TMeta>) {
    if (readOnly) return
    void onUpdate?.(task.id, next)
  }

  function addSubtask(event: React.FormEvent) {
    event.preventDefault()
    const title = subtaskTitle.trim()
    if (!title || readOnly) return
    void onAddSubtask?.(task.id, { title, statusId: statusOptions[0]?.id, priority: "medium" })
    setSubtaskTitle("")
  }

  function sendComment() {
    if (readOnly) return
    const text = body.trim()
    if (!text && files.length === 0) return
    if (text) void onComment?.(task.id, { body: text, parentId, files })
    else void onAttach?.(task.id, files)
    setBody("")
    setParentId(null)
    setFiles([])
  }

  function onCommentKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return
    event.preventDefault()
    sendComment()
  }

  const parent = parentId ? task.comments?.find((comment) => comment.id === parentId) : undefined
  const parentName = parent ? personName(people, parent.authorId, labels.unknownAuthor) : ""

  return (
    <div
      data-slot="task-detail"
      className={cn("flex h-full min-h-0 flex-col bg-popover text-popover-foreground", className)}
      onKeyDown={onKeyDown}
    >
      <header className="flex shrink-0 items-start gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{labels.detailTitle}</p>
          <h2 className="text-base font-semibold break-all" dir="auto">
            {task.title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={labels.previous}
            aria-keyshortcuts="ArrowLeft"
            disabled={!onPrevious}
            onClick={onPrevious}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={labels.next}
            aria-keyshortcuts="ArrowRight"
            disabled={!onNext}
            onClick={onNext}
          >
            <ChevronRight aria-hidden />
          </Button>
          <span className="px-1 text-xs text-muted-foreground tabular-nums">{labels.position(position, total)}</span>
          {onClose ? (
            <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.close} onClick={onClose}>
              <X aria-hidden />
            </Button>
          ) : null}
        </div>
      </header>
      <p className="sr-only">{labels.shortcuts}</p>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="grid gap-3">
          <Field icon={<Calendar aria-hidden />} label={labels.due}>
            <div className="flex items-center gap-2">
              <Input
                type="datetime-local"
                aria-label={labels.due}
                value={toDateTimeLocal(task.dueAt)}
                disabled={readOnly}
                onChange={(event) => patch({ dueAt: fromDateTimeLocal(event.target.value) })}
              />
              {task.dueAt && !readOnly ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => patch({ dueAt: null })}>
                  {labels.clearValue}
                </Button>
              ) : null}
            </div>
            {task.dueAt ? (
              <p className="mt-1 text-xs text-muted-foreground">{formatTaskDate(task.dueAt, locale)}</p>
            ) : null}
          </Field>
          {categories.length > 0 ? (
            <Field icon={<Tag aria-hidden />} label={labels.category}>
              <select
                className={selectClass}
                aria-label={labels.category}
                value={task.categoryId ?? ""}
                disabled={readOnly}
                onChange={(event) => patch({ categoryId: event.target.value || null })}
              >
                <option value="">{labels.noCategory}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          <Field icon={<PriorityBadge level={task.priority} variant="glyph" />} label={labels.priority}>
            <select
              className={selectClass}
              aria-label={labels.priority}
              value={task.priority}
              disabled={readOnly}
              onChange={(event) => {
                if (isTaskPriority(event.target.value)) patch({ priority: event.target.value })
              }}
            >
              {priorityOptions.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.label}
                </option>
              ))}
            </select>
          </Field>
          {stages.length > 0 ? (
            <Field icon={<ListChecks aria-hidden />} label={labels.stage}>
              <select
                className={selectClass}
                aria-label={labels.stage}
                value={task.stageId}
                disabled={readOnly}
                onChange={(event) => onStageChange?.(event.target.value)}
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
                {stages.some((stage) => stage.id === task.stageId) ? null : (
                  <option value={task.stageId}>{task.stageId}</option>
                )}
              </select>
            </Field>
          ) : null}
          <Field icon={<Bell aria-hidden />} label={labels.reminder}>
            <div className="flex items-center gap-2">
              <Input
                type="datetime-local"
                aria-label={labels.reminder}
                value={toDateTimeLocal(task.reminderAt)}
                disabled={readOnly}
                onChange={(event) => patch({ reminderAt: fromDateTimeLocal(event.target.value) })}
              />
              {task.reminderAt && !readOnly ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => patch({ reminderAt: null })}>
                  {labels.clearValue}
                </Button>
              ) : null}
            </div>
          </Field>
          {people.length > 0 ? (
            <Field icon={<Users aria-hidden />} label={labels.assigneesLabel}>
              <fieldset>
                <legend className="sr-only">{labels.assigneesLabel}</legend>
                <div className="flex flex-wrap gap-1.5">
                  {people.map((person) => {
                    const checked = task.assigneeIds.includes(person.id)
                    return (
                      <label
                        key={person.id}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs"
                      >
                        <Checkbox
                          checked={checked}
                          disabled={readOnly}
                          onCheckedChange={(value) => {
                            const assigneeIds = value
                              ? [...task.assigneeIds, person.id]
                              : task.assigneeIds.filter((id) => id !== person.id)
                            patch({ assigneeIds })
                          }}
                        />
                        <span className="truncate" dir="auto">
                          {person.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            </Field>
          ) : null}
          <Field icon={<MessageSquare aria-hidden />} label={labels.description}>
            {editing ? (
              <div className="grid gap-2">
                <Textarea
                  aria-label={labels.description}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className="break-all"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      patch({ description })
                      setEditing(false)
                    }}
                  >
                    {labels.save}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDescription(task.description ?? "")
                      setEditing(false)
                    }}
                  >
                    {labels.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-1">
                <p className={cn("text-sm break-all whitespace-pre-wrap", long && !expanded && "line-clamp-3")} dir="auto">
                  {task.description || labels.noDescription}
                </p>
                <div className="flex flex-wrap gap-2">
                  {long ? (
                    <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setExpanded((value) => !value)}>
                      {expanded ? labels.readLess : labels.readMore}
                    </Button>
                  ) : null}
                  {readOnly ? null : (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
                      <Pencil aria-hidden />
                      {labels.editDescription}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Field>
        </div>

        <section className="mt-6" aria-labelledby="task-subtasks-heading">
          <div className="flex items-center justify-between gap-2">
            <h3 id="task-subtasks-heading" className="text-sm font-medium">
              {labels.subtasksTitle(task.subtasks?.length ?? 0)}
            </h3>
          </div>
          {readOnly ? null : (
            <form className="mt-2 flex items-center gap-2" onSubmit={addSubtask}>
              <Input
                value={subtaskTitle}
                onChange={(event) => setSubtaskTitle(event.target.value)}
                placeholder={labels.subtaskPlaceholder}
                aria-label={labels.subtaskPlaceholder}
              />
              <Button type="submit" size="sm" className="shrink-0" disabled={!subtaskTitle.trim()}>
                <Plus aria-hidden />
                {labels.addSubtask}
              </Button>
            </form>
          )}
          {task.subtasks?.length ? (
            <ul className="mt-3 grid gap-2">
              {task.subtasks.map((subtask) => (
                <li key={subtask.id} className="rounded-lg border border-border p-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 text-sm font-medium break-all" dir="auto">
                      {subtask.title}
                    </p>
                    {subtask.priority ? <PriorityBadge level={subtask.priority} /> : null}
                  </div>
                  {subtask.description ? (
                    <p className="mt-1 text-xs text-muted-foreground break-all" dir="auto">
                      {subtask.description}
                    </p>
                  ) : null}
                  <select
                    className={cn(selectClass, "mt-2")}
                    aria-label={labels.subtaskStatus(subtask.title)}
                    value={subtask.statusId}
                    disabled={readOnly}
                    onChange={(event) => void onSubtaskStatusChange?.(task.id, subtask.id, event.target.value)}
                  >
                    {statusOptions.some((status) => status.id === subtask.statusId) ? null : (
                      <option value={subtask.statusId}>{subtask.statusId}</option>
                    )}
                    {statusOptions.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{labels.noSubtasks}</p>
          )}
        </section>

        {(task.attachments?.length ?? 0) > 0 ? (
          <section className="mt-6" aria-labelledby="task-attachments-heading">
            <h3 id="task-attachments-heading" className="text-sm font-medium">
              {labels.attachments}
            </h3>
            <ul className="mt-2 grid gap-1">
              {task.attachments?.map((file) => (
                <li key={file.id} className="flex items-center gap-2 text-sm">
                  <Paperclip className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  {file.href ? (
                    <a className="min-w-0 truncate underline-offset-4 hover:underline" href={file.href} dir="auto">
                      {file.name}
                    </a>
                  ) : (
                    <span className="min-w-0 truncate" dir="auto">
                      {file.name}
                    </span>
                  )}
                  {typeof file.size === "number" ? (
                    <span className="text-xs text-muted-foreground tabular-nums">{formatFileSize(file.size)}</span>
                  ) : null}
                  {readOnly ? null : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ms-auto"
                      onClick={() => void onRemoveAttachment?.(task.id, file.id)}
                    >
                      {labels.removeAttachment(file.name)}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-6" aria-labelledby="task-comments-heading">
          <h3 id="task-comments-heading" className="text-sm font-medium">
            {labels.commentsTitle}
          </h3>
          {threads.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">{labels.noComments}</p> : null}
          <ol className="mt-3 grid gap-4">
            {threads.map(({ comment, replies }) => (
              <li key={comment.id}>
                <CommentBlock
                  comment={comment}
                  people={people}
                  locale={locale}
                  labels={labels}
                  readOnly={readOnly}
                  onReply={() => {
                    setParentId(comment.id)
                    commentRef.current?.focus()
                  }}
                />
                {replies.length > 0 ? (
                  <ul className="mt-3 grid gap-3 border-s border-border ps-3">
                    {replies.map((reply) => (
                      <li key={reply.id}>
                        <CommentBlock comment={reply} people={people} locale={locale} labels={labels} readOnly />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
          {readOnly ? null : (
            <div className="mt-4 grid gap-2">
              {parentId ? (
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{labels.replyingTo(parentName)}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setParentId(null)}>
                    {labels.cancelReply}
                  </Button>
                </div>
              ) : null}
              <Textarea
                ref={commentRef}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={onCommentKeyDown}
                placeholder={labels.commentPlaceholder}
                aria-label={labels.commentPlaceholder}
                rows={3}
              />
              {files.length > 0 ? (
                <ul className="grid gap-1">
                  {files.map((file) => (
                    <li key={`${file.name}-${file.size}`} className="flex items-center gap-2 text-xs">
                      <span className="min-w-0 truncate" dir="auto">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                      >
                        {labels.removePendingFile(file.name)}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex items-center justify-end gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  className="sr-only"
                  aria-label={labels.attach}
                  onChange={(event) => {
                    const list = Array.from(event.target.files ?? [])
                    setFiles((current) => [...current, ...list])
                    event.target.value = ""
                  }}
                />
                <Button type="button" variant="outline" size="icon-sm" aria-label={labels.attach} onClick={() => fileRef.current?.click()}>
                  <Paperclip aria-hidden />
                </Button>
                <Button type="button" size="sm" onClick={sendComment} disabled={!body.trim() && files.length === 0}>
                  <Send aria-hidden />
                  {labels.send}
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-start sm:gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-flex size-4 shrink-0 items-center justify-center">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function CommentBlock({
  comment,
  people,
  locale,
  labels,
  readOnly,
  onReply,
}: {
  comment: TaskComment
  people: readonly TaskPerson[]
  locale: string
  labels: TaskBoardLabels
  readOnly?: boolean
  onReply?: () => void
}) {
  const name = personName(people, comment.authorId, labels.unknownAuthor)
  return (
    <article className="grid gap-1" aria-label={name}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-medium" dir="auto">
          {name}
        </span>
        <time className="text-xs text-muted-foreground" dateTime={comment.createdAt}>
          {formatTaskDate(comment.createdAt, locale)}
        </time>
      </div>
      <p className="text-sm break-all whitespace-pre-wrap" dir="auto">
        {comment.body}
      </p>
      {onReply && !readOnly ? (
        <Button type="button" variant="link" size="sm" className="h-auto justify-start px-0" onClick={onReply}>
          {labels.reply}
        </Button>
      ) : null}
    </article>
  )
}
