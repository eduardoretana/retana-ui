# Presence kit

Provider-agnostic presence for cursors, avatars, typing, and selection. UI in this registry reads `PresenceProvider` only, so the same components work with the in-memory adapter, Liveblocks, or Supabase Realtime.

Pick **Supabase** when the app already has a Supabase project. Pick **Liveblocks** when you want their hosted room network. The memory adapter is for demos and tests. Connect one backend.

## Install

```bash
npx shadcn@latest add @retana/presence
npx shadcn@latest add @retana/presence-avatars
npx shadcn@latest add @retana/live-cursors
npx shadcn@latest add @retana/typing-indicator
npx shadcn@latest add @retana/presence-outline
```

Add one adapter:

```bash
npx shadcn@latest add @retana/presence-liveblocks
npx shadcn@latest add @retana/presence-supabase
```

`presence-avatars` is the live stack for people in the room. `avatar-group` is a static stack and does not read presence. Answer **no** if the CLI asks to overwrite `avatar` or `tooltip`. The pieces ship no theme. Color is `info.color` or `var(--chart-1)` through `var(--chart-5)`.

The public registry host is not chosen yet. Until a domain exists, the URL form is `npx shadcn@latest add https://<your-deployment>/r/<name>.json`.

## Shared types

`PresenceUser` is `{ connectionId, userId, presence, info, isAgent }`. An agent is any `userId` that starts with `agent-`, unless you pass another predicate.

`info.color`, when the host sets it, is used for cursors, dots, and selection outlines. Otherwise the kit cycles `var(--chart-1)` through `var(--chart-5)`. Do not hard-code colors in the registry items.

```tsx
import { createMemoryPresence, PresenceProvider } from "@/lib/presence"

const adapter = createMemoryPresence({
  self: {
    userId: "elena",
    info: { name: "Elena", color: "var(--chart-1)" },
    presence: { cursor: null, isTyping: false, selection: null },
  },
})

export function Room({ children }: { children: React.ReactNode }) {
  return <PresenceProvider adapter={adapter}>{children}</PresenceProvider>
}
```

`useOthers()`, `useSelf()`, `useUpdateMyPresence()`, and `useTypingPresence(key, { idleMs: 1000 })` read that provider. `useTypingPresence` sets the flag immediately and clears it after `idleMs` of silence.

## Liveblocks

Client packages `@liveblocks/client` and `@liveblocks/react` are Apache-2.0. `@liveblocks/node` (Apache-2.0) is a **server-only** dependency for auth and agent presence. Do **not** add `@liveblocks/server` or the `liveblocks` CLI: those are AGPL-3.0.

The Free plan needs a visible Liveblocks badge and allows 10 concurrent connections per room. Confirm the current plan limits before shipping.

### Global types

```ts
// liveblocks.config.ts
declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      isTyping: boolean
      selection: string | null
    }
    UserMeta: {
      id: string
      info: {
        name: string
        avatar?: string
        color?: string
      }
    }
  }
}

export {}
```

### Browser

```tsx
"use client"

import { LiveblocksPresenceRoom } from "@/lib/presence-liveblocks"

export function Collab({ children }: { children: React.ReactNode }) {
  return (
    <LiveblocksPresenceRoom
      authEndpoint="/api/liveblocks-auth"
      roomId="studio"
      initialPresence={{ cursor: null, isTyping: false, selection: null }}
    >
      {children}
    </LiveblocksPresenceRoom>
  )
}
```

`publicApiKey` is enough for a public room. Prefer `authEndpoint` when users have accounts. Inside the room, `LiveblocksPresenceBridge` maps `useOthers`, `useSelf`, and `useUpdateMyPresence` onto the shared provider. Agents are `userId.startsWith("agent-")`.

### Next.js auth route

`LIVEBLOCKS_SECRET_KEY` stays on the server. This route uses `@liveblocks/node`, which you install in the host app, not the AGPL server package.

```ts
import { Liveblocks } from "@liveblocks/node"

const liveblocks = new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY! })

export async function POST() {
  const user = await getSessionUser()
  const { status, body } = await liveblocks.identifyUser(
    { userId: user.id },
    { userInfo: { name: user.name, avatar: user.avatar, color: user.color } },
  )
  return new Response(body, { status })
}
```

### Server-side agent

Publish presence without a WebSocket. Refresh it while the agent works. `ttl` is seconds (2–3599). `ttl: 2` removes the agent shortly after the call.

```ts
await liveblocks.setPresence(roomId, {
  userId: "agent-scribe",
  data: { cursor: null, isTyping: true, selection: "brief" },
  userInfo: { name: "Scribe", avatar: user.avatar },
  ttl: 30,
})

await liveblocks.setPresence(roomId, {
  userId: "agent-scribe",
  data: {},
  userInfo: { name: "Scribe" },
  ttl: 2,
})
```

### Vite

Use the same `LiveblocksPresenceRoom` in the client. Point `authEndpoint` at your own backend (a small server or serverless function) that calls `identifyUser`. Do not put the secret in Vite env vars that ship to the browser.

## Supabase Realtime

`@supabase/supabase-js` is already the usual client in this stack. Presence is ephemeral: it disappears when the channel closes.

```ts
import { createClient } from "@supabase/supabase-js"
import { createSupabasePresence } from "@/lib/presence-supabase"
import { PresenceProvider } from "@/lib/presence"

const supabase = createClient(url, anonKey)

const adapter = createSupabasePresence({
  supabase,
  room: "studio",
  presenceKey: user.id,
  userId: user.id,
  info: { name: user.name, avatar: user.avatar, color: "var(--chart-2)" },
  initialPresence: { cursor: null, isTyping: false, selection: null },
})
```

The adapter opens `supabase.channel(room, { config: { presence: { key } } })`, `track()`s `{ userId, info, presence }`, and listens for `sync`, `join`, and `leave`. `updateMyPresence` calls `track` again. `leave` calls `untrack` and `removeChannel`.

Enable Realtime for the project. Channel access is not a substitute for authorization: anyone who can join the channel can write presence. Add Realtime authorization policies (RLS on `realtime.messages` in current Supabase projects) so only members of the room can subscribe. Do not trust presence payloads for permissions.

Vite and Next.js use the same browser client. The service role key never goes in the client.

## UI

Install only the pieces you render. Each one expects `PresenceProvider` above it.

- `presence-avatars` — stack, overflow `+N`, tooltips, optional single avatar for every agent, live dot.
- `live-cursors` — cursors inside a `relative` container. `useContainerCursor(ref)` sends coordinates relative to that element, throttled with `requestAnimationFrame`. Reduced motion snaps instead of smoothing.
- `typing-indicator` — “Ana and 2 others are typing…”, `aria-live="polite"`.
- `presence-outline` — ring and name when another user’s `selection` matches.

Answer **no** if `shadcn add` asks to overwrite `avatar` or `tooltip`.
