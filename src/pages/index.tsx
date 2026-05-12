import React, { useLayoutEffect, useMemo, useState } from "react"

import { Link, type PageProps, graphql } from "gatsby"
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
  const categoryGroups = useMemo(() => {
    return [...(data.allMarkdownRemark.group ?? [])]
      .filter(group => group.fieldValue)
      .sort((first, second) => second.totalCount - first.totalCount)
  }, [data.allMarkdownRemark.group])
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
          <HeroSection aria-labelledby="home-heading">
            <HeroCopy>
              <HeroEyebrow>
                {currentCategory ? "Category Archive" : "Explore Engple"}
              </HeroEyebrow>
              <PostTitle id="home-heading">{postTitle}</PostTitle>
              <HeroDescription>
                {currentCategory
                  ? `${postTitle} 카테고리의 영어 표현과 학습 글을 최신순으로 확인해보세요.`
                  : site.description}
              </HeroDescription>
            </HeroCopy>
            <CategorySection aria-labelledby="category-heading">
              <SectionHeading id="category-heading">카테고리</SectionHeading>
              <CategoryShelf>
                <CategoryPill $isActive={!currentCategory} to="/">
                  전체
                </CategoryPill>
                {categoryGroups.map(group => (
                  <CategoryPill
                    key={group.fieldValue}
                    $isActive={group.fieldValue === currentCategory}
                    to={`/category/${kebabCase(group.fieldValue ?? "")}/`}
                  >
                    <span>{group.fieldValue}</span>
                    <CategoryCount>{group.totalCount}</CategoryCount>
                  </CategoryPill>
                ))}
              </CategoryShelf>
            </CategorySection>
          </HeroSection>
          <PostListSection aria-labelledby="post-list-heading">
            <SectionHeading id="post-list-heading">
              {currentCategory ? `${postTitle} 최신 글` : "최신 영어 표현 글"}
            </SectionHeading>
            <PostGrid posts={posts} />
          </PostListSection>
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

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--sizing-md);
  margin-bottom: var(--sizing-lg);
`

const HeroCopy = styled.div`
  max-width: 46rem;
`

const HeroEyebrow = styled.p`
  margin-bottom: 6px;
  color: var(--color-text-3);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const PostTitle = styled.h1`
  font-size: 2rem;
  font-weight: var(--font-weight-extra-bold);
  line-height: 1.21875;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.75rem;
  }
`

const HeroDescription = styled.p`
  max-width: 40rem;
  margin-top: 10px;
  color: var(--color-text-2);
  font-size: 1rem;
  line-height: 1.7;
`

const CategorySection = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--sizing-sm);
`

const SectionHeading = styled.h2`
  margin-bottom: 0;
  color: var(--color-text);
  font-size: 1.125rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.3;
`

const CategoryShelf = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const PostListSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--sizing-md);
`

const CategoryPill = styled(Link)<{ $isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 2.75rem;
  padding: 0 14px;
  border: 1px solid
    ${({ $isActive }) =>
      $isActive ? "var(--color-gray-4)" : "var(--color-gray-2)"};
  border-radius: 999px;
  background-color: ${({ $isActive }) =>
    $isActive ? "var(--color-card)" : "transparent"};
  color: ${({ $isActive }) =>
    $isActive ? "var(--color-text)" : "var(--color-text-2)"};
  font-size: 0.9375rem;
  font-weight: ${({ $isActive }) =>
    $isActive ? "var(--font-weight-semi-bold)" : "var(--font-weight-medium)"};
  line-height: 1;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: var(--color-gray-3);
    background-color: var(--color-card);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  }
`

const CategoryCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 6px;
  border-radius: 999px;
  background-color: var(--color-post-background);
  color: var(--color-text-3);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
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
