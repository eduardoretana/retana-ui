"use client"

import { StressCases } from "@/app/examples/arc/stress"
import { atelier, people, unbreakable } from "@/app/examples/arc/demo-data"
import { BlogGrid, type BlogPost } from "@/registry/blocks/blog-grid"

const posts: BlogPost[] = [
  {
    id: "horno",
    featured: true,
    category: "Horno",
    date: "2026-09-18",
    readTime: 6,
    author: { name: people[0].name, role: people[0].role },
    title: `Notas de ${atelier.kiln}`,
    excerpt: `Cómo bajamos la temperatura en ${atelier.city} sin perder el gres.`,
    body: ["El lunes el horno llegó antes. Dejamos enfriar una hora más y el borde dejó de torcerse.", "La galería abre con ese lote."],
  },
  {
    id: "vidrio",
    category: "Vidrio",
    date: "2026-09-02",
    readTime: 4,
    author: { name: people[1].name, role: people[1].role },
    title: "El vidrio de ceniza",
    excerpt: "Una receta corta para el cuenco de desayuno.",
    body: ["Ceniza, feldespato y un poco de arcilla del taller. Nada más."],
  },
  {
    id: "envio",
    category: "Taller",
    date: "2026-08-20",
    readTime: 3,
    author: { name: people[6].name, role: people[6].role },
    title: "Cómo sale un pedido",
    excerpt: `De ${atelier.city} a la puerta, sin una caja de más.`,
    body: ["Cada pieza lleva el nombre de quien la coció."],
  },
  {
    id: "galeria",
    category: "Galería",
    date: "2026-08-04",
    readTime: 5,
    author: { name: people[3].name, role: people[3].role },
    title: "La vitrina del viernes",
    excerpt: "Doce piezas, una mesa, y la luz de la tarde.",
    body: ["Movimos la mesa hacia la ventana. El gres se lee mejor así."],
  },
]

export function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <BlogGrid title={`Diario de ${atelier.name}`} description={`Notas del taller en ${atelier.city}.`} posts={posts} categories={["Horno", "Vidrio", "Taller", "Galería"]} />
      <StressCases
        empty={<BlogGrid posts={[]} categories={[]} title="Diario" description="" showFeatured={false} />}
        long={<BlogGrid posts={[{ id: "long", title: unbreakable, excerpt: unbreakable, category: "Horno", date: "2026-01-01", readTime: 1, author: { name: unbreakable } }]} categories={["Horno"]} showFeatured={false} />}
        crowded={
          <BlogGrid
            showFeatured={false}
            pageSize={10}
            categories={["Horno"]}
            posts={Array.from({ length: 10 }, (_, index) => ({
              id: `p-${index}`,
              title: `Nota ${index + 1}`,
              excerpt: atelier.kiln,
              category: "Horno",
              date: `2026-0${(index % 8) + 1}-02`,
              readTime: index + 1,
              author: { name: people[index].name },
            }))}
          />
        }
      />
    </div>
  )
}
