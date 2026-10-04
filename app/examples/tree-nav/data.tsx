"use client"

import { BookOpen, FolderClosed, LifeBuoy, Megaphone } from "lucide-react"

import type { TreeNavNode } from "@/registry/ui/tree-nav"

export const projectTree: TreeNavNode[] = [
  {
    id: "updates",
    label: "Product Updates",
    count: 18,
    icon: <Megaphone className="size-4" />,
    children: [
      { id: "docs", label: "Docs 3.0", href: "#docs", icon: <BookOpen className="size-4" /> },
      { id: "strategy", label: "Product strategy", href: "#strategy" },
    ],
  },
  {
    id: "sales",
    label: "Sales Pipeline",
    count: 11,
    children: [
      { id: "kickoff", label: "Week kickoff", href: "#kickoff" },
      {
        id: "untitled",
        label: "Untitled folder",
        count: 2,
        icon: <FolderClosed className="size-4" />,
        children: [
          { id: "demo", label: "Product demo", href: "#demo" },
          { id: "training", label: "AI training", href: "#training" },
        ],
      },
    ],
  },
  {
    id: "support",
    label: "Customer Support Docs",
    count: 8,
    icon: <LifeBuoy className="size-4" />,
    children: [
      { id: "critical", label: "Critical issues", href: "#critical" },
      { id: "feedback", label: "Customer feedback", href: "#feedback" },
    ],
  },
]
