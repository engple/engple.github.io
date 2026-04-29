import React, { useLayoutEffect, useMemo, useState } from "react"

import { type PageProps, graphql } from "gatsby"
import kebabCase from "lodash/kebabCase"
import styled from "styled-components"

import Adsense from "~/src/components/adsense"
import PostGrid from "~/src/components/postGrid"
import SEO from "~/src/components/seo"
import useSiteMetadata from "~/src/hooks/useSiteMetadata"
import Layout from "~/src/layouts/layout"
import type Post from "~/src/types/Post"
import { createPostItemListJsonLd } from "~/src/utils/structuredData"

import { VERTICAL_AD_SLOT } from "../constants"

const STRUCTURED_POST_LIST_LIMIT = 10

const Home = ({
  pageContext,
  data,
}: PageProps<Queries.Query, Queries.MarkdownRemarkFrontmatter>) => {
  const [posts, setPosts] = useState<Post[]>([])
  const currentCategory = pageContext.category
  const postData = data.allMarkdownRemark.edges
  const visiblePostData = useMemo(() => {
    return currentCategory
      ? postData.filter(
          ({ node }) => node?.frontmatter?.category === currentCategory,
        )
      : postData
  }, [currentCategory, postData])
  useLayoutEffect(() => {
    setPosts(
      visiblePostData.map(({ node }) => {
        const { id, fields, frontmatter } = node
        const { slug } = fields!
        const { title, desc, date, category, thumbnail, alt } = frontmatter!
        const { childImageSharp } = thumbnail!

        return {
          id,
          slug,
          title,
          desc,
          date,
          category,
          thumbnail: childImageSharp?.id,
          alt,
        }
      }),
    )
  }, [visiblePostData])

  const site = useSiteMetadata()
  const postTitle = currentCategory || site.postTitle
  const pagePath = currentCategory
    ? `/category/${kebabCase(currentCategory)}/`
    : "/"
  const pageUrl = `${site.siteUrl}${pagePath}`
  const itemListId = `${pageUrl}#itemlist`
  const itemListJsonLd = createPostItemListJsonLd({
    id: itemListId,
    name: `${postTitle} 글 목록`,
    posts: visiblePostData
      .slice(0, STRUCTURED_POST_LIST_LIMIT)
      .map(({ node }) => ({
        slug: node.fields?.slug,
        title: node.frontmatter?.title,
      })),
    siteUrl: site.siteUrl || "",
  })

  return (
    <Layout>
      <SEO
        title={currentCategory ? `${postTitle} - ${site.title}` : undefined}
        desc={
          currentCategory
            ? `${postTitle} 카테고리의 영어 표현 학습 글을 확인해보세요.`
            : undefined
        }
        url={pageUrl}
        pageType="CollectionPage"
        mainEntityId={itemListId}
        jsonLds={[itemListJsonLd]}
      />
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
  overflow: hidden;
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
  position: fixed;
  top: calc(var(--nav-height) + 400px);
  transform: translateY(-50%);
  right: calc(50% + var(--max-width) / 2 + var(--sizing-xl));
  width: 300px;
  height: 600px;
  display: flex;
  flex-direction: column;
  gap: 100vh;

  @media (max-width: ${({ theme }) => theme.device.lg}) {
    display: none;
  }
`

const RightAd = styled.div`
  position: absolute;
  top: 400px;
  transform: translateY(-50%);
  left: calc(50% + var(--max-width) / 2 + var(--sizing-xl));
  width: 300px;
  height: 600px;
  display: flex;
  flex-direction: column;
  gap: 100vh;

  @media (max-width: ${({ theme }) => theme.device.lg}) {
    display: none;
  }
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
