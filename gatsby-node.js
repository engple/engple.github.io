const path = require(`path`)
const _ = require("lodash")
const { createFilePath } = require(`gatsby-source-filesystem`)

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
              lastmod
            }
          }
          next {
            fields {
              slug
            }
          }
          previous {
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

  result.data.postsRemark.edges.forEach(({ node, next, previous }) => {
    createPage({
      path: node.fields.slug,
      component: template,
      context: {
        // additional data can be passed via context
        slug: node.fields.slug,
        lastmod: node.fields.lastmod,
        nextSlug: next?.fields.slug ?? "",
        prevSlug: previous?.fields.slug ?? "",
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
