export type MemberRole = "Designer" | "Developer" | "Marketer"
export type MemberStatus = "Available" | "PTO"

export type CapacitySegment = {
  id: string
  label: string
  value: number
  tone: "spotify" | "zoom" | "slack" | "available"
}

export type MemberTask = {
  id: string
  title: string
  source: "Slack" | "Spotify" | "Zoom"
  when: string
}

export type Member = {
  id: string
  name: string
  role: MemberRole
  status: MemberStatus
  capacity: number
  discord: string
  discordId: string
  slackId: string
  email: string
  country: string
  city: string
  timezone: string
  flag: string
  insight: string
  segments: CapacitySegment[]
  tasks: MemberTask[]
  payment: {
    method: string
    account: string
    cadence: string
  }
  started: string
  manager: string
}

export const members: Member[] = [
  {
    id: "james",
    name: "James Carter",
    role: "Designer",
    status: "Available",
    capacity: 90,
    discord: "james#4521",
    discordId: "U04ABCD1234",
    slackId: "U04ABCD1234",
    email: "james.carter@acme.example",
    country: "United States",
    city: "New York",
    timezone: "America/New_York",
    flag: "🇺🇸",
    insight:
      "James is near full capacity on the brand refresh. He still has room for a short critique, but new project work should wait until next week.",
    segments: [
      { id: "spotify", label: "Spotify", value: 30, tone: "spotify" },
      { id: "zoom", label: "Zoom", value: 28, tone: "zoom" },
      { id: "slack", label: "Slack", value: 32, tone: "slack" },
      { id: "available", label: "Available", value: 10, tone: "available" },
    ],
    tasks: [
      { id: "j1", title: "Brand refresh exploration", source: "Slack", when: "3h ago" },
      { id: "j2", title: "Homepage hero alternatives", source: "Zoom", when: "1 day ago" },
    ],
    payment: { method: "Direct deposit", account: "•••• 2201", cadence: "Monthly" },
    started: "Mar 2023",
    manager: "Priya Shah",
  },
  {
    id: "sophia",
    name: "Sophia Williams",
    role: "Developer",
    status: "Available",
    capacity: 60,
    discord: "sophia#8812",
    discordId: "U04EFGH5678",
    slackId: "U04EFGH5678",
    email: "sophia.williams@acme.example",
    country: "United Kingdom",
    city: "London",
    timezone: "Europe/London",
    flag: "🇬🇧",
    insight:
      "Sophia has steady load on the API migration. She can take a small bug batch, and her review turnaround has been the fastest on the team this month.",
    segments: [
      { id: "spotify", label: "Spotify", value: 18, tone: "spotify" },
      { id: "zoom", label: "Zoom", value: 16, tone: "zoom" },
      { id: "slack", label: "Slack", value: 26, tone: "slack" },
      { id: "available", label: "Available", value: 40, tone: "available" },
    ],
    tasks: [
      { id: "s1", title: "API migration cutover plan", source: "Slack", when: "5h ago" },
      { id: "s2", title: "Retry policy for webhooks", source: "Zoom", when: "2 days ago" },
    ],
    payment: { method: "Direct deposit", account: "•••• 8812", cadence: "Monthly" },
    started: "Jan 2022",
    manager: "Priya Shah",
  },
  {
    id: "arthur",
    name: "Arthur Davis",
    role: "Developer",
    status: "PTO",
    capacity: 50,
    discord: "arthur#3309",
    discordId: "U04IJKL9012",
    slackId: "U04IJKL9012",
    email: "arthur.davis@acme.example",
    country: "Germany",
    city: "Berlin",
    timezone: "Europe/Berlin",
    flag: "🇩🇪",
    insight:
      "Arthur is on PTO through Friday. Handoff notes are in the platform channel. Avoid scheduling him until he is back.",
    segments: [
      { id: "spotify", label: "Spotify", value: 12, tone: "spotify" },
      { id: "zoom", label: "Zoom", value: 14, tone: "zoom" },
      { id: "slack", label: "Slack", value: 24, tone: "slack" },
      { id: "available", label: "Available", value: 50, tone: "available" },
    ],
    tasks: [
      { id: "a1", title: "Billing webhook replay", source: "Slack", when: "4 days ago" },
      { id: "a2", title: "Coverage notes for PTO", source: "Zoom", when: "5 days ago" },
    ],
    payment: { method: "Wire", account: "•••• 3309", cadence: "Monthly" },
    started: "Aug 2021",
    manager: "Priya Shah",
  },
  {
    id: "emma",
    name: "Emma Johnson",
    role: "Designer",
    status: "Available",
    capacity: 80,
    discord: "emma#7743",
    discordId: "U04MNOP3456",
    slackId: "U04MNOP3456",
    email: "emma.johnson@acme.example",
    country: "Canada",
    city: "Toronto",
    timezone: "America/Toronto",
    flag: "🇨🇦",
    insight:
      "Emma's capacity is lower than usual due to onboarding a new client. She's been doing excellent work on the Notion settings redesign. Her design system contributions have been valuable to the whole team.",
    segments: [
      { id: "spotify", label: "Spotify", value: 22, tone: "spotify" },
      { id: "zoom", label: "Zoom", value: 24, tone: "zoom" },
      { id: "slack", label: "Slack", value: 34, tone: "slack" },
      { id: "available", label: "Available", value: 20, tone: "available" },
    ],
    tasks: [
      { id: "e1", title: "Workflow automation builder MVP", source: "Slack", when: "1h ago" },
      { id: "e2", title: "Redesign mobile onboarding flow", source: "Spotify", when: "2h ago" },
      { id: "e3", title: "Add end-to-end encryption settings", source: "Zoom", when: "1 day ago" },
      { id: "e4", title: "Design integration widgets", source: "Slack", when: "5 days ago" },
      { id: "e5", title: "AI meeting summary feature mockups", source: "Zoom", when: "7 days ago" },
    ],
    payment: { method: "Direct deposit", account: "•••• 7743", cadence: "Monthly" },
    started: "Nov 2022",
    manager: "Priya Shah",
  },
  {
    id: "laura",
    name: "Laura Perez",
    role: "Marketer",
    status: "Available",
    capacity: 20,
    discord: "laura#2201",
    discordId: "U04QRST7890",
    slackId: "U04QRST7890",
    email: "laura.perez@acme.example",
    country: "Spain",
    city: "Madrid",
    timezone: "Europe/Madrid",
    flag: "🇪🇸",
    insight:
      "Laura has open capacity after the launch campaign wrapped. She is a good fit for the partner newsletter and the launch announcement.",
    segments: [
      { id: "spotify", label: "Spotify", value: 6, tone: "spotify" },
      { id: "zoom", label: "Zoom", value: 6, tone: "zoom" },
      { id: "slack", label: "Slack", value: 8, tone: "slack" },
      { id: "available", label: "Available", value: 80, tone: "available" },
    ],
    tasks: [
      { id: "l1", title: "Partner newsletter outline", source: "Slack", when: "6h ago" },
      { id: "l2", title: "Clinic launch announcement", source: "Zoom", when: "1 day ago" },
    ],
    payment: { method: "Direct deposit", account: "•••• 2201", cadence: "Monthly" },
    started: "Feb 2024",
    manager: "Noah Ike",
  },
  {
    id: "matthew",
    name: "Matthew Brown",
    role: "Developer",
    status: "PTO",
    capacity: 30,
    discord: "matthew#5567",
    discordId: "U04UVWX2345",
    slackId: "U04UVWX2345",
    email: "matthew.brown@acme.example",
    country: "Australia",
    city: "Sydney",
    timezone: "Australia/Sydney",
    flag: "🇦🇺",
    insight:
      "Matthew is out on PTO. His queue is paused. Sophia is covering production alerts until he returns on Monday.",
    segments: [
      { id: "spotify", label: "Spotify", value: 8, tone: "spotify" },
      { id: "zoom", label: "Zoom", value: 10, tone: "zoom" },
      { id: "slack", label: "Slack", value: 12, tone: "slack" },
      { id: "available", label: "Available", value: 70, tone: "available" },
    ],
    tasks: [
      { id: "m1", title: "On-call handoff", source: "Slack", when: "2 days ago" },
      { id: "m2", title: "Incident review notes", source: "Zoom", when: "3 days ago" },
    ],
    payment: { method: "Direct deposit", account: "•••• 5567", cadence: "Monthly" },
    started: "May 2020",
    manager: "Priya Shah",
  },
  {
    id: "ravi",
    name: "Ravi Patel",
    role: "Marketer",
    status: "Available",
    capacity: 0,
    discord: "ravi#9934",
    discordId: "U04YZAB6789",
    slackId: "U04YZAB6789",
    email: "ravi.patel@acme.example",
    country: "India",
    city: "Bengaluru",
    timezone: "Asia/Kolkata",
    flag: "🇮🇳",
    insight:
      "Ravi just rolled off the webinar series and is fully available. A good owner for the CRM lifecycle emails.",
    segments: [
      { id: "spotify", label: "Spotify", value: 0, tone: "spotify" },
      { id: "zoom", label: "Zoom", value: 0, tone: "zoom" },
      { id: "slack", label: "Slack", value: 0, tone: "slack" },
      { id: "available", label: "Available", value: 100, tone: "available" },
    ],
    tasks: [
      { id: "r1", title: "Lifecycle email map", source: "Slack", when: "8h ago" },
    ],
    payment: { method: "Wire", account: "•••• 9934", cadence: "Monthly" },
    started: "Sep 2024",
    manager: "Noah Ike",
  },
]

export const departments: MemberRole[] = ["Designer", "Developer", "Marketer"]
