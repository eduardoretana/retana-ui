import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { BlogGrid } from "@/registry/blocks/blog-grid"
import type { BlogPost } from "@/registry/blocks/blog-grid"

const posts: BlogPost[] = [
  { id: "clay", title: "Clay notes", excerpt: "Stoneware", category: "Kiln", date: "2026-09-01", readTime: 3, author: { name: "Inés Calderón" } },
  { id: "glaze", title: "Glaze log", excerpt: "Ash", category: "Glaze", date: "2026-08-01", readTime: 2, author: { name: "Mateo Ruiz" } },
]

describe("BlogGrid", () => {
  it("filters posts by category", async () => {
    const user = userEvent.setup()
    render(<BlogGrid posts={posts} categories={["Kiln", "Glaze"]} showFeatured={false} title="Journal" />)
    expect(screen.getByRole("link", { name: /Clay notes/ })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Glaze log/ })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Glaze" }))
    expect(screen.getByRole("button", { name: "Glaze" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("link", { name: /Glaze log/ })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole("link", { name: /Clay notes/ })).not.toBeInTheDocument())
  })
})
