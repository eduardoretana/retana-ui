import type { ReactNode } from "react"
import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  createMemoryPresence,
  PresenceProvider,
  useOthers,
  useSelf,
  useTypingPresence,
} from "@/registry/retana/lib/presence"
import { mapLiveblocksPresence, useLiveblocksPresenceAdapter } from "@/registry/lib/presence-liveblocks"
import { createSupabasePresence, mapSupabasePresence } from "@/registry/lib/presence-supabase"
import { PresenceAvatars } from "@/registry/ui/presence-avatars"
import { TypingIndicator } from "@/registry/ui/typing-indicator"

const liveblocks = vi.hoisted(() => ({
  others: [] as { connectionId: number; id: string; info: { name: string }; presence: { isTyping: boolean } }[],
  self: null as { connectionId: number; id: string; info: { name: string }; presence: { isTyping: boolean } } | null,
  update: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock("@liveblocks/react", () => ({
  useOthers: () => liveblocks.others,
  useSelf: () => liveblocks.self,
  useUpdateMyPresence: () => liveblocks.update,
  useRoom: () => ({ disconnect: liveblocks.disconnect }),
  RoomProvider: ({ children }: { children: ReactNode }) => children,
  LiveblocksProvider: ({ children }: { children: ReactNode }) => children,
}))

function TypingProbe() {
  const notify = useTypingPresence<{ isTyping: boolean }>("isTyping", { idleMs: 1000 })
  const self = useSelf<{ isTyping: boolean }, { name: string }>()
  return (
    <button type="button" onClick={() => notify()}>
      {self?.presence.isTyping ? "typing" : "idle"}
    </button>
  )
}

describe("createMemoryPresence", () => {
  it("joins, updates, and leaves", () => {
    const memory = createMemoryPresence<{ cursor: number }, { name: string }>({
      self: { userId: "elena", info: { name: "Elena" }, presence: { cursor: 0 } },
    })
    const seen: string[] = []
    memory.subscribe((snapshot) => {
      seen.push(`${snapshot.self?.userId ?? "gone"}:${snapshot.others.map((user) => user.userId).join(",")}`)
    })
    const id = memory.join({ userId: "mateo", info: { name: "Mateo" }, presence: { cursor: 1 } })
    memory.update(id, { cursor: 4 })
    memory.updateMyPresence({ cursor: 2 })
    expect(memory.getSelf()?.presence.cursor).toBe(2)
    const mateo = memory.subscribe((snapshot) => {
      expect(snapshot.others[0]?.presence.cursor).toBe(4)
    })
    mateo()
    memory.leave()
    expect(memory.getSelf()).toBeNull()
    memory.remove(id)
    expect(seen.at(-1)).toBe("gone:")
  })
})

describe("useTypingPresence", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("sets typing immediately and clears it after the idle delay", () => {
    vi.useFakeTimers()
    const memory = createMemoryPresence<{ isTyping: boolean }, { name: string }>({
      self: { userId: "elena", info: { name: "Elena" }, presence: { isTyping: false } },
    })
    render(
      <PresenceProvider adapter={memory}>
        <TypingProbe />
      </PresenceProvider>,
    )
    act(() => {
      screen.getByRole("button", { name: "idle" }).click()
    })
    expect(memory.getSelf()?.presence.isTyping).toBe(true)
    expect(screen.getByRole("button", { name: "typing" })).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(memory.getSelf()?.presence.isTyping).toBe(false)
    expect(screen.getByRole("button", { name: "idle" })).toBeInTheDocument()
  })
})

describe("PresenceAvatars", () => {
  it("groups agents and shows an overflow count", () => {
    const memory = createMemoryPresence({
      self: { userId: "elena", info: { name: "Elena" }, presence: {} },
    })
    memory.join({ userId: "mateo", info: { name: "Mateo" }, presence: {} })
    memory.join({ userId: "priya", info: { name: "Priya" }, presence: {} })
    memory.join({ userId: "noor", info: { name: "Noor" }, presence: {} })
    memory.join({ userId: "agent-scribe", info: { name: "Scribe" }, presence: {} })
    memory.join({ userId: "agent-reader", info: { name: "Reader" }, presence: {} })
    render(
      <PresenceProvider adapter={memory}>
        <PresenceAvatars groupAgents max={2} />
      </PresenceProvider>,
    )
    expect(screen.getByLabelText("Scribe, Reader")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "1 more" })).toBeInTheDocument()
  })
})

describe("TypingIndicator", () => {
  it("summarizes several people", () => {
    const memory = createMemoryPresence<{ isTyping: boolean }, { name: string }>({
      self: { userId: "elena", info: { name: "Elena" }, presence: { isTyping: false } },
    })
    memory.join({ userId: "ana", info: { name: "Ana" }, presence: { isTyping: true } })
    memory.join({ userId: "luis", info: { name: "Luis" }, presence: { isTyping: true } })
    memory.join({ userId: "noor", info: { name: "Noor" }, presence: { isTyping: true } })
    render(
      <PresenceProvider adapter={memory}>
        <TypingIndicator />
      </PresenceProvider>,
    )
    expect(screen.getByText("Ana and 2 others are typing…")).toBeInTheDocument()
  })
})

describe("mapLiveblocksPresence", () => {
  it("marks agent ids and keeps humans", () => {
    const snapshot = mapLiveblocksPresence(
      [{ connectionId: 8, id: "agent-scribe", info: { name: "Scribe" }, presence: { cursor: null } }],
      { connectionId: 1, id: "elena", info: { name: "Elena" }, presence: { cursor: null } },
    )
    expect(snapshot.self?.isAgent).toBe(false)
    expect(snapshot.others[0]?.isAgent).toBe(true)
  })
})

function LiveProbe() {
  const adapter = useLiveblocksPresenceAdapter<{ isTyping: boolean }, { name: string }>()
  return (
    <PresenceProvider adapter={adapter}>
      <Names />
    </PresenceProvider>
  )
}

function Names() {
  const others = useOthers<{ isTyping: boolean }, { name: string }>()
  const self = useSelf<{ isTyping: boolean }, { name: string }>()
  return (
    <p>
      {self?.userId}:{others.map((user) => `${user.userId}${user.isAgent ? "*" : ""}`).join(",")}
    </p>
  )
}

describe("useLiveblocksPresenceAdapter", () => {
  it("maps mocked room hooks and can leave the room", () => {
    liveblocks.self = { connectionId: 1, id: "elena", info: { name: "Elena" }, presence: { isTyping: false } }
    liveblocks.others = [{ connectionId: 2, id: "agent-scribe", info: { name: "Scribe" }, presence: { isTyping: true } }]
    render(<LiveProbe />)
    expect(screen.getByText("elena:agent-scribe*")).toBeInTheDocument()
  })
})

describe("createSupabasePresence", () => {
  it("tracks presence and reads join state from the channel", () => {
    const handlers = new Map<string, () => void>()
    const state: Record<string, unknown[]> = {}
    const channel = {
      on: (_type: string, filter: { event: string }, callback: () => void) => {
        handlers.set(filter.event, callback)
        return channel
      },
      subscribe: (callback: (status: string) => void) => {
        callback("SUBSCRIBED")
        return channel
      },
      track: vi.fn(async (payload: { userId: string }) => {
        state[payload.userId] = [{ ...payload, presence_ref: "self-ref" }]
      }),
      untrack: vi.fn(),
      presenceState: () => state,
    }
    const supabase = {
      channel: vi.fn(() => channel),
      removeChannel: vi.fn(),
    }
    const adapter = createSupabasePresence<{ isTyping: boolean }, { name: string }>({
      supabase: supabase as never,
      room: "studio",
      presenceKey: "elena",
      userId: "elena",
      info: { name: "Elena" },
      initialPresence: { isTyping: false },
    })
    const seen: number[] = []
    adapter.subscribe((snapshot) => seen.push(snapshot.others.length))
    state.mateo = [{ userId: "mateo", info: { name: "Mateo" }, presence: { isTyping: true }, presence_ref: "m" }]
    handlers.get("sync")?.()
    expect(channel.track).toHaveBeenCalled()
    expect(seen.at(-1)).toBe(1)
    adapter.updateMyPresence({ isTyping: true })
    expect(adapter.getSelf()?.presence.isTyping).toBe(true)
    adapter.leave()
    expect(channel.untrack).toHaveBeenCalled()
    expect(supabase.removeChannel).toHaveBeenCalled()
    expect(adapter.getSelf()).toBeNull()
    expect(mapSupabasePresence(state).some((user) => user.userId === "mateo")).toBe(true)
  })
})
