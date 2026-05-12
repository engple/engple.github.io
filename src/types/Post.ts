export default interface Post extends Omit<
  Pick<
    Queries.MarkdownRemarkFrontmatter,
    "title" | "desc" | "date" | "category" | "alt"
  >,
  "desc"
> {
  desc?: Queries.MarkdownRemarkFrontmatter["desc"]
  id: string
  slug: Queries.MarkdownRemarkFields["slug"]
  thumbnail?: string
}
