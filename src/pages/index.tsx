import React, { useLayoutEffect, useState } from "react"

import { type PageProps, graphql } from "gatsby"
import styled from "styled-components"

import Adsense from "~/src/components/adsense"
import PostGrid from "~/src/components/postGrid"
import SEO from "~/src/components/seo"
import useSiteMetadata from "~/src/hooks/useSiteMetadata"
import Layout from "~/src/layouts/layout"
import type Post from "~/src/types/Post"

import { VERTICAL_AD_SLOT } from "../constants/adsense"

const Home = ({
  pageContext,
  data,
}: PageProps<Queries.Query, Queries.MarkdownRemarkFrontmatter>) => {
  const [posts, setPosts] = useState<Post[]>([])
  const currentCategory = pageContext.category
  const postData = data.allMarkdownRemark.edges
  useLayoutEffect(() => {
    const filteredPostData = currentCategory
      ? postData.filter(
          ({ node }) => node?.frontmatter?.category === currentCategory,
        )
      : postData

    for (const { node } of filteredPostData) {
      const { id, fields, frontmatter } = node
      const { slug } = fields!
      const { title, desc, date, category, thumbnail, alt } = frontmatter!
      const { childImageSharp } = thumbnail!

      setPosts(previousPost => [
        ...previousPost,
        {
          id,
          slug,
          title,
          desc,
          date,
          category,
          thumbnail: childImageSharp?.id,
          alt,
        },
      ])
    }
  }, [currentCategory, postData])

  const site = useSiteMetadata()
  const postTitle = currentCategory || site.postTitle

  return (
    <Layout>
      <SEO />
      <Main>
        <LeftAd>
          <Adsense
            adClient={site.googleAdsense ?? ""}
            adSlot={VERTICAL_AD_SLOT}
            adFormat="auto"
            fullWidthResponsive={true}
            width={"300px"}
            height={"600px"}
            extraClassName="lg-only-ads"
          />
          <Adsense
            adClient={site.googleAdsense ?? ""}
            adSlot={VERTICAL_AD_SLOT}
            adFormat="auto"
            fullWidthResponsive={true}
            width={"300px"}
            height={"600px"}
            extraClassName="lg-only-ads"
          />
        </LeftAd>
        <Content>
          <PostTitle>{postTitle}</PostTitle>
          <PostGrid posts={posts} />
        </Content>
        <RightAd>
          <Adsense
            adClient={site.googleAdsense ?? ""}
            adSlot={VERTICAL_AD_SLOT}
            adFormat="auto"
            fullWidthResponsive={true}
            width={"300px"}
            height={"600px"}
            extraClassName="lg-only-ads"
          />
          <Adsense
            adClient={site.googleAdsense ?? ""}
            adSlot={VERTICAL_AD_SLOT}
            adFormat="auto"
            fullWidthResponsive={true}
            width={"300px"}
            height={"600px"}
            extraClassName="lg-only-ads"
          />
        </RightAd>
      </Main>
    </Layout>
  )
}

const Main = styled.main`
  min-width: var(--min-width);
  min-height: calc(100vh - var(--nav-height) - var(--footer-height));
  background-color: var(--color-background);
  position: relative;
`

const Content = styled.div`
  box-sizing: content-box;
  width: 87.5%;
  max-width: var(--max-width);
  padding-top: var(--grid-gap-lg);
  padding-bottom: var(--sizing-lg);
  margin: 0 auto;

  @media (min-width: ${({ theme }) => theme.device.sm}) {
    padding-top: var(--sizing-lg);
  }
`

const PostTitle = styled.h2`
  font-size: 2rem;
  font-weight: var(--font-weight-extra-bold);
  margin-bottom: var(--sizing-md);
  line-height: 1.21875;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.75rem;
  }
`

const LeftAd = styled.div`
  position: absolute;
  top: 400px;
  transform: translateY(-50%);
  right: calc(50% + var(--max-width) / 2 + var(--sizing-md));
  width: 300px;
  height: 600px;
  display: flex;
  flex-direction: column;
  gap: 100vh;
`

const RightAd = styled.div`
  position: absolute;
  top: 400px;
  transform: translateY(-50%);
  left: calc(50% + var(--max-width) / 2 + var(--sizing-md));
  width: 300px;
  height: 600px;
  display: flex;
  flex-direction: column;
  gap: 100vh;
`

export const query = graphql`
  query Home {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/(posts/blog)/" } }
      limit: 2000
      sort: { frontmatter: { date: DESC } }
    ) {
      group(field: { frontmatter: { category: SELECT } }) {
        fieldValue
        totalCount
      }
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            category
            date(formatString: "YYYY-MM-DD")
            desc
            thumbnail {
              childImageSharp {
                id
              }
              base
            }
            alt
          }
          fields {
            slug
          }
        }
      }
    }
  }
`

export default Home
