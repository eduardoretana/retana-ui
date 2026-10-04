"use client"

import { Heart, MessageCircle, MessageSquare, UserPlus } from "lucide-react"

import type { NotificationStackItem } from "@/registry/ui/notification-stack"

export const sampleNotices: NotificationStackItem[] = [
  {
    id: "note",
    title: "New message",
    body: "Inés sent a note about the Friday firing.",
    time: "2m",
    dateTime: "2026-10-04T11:58:00",
    tone: "chart-1",
    icon: <MessageSquare className="size-4" aria-hidden />,
  },
  {
    id: "like",
    title: "Liked your post",
    body: "Mateo liked the kiln log from this morning.",
    time: "8m",
    dateTime: "2026-10-04T11:52:00",
    tone: "chart-2",
    icon: <Heart className="size-4" aria-hidden />,
  },
  {
    id: "comment",
    title: "New comment",
    body: "Lucía left a comment on the glaze test.",
    time: "15m",
    dateTime: "2026-10-04T11:45:00",
    tone: "chart-3",
    icon: <MessageCircle className="size-4" aria-hidden />,
  },
  {
    id: "follow",
    title: "New follower",
    body: "Omar started following the studio.",
    time: "1h",
    dateTime: "2026-10-04T11:00:00",
    tone: "chart-4",
    icon: <UserPlus className="size-4" aria-hidden />,
  },
]
