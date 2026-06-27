const path = require(`path`)
const fs = require("fs/promises")
const _ = require("lodash")
const { createFilePath } = require(`gatsby-source-filesystem`)

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

exports.onPostBuild = async ({ reporter }) => {
  const result = await removeNullBytesFromPublicFiles(path.resolve("public"))

  if (result.changedFiles > 0) {
    reporter.info(
      `Removed null bytes from ${result.changedFiles} generated file(s).`,
    )
  }
}

async function removeNullBytesFromPublicFiles(root) {
  const files = await collectGeneratedTextFiles(root)
  const results = await Promise.all(files.map(removeNullBytesFromFile))

  return {
    changedFiles: results.filter(Boolean).length,
  }
}

async function collectGeneratedTextFiles(root) {
  let entries

  try {
    entries = await fs.readdir(root, { withFileTypes: true })
  } catch (error) {
    if (error.code === "ENOENT") return []
    throw error
  }

  const nestedFiles = await Promise.all(
    entries.map(entry => collectGeneratedTextFilesFromEntry(root, entry)),
  )

  return nestedFiles.flat()
}

async function collectGeneratedTextFilesFromEntry(root, entry) {
  const entryPath = path.join(root, entry.name)

  if (entry.isDirectory()) {
    return collectGeneratedTextFiles(entryPath)
  }

  if (
    !entry.isFile() ||
    !NULL_BYTE_TEXT_EXTENSIONS.has(path.extname(entry.name))
  ) {
    return []
  }

  return [entryPath]
}

async function removeNullBytesFromFile(filePath) {
  const original = await fs.readFile(filePath, "utf8")

  if (!original.includes(NULL_BYTE)) {
    return false
  }

  await fs.writeFile(filePath, original.replaceAll(NULL_BYTE, ""), "utf8")
  return true
}
