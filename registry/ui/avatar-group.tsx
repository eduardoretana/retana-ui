"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type AvatarGroupMember = {
  name: string
  src?: string
  status?: "online" | "offline"
}

export type AvatarGroupClassNames = {
  root?: string
  slot?: string
  avatar?: string
  overflow?: string
  count?: string
  tip?: string
}

export type AvatarGroupProps = {
  members: AvatarGroupMember[]
  max?: number
  size?: "sm" | "md" | "lg"
  label?: string
  className?: string
  classNames?: AvatarGroupClassNames
}

const rise: Variants = {
  hidden: (direction: number) => ({
    opacity: 0,
    y: `${0.4 * direction}em`,
    filter: `blur(${motionPresets.blur.subtle}px)`,
  }),
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] },
  },
  gone: (direction: number) => ({
    opacity: 0,
    y: `${-0.4 * direction}em`,
    filter: `blur(${motionPresets.blur.subtle}px)`,
    transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
  }),
}

const fade: Variants = {
  hidden: { opacity: 0, y: 0, filter: "blur(0px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
  gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
}

const slotMotion = {
  initial: { width: 0, opacity: 0, scale: 0.9 },
  animate: { width: "auto", opacity: 1, scale: 1 },
  exit: { width: 0, opacity: 0, scale: 0.9 },
}

const pixelSize = { sm: 28, md: 36, lg: 48 } as const
const avatarSize = { sm: "sm", md: "default", lg: "lg" } as const

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function AvatarGroup({
  members,
  max = 4,
  size = "md",
  label = "Team members",
  className,
  classNames,
}: AvatarGroupProps) {
  const reduceMotion = !!useReducedMotion()
  const visible = members.slice(0, Math.max(0, max))
  const overflow = Math.max(0, members.length - visible.length)
  const transition = reduceMotion ? { duration: 0 } : motionPresets.spring.morph
  const [count, setCount] = React.useState({ overflow, direction: 1 })
  if (count.overflow !== overflow) setCount({ overflow, direction: overflow < count.overflow ? -1 : 1 })
  const px = pixelSize[size]
  const stack = visible.length + (overflow > 0 ? 1 : 0)

  return (
    <div
      data-slot="avatar-group"
      role="group"
      aria-label={label}
      style={{ "--count": stack, height: px } as React.CSSProperties}
      className={cn("group/avatars inline-flex min-w-0 items-center ps-1.5", className, classNames?.root)}
    >
      <AnimatePresence initial={false}>
        {visible.map((member, index) => (
          <motion.span
            key={member.name}
            data-slot="avatar-group-slot"
            className={cn(
              "peer relative inline-flex h-full shrink-0 items-center [--aside:0px] hover:z-10",
              "has-[~.peer:hover]:[--aside:-3px] peer-hover:[--aside:3px]",
              classNames?.slot,
            )}
            style={{ "--index": index } as React.CSSProperties}
            {...slotMotion}
            transition={transition}
          >
            <span
              className={cn(
                "group/slot relative inline-flex -ms-1.5 rounded-full [--fan:0px] [--rise:0px] outline-none",
                "translate-x-[calc(var(--fan)+var(--aside))] translate-y-(--rise) transition-transform duration-300 ease-out",
                "group-hover/avatars:[--fan:calc((var(--index)-(var(--count)-1)/2)*4px)]",
                "group-hover/slot:[--rise:-2px] focus-visible:z-10 motion-reduce:!transform-none motion-reduce:transition-none",
              )}
            >
              <Avatar
                data-slot="avatar-group-avatar"
                size={avatarSize[size]}
                style={{ width: px, height: px }}
                role="img"
                tabIndex={0}
                aria-label={`${member.name}${member.status ? `, ${member.status}` : ""}`}
                className={cn("ring-2 ring-background outline-none focus-visible:ring-ring", classNames?.avatar)}
              >
                {member.src ? <AvatarImage src={member.src} alt="" /> : null}
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
                <AnimatePresence initial={false}>
                  {member.status ? (
                    <motion.span
                      key={member.status}
                      className="absolute end-0 bottom-0 z-10 grid leading-none"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6, transition: { duration: reduceMotion ? 0 : motionPresets.duration.fast } }}
                      transition={reduceMotion ? { duration: 0 } : motionPresets.spring.snappy}
                    >
                      <AvatarBadge className={cn("static!", member.status === "offline" && "bg-muted-foreground")} />
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </Avatar>
              <span
                data-slot="avatar-group-tip"
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 max-w-64 -translate-x-1/2 translate-y-0.75 truncate rounded-full bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition duration-150",
                  "group-hover/slot:translate-y-0 group-hover/slot:opacity-100 group-focus-within/slot:translate-y-0 group-focus-within/slot:opacity-100 motion-reduce:transition-none",
                  classNames?.tip,
                )}
              >
                {member.name}
              </span>
            </span>
          </motion.span>
        ))}
        {overflow > 0 ? (
          <motion.span
            key="overflow"
            data-slot="avatar-group-slot"
            className={cn(
              "peer relative inline-flex h-full shrink-0 items-center [--aside:0px] hover:z-10",
              "has-[~.peer:hover]:[--aside:-3px] peer-hover:[--aside:3px]",
              classNames?.slot,
            )}
            style={{ "--index": visible.length } as React.CSSProperties}
            {...slotMotion}
            transition={transition}
          >
            <span
              tabIndex={0}
              data-slot="avatar-group-overflow"
              role="img"
              aria-label={`${overflow} more ${label.toLowerCase()}`}
              style={{ width: px, height: px }}
              className={cn(
                "group/slot relative -ms-1.5 inline-grid place-items-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground tabular-nums ring-2 ring-background outline-none",
                "[--fan:0px] [--rise:0px] translate-x-[calc(var(--fan)+var(--aside))] translate-y-(--rise) transition-transform duration-300 ease-out",
                "group-hover/avatars:[--fan:calc((var(--index)-(var(--count)-1)/2)*4px)] group-hover/slot:[--rise:-2px]",
                "motion-reduce:!transform-none motion-reduce:transition-none",
                size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : "text-xs",
                classNames?.overflow,
              )}
            >
              <AnimatePresence mode="popLayout" initial={false} custom={count.direction}>
                <motion.span
                  key={overflow}
                  data-slot="avatar-group-count"
                  custom={count.direction}
                  variants={reduceMotion ? fade : rise}
                  initial="hidden"
                  animate="shown"
                  exit="gone"
                  aria-hidden="true"
                  className={cn("inline-block", classNames?.count)}
                >
                  +{overflow}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
