import React, { useMemo } from "react"

import { Link, type PageProps, graphql } from "gatsby"
import kebabCase from "lodash/kebabCase"
import styled from "styled-components"

import Adsense from "~/src/components/adsense"
import PostGrid from "~/src/components/postGrid"
import DailyExpressionCard from "~/src/components/retention/DailyExpressionCard"
import RecentPosts from "~/src/components/retention/RecentPosts"
import StreakBadge from "~/src/components/retention/StreakBadge"
import SEO from "~/src/components/seo"
import useSiteMetadata from "~/src/hooks/useSiteMetadata"
import Layout from "~/src/layouts/layout"
import { createPostItemListJsonLd } from "~/src/utils/structuredData"

import { VERTICAL_AD_SLOT } from "../constants"

const STRUCTURED_POST_LIST_LIMIT = 10
const POSTS_PER_PAGE = 24

interface PageContext {
  category?: string | null
  categoryRegex?: string
  currentPage?: number
  totalPages?: number
  basePath?: string
}

interface DataProps {
  categoryGroups: {
    group: {
      fieldValue: Queries.Maybe<string>
      totalCount: number
    }[]
  }
  posts: {
    totalCount: number
    edges: {
      node: {
        id: string
        frontmatter: Queries.MarkdownRemarkFrontmatter
        fields: {
          slug: string
        }
      }
    }[]
  }
}

const paginatedPath = (basePath: string, pageNumber: number) =>
  pageNumber === 1 ? basePath : `${basePath}page/${pageNumber}/`

type PaginationItem = number | "ellipsis"

const getPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= 1) return []

  const sortedPages = [
    ...new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]),
  ]
    .filter(pageNumber => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((first, second) => first - second)

  return sortedPages.flatMap((pageNumber, index) => {
    const previousPage = sortedPages[index - 1]
    const needsEllipsis = index > 0 && pageNumber - previousPage > 1

    return needsEllipsis
      ? (["ellipsis", pageNumber] as PaginationItem[])
      : [pageNumber]
  })
}

const Home = ({ pageContext, data }: PageProps<DataProps, PageContext>) => {
  const currentCategory = pageContext.category ?? undefined
  const currentPage = pageContext.currentPage ?? 1
  const totalPages =
    pageContext.totalPages ??
    Math.max(1, Math.ceil(data.posts.totalCount / POSTS_PER_PAGE))
  const basePath = pageContext.basePath ?? "/"
  const postData = data.posts.edges
  const categoryGroups = useMemo(() => {
    return [...(data.categoryGroups.group ?? [])]
      .filter(group => group.fieldValue)
      .sort((first, second) => second.totalCount - first.totalCount)
  }, [data.categoryGroups.group])
  const posts = useMemo(() => {
    return postData.map(({ node }) => {
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
    })
  }, [postData])

  const site = useSiteMetadata()
  const postTitle = currentCategory || site.postTitle
  const pagePath = paginatedPath(basePath, currentPage)
  const pageUrl = `${site.siteUrl}${pagePath}`
  const itemListId = `${pageUrl}#itemlist`
  const itemListJsonLd = createPostItemListJsonLd({
    id: itemListId,
    name: `${postTitle} 글 목록`,
    posts: postData.slice(0, STRUCTURED_POST_LIST_LIMIT).map(({ node }) => ({
      slug: node.fields?.slug,
      title: node.frontmatter?.title,
    })),
    siteUrl: site.siteUrl || "",
  })
  const paginationSuffix = currentPage > 1 ? ` - ${currentPage}페이지` : ""
  const seoTitle =
    currentPage > 1
      ? `${postTitle}${paginationSuffix}`
      : currentCategory
        ? postTitle
        : undefined
  const seoDesc = currentCategory
    ? `${postTitle} 카테고리의 영어 표현 학습 글을 확인해보세요.${paginationSuffix}`
    : currentPage > 1
      ? `${site.description}${paginationSuffix}`
      : undefined
  const prevUrl =
    currentPage > 1
      ? `${site.siteUrl}${paginatedPath(basePath, currentPage - 1)}`
      : undefined
  const nextUrl =
    currentPage < totalPages
      ? `${site.siteUrl}${paginatedPath(basePath, currentPage + 1)}`
      : undefined
  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  )
  const isMainHome = !currentCategory && currentPage === 1

  return (
    <Layout>
      <SEO
        title={seoTitle}
        desc={seoDesc}
        url={pageUrl}
        pageType="CollectionPage"
        mainEntityId={itemListId}
        jsonLds={[itemListJsonLd]}
        prevUrl={prevUrl}
        nextUrl={nextUrl}
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
          <HeroSection>
            <HeroCopy>
              <HeroEyebrow>
                {currentCategory
                  ? "Expression Archive"
                  : "Daily English Patterns"}
              </HeroEyebrow>
              <PostTitle>{currentCategory ?? "패턴으로 배우는 영어"}</PostTitle>
              <HeroTagline>
                {currentCategory
                  ? `${currentCategory} 상황에서 바로 쓰는 영어 표현을 예문과 발음으로 익혀보세요.`
                  : "실전 회화에서 바로 쓰는 영어 패턴을 매일 하나씩 — 예문, 발음, 연습 문제로 완성하세요."}
              </HeroTagline>
              <StreakRow>
                <StreakBadge />
              </StreakRow>
            </HeroCopy>
            {isMainHome && (
              <RetentionArea>
                <DailyExpressionCard posts={posts} />
                <RecentPosts />
              </RetentionArea>
            )}
            <CategoryShelf aria-label="카테고리 탐색">
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
          </HeroSection>
          <PostGrid posts={posts} />
          {paginationItems.length > 0 && (
            <PaginationNav aria-label="페이지 네비게이션">
              {currentPage > 1 && (
                <PaginationLink to={paginatedPath(basePath, currentPage - 1)}>
                  이전
                </PaginationLink>
              )}
              {paginationItems.map((item, index) =>
                item === "ellipsis" ? (
                  // eslint-disable-next-line react/no-array-index-key
                  <PaginationEllipsis key={`ellipsis-${index}`}>
                    …
                  </PaginationEllipsis>
                ) : (
                  <PaginationLink
                    key={item}
                    to={paginatedPath(basePath, item)}
                    aria-current={item === currentPage ? "page" : undefined}
                    $isActive={item === currentPage}
                  >
                    {item}
                  </PaginationLink>
                ),
              )}
              {currentPage < totalPages && (
                <PaginationLink to={paginatedPath(basePath, currentPage + 1)}>
                  다음
                </PaginationLink>
              )}
            </PaginationNav>
          )}
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
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const PostTitle = styled.h1`
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: var(--font-weight-extra-bold);
  line-height: 1.21875;

  &::after {
    content: "";
    display: block;
    width: 4.5rem;
    height: 4px;
    margin-top: 14px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--color-accent) 0%,
      var(--color-accent-soft) 100%
    );
    opacity: 0.75;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 2rem;
  }
`

const HeroTagline = styled.p`
  margin-top: 14px;
  color: var(--color-text-3);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 34rem;
`

const StreakRow = styled.div`
  margin-top: 12px;

  &:empty {
    display: none;
  }
`

const RetentionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--sizing-base);
  max-width: 34rem;

  &:empty {
    display: none;
  }
`

const CategoryShelf = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const CategoryPill = styled(Link)<{ $isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 2.75rem;
  padding: 0 14px;
  border: 1px solid
    ${({ $isActive }) =>
      $isActive ? "var(--color-primary)" : "var(--color-gray-2)"};
  border-radius: 999px;
  background-color: ${({ $isActive }) =>
    $isActive ? "var(--color-primary-soft)" : "transparent"};
  color: ${({ $isActive }) =>
    $isActive ? "var(--color-primary-strong)" : "var(--color-text-2)"};
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
    border-color: ${({ $isActive }) =>
      $isActive ? "var(--color-primary)" : "var(--color-gray-3)"};
    background-color: ${({ $isActive }) =>
      $isActive ? "var(--color-primary-soft)" : "var(--color-card)"};
    box-shadow: var(--shadow-sm);
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

const PaginationNav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: var(--sizing-xl);
`

const PaginationLink = styled(Link)<{ $isActive?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  height: 2.75rem;
  padding: 0 12px;
  border: 1px solid
    ${({ $isActive }) =>
      $isActive ? "var(--color-primary)" : "var(--color-gray-2)"};
  border-radius: 999px;
  background-color: ${({ $isActive }) =>
    $isActive ? "var(--color-primary-soft)" : "transparent"};
  color: ${({ $isActive }) =>
    $isActive ? "var(--color-primary-strong)" : "var(--color-text-2)"};
  font-size: 0.9375rem;
  font-weight: ${({ $isActive }) =>
    $isActive ? "var(--font-weight-semi-bold)" : "var(--font-weight-medium)"};
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $isActive }) =>
      $isActive ? "var(--color-primary)" : "var(--color-gray-3)"};
    background-color: ${({ $isActive }) =>
      $isActive ? "var(--color-primary-soft)" : "var(--color-card)"};
  }
`

const PaginationEllipsis = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  color: var(--color-text-3);
  font-size: 0.9375rem;
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
  query Home(
    $categoryRegex: String = "/.*/"
    $limit: Int = 24
    $skip: Int = 0
  ) {
    categoryGroups: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/(posts/blog)/" } }
      limit: 100000
    ) {
      group(field: { frontmatter: { category: SELECT } }) {
        fieldValue
        totalCount
      }
    }
    posts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/(posts/blog)/" }
        frontmatter: { category: { regex: $categoryRegex } }
      }
      sort: { frontmatter: { date: DESC } }
      limit: $limit
      skip: $skip
    ) {
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
