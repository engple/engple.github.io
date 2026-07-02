const path = require(`path`)
const fs = require("fs/promises")
const _ = require("lodash")
const { createFilePath } = require(`gatsby-source-filesystem`)
const meta = require("./gatsby-meta-config")

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
    createNodeField({
      node,
      name: `lastmod`,
      value: fileNode.modifiedTime,
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
        limit: 2000
      ) {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
      categoriesGroup: allMarkdownRemark(limit: 2000) {
        group(field: { frontmatter: { category: SELECT } }) {
          fieldValue
          totalCount
        }
      }
    }
  `)

  createPostPages({ result, createPage })
  createCategoryPages({ result, createPage })
  createSearchPage({ createPage })
}

function createCategoryPages({ result, createPage }) {
  const template = path.resolve(`./src/pages/index.tsx`)

  result.data.categoriesGroup.group.forEach(category => {
    createPage({
      path: `/category/${_.kebabCase(category.fieldValue)}/`,
      component: template,
      context: {
        category: category.fieldValue,
      },
    })
  })
}

const createPostPages = ({ result, createPage }) => {
  const template = path.resolve(`./src/templates/blogPost.tsx`)

  result.data.postsRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: template,
      context: {
        slug: node.fields.slug,
      },
    })
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

exports.onPostBuild = async ({ graphql, reporter }) => {
  const searchMetaPageCount = await createSearchResultMetaPages({ graphql })
  const changedFiles = await removeNullBytesFromPublicFiles(
    path.resolve("public"),
  )

  if (searchMetaPageCount > 0) {
    reporter.info(`Created ${searchMetaPageCount} search meta page(s).`)
  }

  if (changedFiles > 0) {
    reporter.info(`Removed null bytes from ${changedFiles} generated file(s).`)
  }
}

async function createSearchResultMetaPages({ graphql }) {
  const result = await graphql(`
    {
      postsRemark: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/(posts/blog)/" } }
        sort: { frontmatter: { date: DESC } }
        limit: 2000
      ) {
        edges {
          node {
            frontmatter {
              title
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const searchLabels = collectSearchLabels(result.data.postsRemark.edges)

  await Promise.all(
    searchLabels.map(async searchQuery => {
      const htmlPath = path.join(
        "public",
        ...createSearchPagePath(searchQuery).split("/").filter(Boolean),
        "index.html",
      )

      await fs.mkdir(path.dirname(htmlPath), { recursive: true })
      await fs.writeFile(
        htmlPath,
        createSearchResultMetaPageHtml(searchQuery),
        "utf8",
      )
    }),
  )

  return searchLabels.length
}

function collectSearchLabels(edges) {
  const seenPaths = new Set()

  return edges
    .map(({ node }) => extractSearchSuggestionLabel(node.frontmatter?.title))
    .filter(searchQuery => {
      if (!searchQuery) return false

      const searchPagePath = createSearchPagePath(searchQuery)

      if (seenPaths.has(searchPagePath)) return false

      seenPaths.add(searchPagePath)
      return true
    })
}

function extractSearchSuggestionLabel(title = "") {
  const trimmedTitle = title.trim()
  const quotedTermMatch = trimmedTitle.match(/^['"“‘]([^'"”’]+)['"”’]/u)

  if (quotedTermMatch?.[1]) {
    return quotedTermMatch[1].trim()
  }

  return trimmedTitle
    .replace(/\s+영어로 어떻게 표현할까.*$/u, "")
    .split(" - ")[0]
    .trim()
}

function createSearchResultMetaPageHtml(searchQuery) {
  const searchPagePath = createSearchPagePath(searchQuery)
  const searchPageQueryPath = `/search/?q=${encodeURIComponent(searchQuery)}`
  const canonicalUrl = `${meta.siteUrl}${searchPagePath}`
  const title = `'${searchQuery}'에 대한 검색 결과 - ${meta.title}`
  const description = `'${searchQuery}' 검색 결과와 추천 표현을 확인해보세요.`

  return `<!doctype html>
<html lang="${escapeAttribute(meta.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttribute(description.slice(0, 160))}">
  <meta name="robots" content="noindex,nofollow">
  <meta name="googlebot" content="noindex,nofollow">
  <meta property="og:title" content="${escapeAttribute(title)}">
  <meta property="og:description" content="${escapeAttribute(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeAttribute(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeAttribute(title)}">
  <meta name="twitter:description" content="${escapeAttribute(description)}">
  <link rel="canonical" href="${escapeAttribute(canonicalUrl)}">
  <meta http-equiv="refresh" content="0; url=${escapeAttribute(searchPageQueryPath)}">
</head>
<body>
  <main>
    <h1>${escapeHtml(searchQuery)} 검색</h1>
    <p><a href="${escapeAttribute(searchPageQueryPath)}">검색 결과 보기</a></p>
  </main>
  <script>window.location.replace(${JSON.stringify(searchPageQueryPath)});</script>
</body>
</html>
`
}

function escapeHtml(value) {
  return value.replaceAll(/[&<>"']/g, character => {
    return HTML_ESCAPE_MAP[character]
  })
}

function escapeAttribute(value) {
  return escapeHtml(value)
}

const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

function createSearchPagePath(searchTerm) {
  return `/search/${encodeURIComponent(normalizeSearchTerm(searchTerm))}/`
}

function normalizeSearchTerm(value) {
  return value.trim().toLocaleLowerCase().replaceAll(/\s+/g, " ")
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
