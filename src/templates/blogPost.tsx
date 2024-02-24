import React from "react"

import { type PageProps, graphql } from "gatsby"
import styled from "styled-components"

import SEO from "~/src/components/seo"
import Layout from "~/src/layouts/layout"
import Category from "~/src/styles/category"
import DateTime from "~/src/styles/dateTime"
import Markdown from "~/src/styles/markdown"
import { rhythm } from "~/src/styles/typography"

import PostNavigator from "../components/postNavigator"

interface DataProps {
  current: {
    id: string
    html: string
    excerpt: string
    frontmatter: Queries.MarkdownRemarkFrontmatter
  }
  next?: {
    id: string
    excerpt: string
    frontmatter: Queries.MarkdownRemarkFrontmatter
    fields: {
      slug: string
    }
  }
  prev?: {
    id: string
    excerpt: string
    frontmatter: Queries.MarkdownRemarkFrontmatter
    fields: {
      slug: string
    }
  }
}

const BlogPost: React.FC<PageProps<DataProps>> = ({ data }) => {
  const { frontmatter, html, excerpt } = data.current!
  const { title, desc, thumbnail, date, category } = frontmatter!

  const nextPost = data.next
    ? {
        id: data.next.id,
        ...data.next.frontmatter,
        slug: data.next.fields.slug,
        thumbnail:
          data.next.frontmatter.thumbnail?.childImageSharp?.gatsbyImageData
            ?.images?.fallback?.src,
      }
    : undefined
  const prevPost = data.prev
    ? {
        id: data.prev.id,
        ...data.prev.frontmatter,
        slug: data.prev.fields.slug,
        thumbnail:
          data.prev.frontmatter.thumbnail?.childImageSharp?.gatsbyImageData
            ?.images?.fallback?.src,
      }
    : undefined

  console.log(nextPost, prevPost)

  const ogImagePath =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    thumbnail &&
    thumbnail?.childImageSharp?.gatsbyImageData!.images!.fallback!.src

  return (
    <Layout>
      <SEO title={title} desc={desc || excerpt} image={ogImagePath} />
      <main>
        <article>
          <OuterWrapper>
            <InnerWrapper>
              <div>
                <header>
                  <Info>
                    <PostCategory>{category}</PostCategory>
                    <Time dateTime={date!}>{date}</Time>
                  </Info>
                  <Title>{title}</Title>
                  <Desc>{desc}</Desc>
                </header>
                <Divider />
                <Markdown
                  dangerouslySetInnerHTML={{ __html: html ?? "" }}
                  rhythm={rhythm}
                />
              </div>
            </InnerWrapper>
          </OuterWrapper>
        </article>
        <PostNavigator prevPost={prevPost} nextPost={nextPost} />
      </main>
    </Layout>
  )
}

const OuterWrapper = styled.div`
  margin-top: var(--sizing-xl);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    margin-top: var(--sizing-lg);
  }
`

const InnerWrapper = styled.div`
  width: var(--post-width);
  margin: 0 auto;
  padding-bottom: var(--sizing-lg);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    width: 87.5%;
  }
`

const PostCategory = styled(Category)`
  font-size: 0.875rem;
  font-weight: var(--font-weight-semi-bold);
`

const Info = styled.div`
  margin-bottom: var(--sizing-md);
`

const Time = styled(DateTime)`
  display: block;
  margin-top: var(--sizing-xs);
`

const Desc = styled.p`
  margin-top: var(--sizing-lg);
  line-height: 1.5;
  font-size: var(--text-lg);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    line-height: 1.31579;
    font-size: 1.1875rem;
  }
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--color-gray-3);
  margin-top: var(--sizing-lg);
  margin-bottom: var(--sizing-lg);
`

const Title = styled.h1`
  font-weight: var(--font-weight-bold);
  line-height: 1.1875;
  font-size: var(--text-xl);

  @media (max-width: ${({ theme }) => theme.device.md}) {
    line-height: 1.21875;
    font-size: 2.5rem;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    line-height: 1.21875;
    font-size: 2rem;
  }
`

export const query = graphql`
  query BlogPostPage($slug: String, $nextSlug: String, $prevSlug: String) {
    current: markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      excerpt(format: PLAIN)
      frontmatter {
        title
        desc
        thumbnail {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, layout: FIXED)
          }
        }
        date(formatString: "YYYY-MM-DD")
        category
      }
    }

    next: markdownRemark(fields: { slug: { eq: $nextSlug } }) {
      id
      excerpt(format: PLAIN)
      frontmatter {
        title
        desc
        thumbnail {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, layout: FIXED)
          }
        }
        date(formatString: "YYYY-MM-DD")
        category
      }
      fields {
        slug
      }
    }

    prev: markdownRemark(fields: { slug: { eq: $prevSlug } }) {
      id
      excerpt(format: PLAIN)
      frontmatter {
        title
        desc
        thumbnail {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, layout: FIXED)
          }
        }
        date(formatString: "YYYY-MM-DD")
        category
      }
      fields {
        slug
      }
    }
  }
`

export default BlogPost
