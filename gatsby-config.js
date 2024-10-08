const meta = require("./gatsby-meta-config")

const siteMetadata = {
  title: meta.title,
  description: meta.description,
  author: meta.author,
  siteUrl: meta.siteUrl,
  lang: meta.lang,
  utterances: {
    repo: meta.utterances,
  },
  gtagTrackingId: meta.gtagTrackingId,
  googleAdsense: meta.googleAdsense,
  naverSiteVerification: meta.naverSiteVerification,
  postTitle: "전체",
  menuLinks: [
    {
      link: "/",
      name: "Home",
    },
    // {
    //   link: "/about/",
    //   name: "About",
    // },
    // {
    //   link: meta.links.github,
    //   name: "Github",
    // },
  ],
}

const corePlugins = [
  {
    resolve: "gatsby-source-filesystem",
    options: {
      name: "src",
      path: `${__dirname}/src`,
      ignore: [`**/*.d.ts`],
    },
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      name: "images",
      path: `${__dirname}/src/images`,
    },
  },
]

const devPlugins = [
  {
    resolve: "gatsby-plugin-alias-imports",
    options: {
      alias: {
        "~": ".",
      },
      extensions: ["js", "ts", "tsx"],
    },
  },
  {
    resolve: "gatsby-plugin-typography",
    options: {
      pathToConfigModule: "src/styles/typography",
    },
  },
  "gatsby-plugin-react-helmet",
  "gatsby-plugin-typescript",
  "gatsby-plugin-styled-components",
]

const imagePlugins = [
  "gatsby-plugin-image",
  "gatsby-plugin-sharp",
  "gatsby-transformer-sharp",
]

const markdownPlugins = [
  {
    resolve: "gatsby-transformer-remark",
    options: {
      plugins: [
        "gatsby-remark-copy-linked-files",
        "gatsby-remark-autolink-headers",
        {
          resolve: "gatsby-remark-vscode",
          options: {
            theme: {
              default: "Github Light Theme",
              parentSelector: {
                "body[data-theme=dark]": "Dark Github",
              },
            },
            extensions: ["vscode-theme-github-light", "dark-github-theme"],
          },
        },
        {
          resolve: "gatsby-remark-images",
          options: {
            linkImagesToOriginal: false,
          },
        },
      ],
    },
  },
  {
    resolve: `gatsby-plugin-fusejs`,
    options: {
      query: `
          {
            allMarkdownRemark {
              nodes {
                id
                rawMarkdownBody
                frontmatter {
                  title
                }
              }
            }
          }
        `,
      keys: ["title", "body"],
      normalizer: ({ data }) =>
        data.allMarkdownRemark.nodes.map(node => ({
          id: node.id,
          title: node.frontmatter.title,
          body: node.rawMarkdownBody,
        })),
    },
  },
]

const searchPlugins = [
  {
    resolve: "gatsby-plugin-sitemap",
    options: {
      query: `
        {
          allSitePage {
            nodes {
              path
            }
          }
          allMarkdownRemark {
            nodes {
              fields {
                slug
                lastmod
              }
              frontmatter {
                date
              }
            }
          }
        }
      `,
      resolveSiteUrl: () => meta.siteUrl,
      resolvePages: ({
        allSitePage: { nodes: allPages },
        allMarkdownRemark: { nodes: allPosts },
      }) => {
        const postsByPath = allPosts.reduce((acc, post) => {
          const { slug, lastmod } = post.fields
          acc[slug] = post
          return acc
        }, {})

        return allPages.map(page => {
          return { ...page, ...postsByPath[page.path] }
        })
      },
      serialize: ({ path, frontmatter, lastmod }) => {
        return {
          url: path,
          lastmod: lastmod || frontmatter?.date,
        }
      },
    },
  },
  {
    resolve: "gatsby-plugin-robots-txt",
    options: {
      host: "https://engple.github.io",
      sitemap: null,
      policy: [{ userAgent: "*", allow: "/" }],
    },
  },
  {
    resolve: `gatsby-plugin-feed`,
    options: {
      query: `
        {
          site {
            siteMetadata {
              title
              description
              siteUrl
              site_url: siteUrl
            }
          }
        }
      `,
      feeds: [
        {
          serialize: ({ query: { site, allMarkdownRemark } }) => {
            return allMarkdownRemark.edges.map(edge => {
              return Object.assign({}, edge.node.frontmatter, {
                description: edge.node.excerpt,
                date: edge.node.frontmatter.date,
                url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                custom_elements: [{ "content:encoded": edge.node.html }],
              })
            })
          },
          query: `
            {
              allMarkdownRemark(
                filter: { fileAbsolutePath: { regex: "/(posts/blog)/" } }
                sort: { frontmatter: { date: DESC } }
              ) {
                edges {
                  node {
                    excerpt
                    html
                    fields { slug }
                    frontmatter {
                      title
                      date
                    }
                  }
                }
              }
            }
          `,
          output: "/rss.xml",
          title: `${meta.title}'s RSS Feed`,
        },
      ],
    },
  },
]

const pwaPlugins = [
  {
    resolve: "gatsby-plugin-manifest",
    options: {
      name: meta.title,
      short_name: meta.title,
      description: meta.description,
      lang: meta.lang,
      start_url: "/",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      display: "standalone",
      icon: meta.favicon,
      icon_options: {
        purpose: "any maskable",
      },
    },
  },
  "gatsby-plugin-offline",
]

const gtagPlugins = [
  {
    resolve: "gatsby-plugin-google-gtag",
    options: {
      trackingIds: [meta.gtagTrackingId],
      pluginConfig: {
        head: true,
      },
    },
  },
]

module.exports = {
  graphqlTypegen: true,
  siteMetadata,
  plugins: [
    ...corePlugins,
    ...devPlugins,
    ...imagePlugins,
    ...markdownPlugins,
    ...searchPlugins,
    ...pwaPlugins,
    ...gtagPlugins,
  ],
}
