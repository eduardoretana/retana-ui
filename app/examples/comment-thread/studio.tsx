"use client"

import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { StressCases } from "@/app/examples/arc/stress"
import { CommentThread, type ThreadComment } from "@/registry/ui/comment-thread"

const [ines, mateo, lucia] = people

const thread: ThreadComment[] = [
  {
    id: "glaze",
    author: mateo,
    body: `El esmalte de ${atelier.kiln} quedó claro. @${lucia.name} ¿lo ves?`,
    createdAt: "2h",
    reactions: [{ emoji: "👀", users: [ines.id] }],
    replies: [
      {
        id: "yes",
        author: lucia,
        body: "Sí, lo bajo mañana.",
        createdAt: "1h",
      },
    ],
  },
]

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <CommentThread currentUser={ines} people={people} defaultComments={thread} title={atelier.kiln} />
      <StressCases
        empty={<CommentThread currentUser={ines} people={people} title="Vacío" />}
        long={
          <CommentThread
            currentUser={ines}
            people={people.slice(0, 2)}
            title="Nota"
            defaultComments={[{ id: "long", author: ines, body: unbreakable, createdAt: "ahora" }]}
          />
        }
        crowded={
          <CommentThread
            currentUser={ines}
            people={people}
            title="Equipo"
            defaultComments={people.map((person) => ({
              id: person.id,
              author: person,
              body: person.role,
              createdAt: "hoy",
            }))}
          />
        }
      />
    </div>
  )
}
