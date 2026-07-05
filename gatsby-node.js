const path = require(`path`)
const fs = require("fs/promises")
const { execSync } = require("child_process")
const _ = require("lodash")
const { createFilePath } = require(`gatsby-source-filesystem`)

// CI checks out a fresh copy on every build, so file mtimes are always
// "now" instead of when the content actually last changed. Sitemap
// lastmod/dateModified must reflect real change history or search
// engines stop trusting the signal, so derive it from git instead.
const GIT_LOG_DATE_MARKER = "\x01"
let gitLastModifiedCache = null

function getGitLastModifiedMap() {
  if (gitLastModifiedCache) return gitLastModifiedCache

  gitLastModifiedCache = new Map()

  try {
    const log = execSync(
      `git log --name-only --no-renames --pretty=format:%x01%cI`,
      { cwd: __dirname, maxBuffer: 1024 * 1024 * 500 },
    ).toString("utf8")

    let currentDate = null

    for (const line of log.split("\n")) {
      if (line.startsWith(GIT_LOG_DATE_MARKER)) {
        currentDate = line.slice(1)
      } else if (line.trim() && currentDate) {
        if (!gitLastModifiedCache.has(line)) {
          gitLastModifiedCache.set(line, currentDate)
        }
      }
    }
  } catch {
    // Not a git checkout (or no history available) - callers fall back
    // to file mtime.
  }

  return gitLastModifiedCache
}

const NULL_BYTE = "\u0000"
const NULL_BYTE_TEXT_EXTENSIONS = new Set([".html", ".json", ".xml"])

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `posts` })
    createNodeField({
      node,
      name: `slug`,
      value: slug.replace("/season-1", ""),
    })
    const fileNode = getNode(node.parent)
    const relativePath = path.relative(__dirname, fileNode.absolutePath)
    const gitLastModified = getGitLastModifiedMap().get(relativePath)
    createNodeField({
      node,
      name: `lastmod`,
      value: gitLastModified || fileNode.modifiedTime,
    })
  }
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      postsRemark: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/(posts/blog)/" } }
        sort: { frontmatter: { date: DESC } }
        limit: 100000
      ) {
        edges {
          node {
            id
            frontmatter {
              title
              date(formatString: "YYYY-MM-DD")
              category
              alt
              thumbnail {
                publicURL
              }
            }
            fields {
              slug
            }
          }
        }
      }
      categoriesGroup: allMarkdownRemark(limit: 100000) {
        group(field: { frontmatter: { category: SELECT } }) {
          fieldValue
          totalCount
        }
      }
    }
  `)

  createPostPages({ result, createPage })
  createListPages({ result, createPage })
  createSearchPage({ createPage })
}

// Home/category pages used to render every post client-side via infinite
// scroll, so crawlers (especially Naver's Yeti, which doesn't run the
// scroll-triggered loader) only ever saw the first 24 posts in the static
// HTML. Statically paginating gives every post a real, crawlable link path.
const POSTS_PER_PAGE = 24

function createListPages({ result, createPage }) {
  const template = path.resolve(`./src/pages/index.tsx`)
  const totalPostCount = result.data.postsRemark.edges.length

  createPaginatedPages({
    createPage,
    template,
    basePath: `/`,
    category: null,
    totalCount: totalPostCount,
  })

  result.data.categoriesGroup.group.forEach(category => {
    createPaginatedPages({
      createPage,
      template,
      basePath: `/category/${_.kebabCase(category.fieldValue)}/`,
      category: category.fieldValue,
      totalCount: category.totalCount,
    })
  })
}

function createPaginatedPages({
  createPage,
  template,
  basePath,
  category,
  totalCount,
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE))

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    createPage({
      path: paginatedPath(basePath, pageNumber),
      component: template,
      context: {
        category,
        categoryRegex: category ? `/^${escapeRegex(category)}$/` : "/.*/",
        limit: POSTS_PER_PAGE,
        skip: (pageNumber - 1) * POSTS_PER_PAGE,
        currentPage: pageNumber,
        totalPages,
        basePath,
      },
    })
  }
}

function paginatedPath(basePath, pageNumber) {
  return pageNumber === 1 ? basePath : `${basePath}page/${pageNumber}/`
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const createPostPages = ({ result, createPage }) => {
  const template = path.resolve(`./src/templates/blogPost.tsx`)
  const posts = sortPostsForContinue(
    result.data.postsRemark.edges.map(({ node }) => mapPostNodeToPost(node)),
  )

  posts.forEach(post => {
    createPage({
      path: post.slug,
      component: template,
      context: {
        slug: post.slug,
        continuePosts: selectContinuePosts(posts, post.slug),
      },
    })
  })
}

function mapPostNodeToPost(node) {
  return {
    id: node.id,
    ...node.frontmatter,
    desc: node.frontmatter.desc || undefined,
    slug: node.fields.slug,
    thumbnail: node.frontmatter.thumbnail?.publicURL,
  }
}

function selectContinuePosts(posts, currentSlug) {
  const currentIndex = posts.findIndex(post => post.slug === currentSlug)

  if (currentIndex === -1) return []

  return [
    ...posts
      .slice(currentIndex + 1, currentIndex + 3)
      .map(post => ({ ...post, direction: "이전 글" })),
    ...posts
      .slice(Math.max(0, currentIndex - 2), currentIndex)
      .reverse()
      .map(post => ({ ...post, direction: "다음 글" })),
  ]
}

function sortPostsForContinue(posts) {
  return [...posts].sort((left, right) => {
    const dateCompare = (right.date ?? "").localeCompare(left.date ?? "")

    if (dateCompare !== 0) return dateCompare

    return right.slug.localeCompare(left.slug)
  })
}

const createSearchPage = ({ createPage }) => {
  const searchTemplate = path.resolve(`./src/pages/search.tsx`)
  createPage({
    path: `/search`,
    component: searchTemplate,
    context: {},
  })
}

exports.onPostBuild = async ({ reporter }) => {
  const changedFiles = await removeNullBytesFromPublicFiles(
    path.resolve("public"),
  )

  if (changedFiles > 0) {
    reporter.info(`Removed null bytes from ${changedFiles} generated file(s).`)
  }
}

async function removeNullBytesFromPublicFiles(root) {
  let entries

  try {
    entries = await fs.readdir(root, { withFileTypes: true })
  } catch (error) {
    if (error.code === "ENOENT") return []
    throw error
  }

  const results = await Promise.all(
    entries.map(async entry => {
      const entryPath = path.join(root, entry.name)

      if (entry.isDirectory()) {
        return removeNullBytesFromPublicFiles(entryPath)
      }

      if (
        !entry.isFile() ||
        !NULL_BYTE_TEXT_EXTENSIONS.has(path.extname(entry.name))
      ) {
        return 0
      }

      const original = await fs.readFile(entryPath, "utf8")

      if (!original.includes(NULL_BYTE)) {
        return 0
      }

      await fs.writeFile(entryPath, original.replaceAll(NULL_BYTE, ""), "utf8")
      return 1
    }),
  )

  return results.reduce((total, count) => total + count, 0)
}
