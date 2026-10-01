"use client"

import { BlogGrid } from "@/registry/blocks/blog-grid"

export default function BlogGridPreview() {
  return (
    <div className="h-full bg-background p-3">
      <BlogGrid
        className="[&_h2]:text-lg"
        title="Diario"
        description=""
        showFeatured={false}
        pageSize={2}
        categories={["Horno"]}
        posts={[
          { id: "horno", title: "Notas del horno", excerpt: "Gres de la semana.", category: "Horno", date: "2026-09-18", readTime: 4, author: { name: "Inés Calderón" } },
          { id: "vidrio", title: "Vidrio de ceniza", excerpt: "Una receta corta.", category: "Horno", date: "2026-09-02", readTime: 3, author: { name: "Mateo Ruiz" } },
        ]}
      />
    </div>
  )
}
