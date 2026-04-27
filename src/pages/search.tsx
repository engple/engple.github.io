import React, { useEffect, useMemo, useRef } from "react"

import { Link, type PageProps, graphql } from "gatsby"
import { useGatsbyPluginFusejs } from "react-use-fusejs"
import styled from "styled-components"

import Adsense from "~/src/components/adsense"
import PostGrid from "~/src/components/postGrid"
import SEO from "~/src/components/seo"
import useSiteMetadata from "~/src/hooks/useSiteMetadata"
import Layout from "~/src/layouts/layout"
import type Post from "~/src/types/Post"
import {
  collectSearchSuggestionLabels,
  matchesSearchRecord,
} from "~/src/utils/search"

import { VERTICAL_AD_SLOT } from "../constants"

interface SearchItem {
  id: string
  title: string
  desc: string
  category: string
  body: string
}

interface SearchPageData {
  fusejs: {
    index: string
    data: SearchItem[]
  } | null
  allMarkdownRemark: {
    edges: {
      node: {
        id: string
        frontmatter?: {
          title?: string | null
          category?: string | null
          date?: string | null
          desc?: string | null
          thumbnail?: {
            childImageSharp?: {
              id?: string | null
            } | null
          } | null
          alt?: string | null
        } | null
        fields?: {
          slug?: string | null
        } | null
      }
    }[]
  }
}

const SUGGESTION_LIMIT = 6
const RECOMMENDATION_LIMIT = 4

const SearchPage: React.FC<PageProps<SearchPageData>> = ({
  location,
  data,
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const site = useSiteMetadata()
  const searchQuery = useMemo(() => {
    return new URLSearchParams(location.search).get("q")?.trim() ?? ""
  }, [location.search])
  const directMatches = useMemo(() => {
    return (
      data.fusejs?.data.filter(item =>
        matchesSearchRecord(item, searchQuery),
      ) ?? []
    )
  }, [data.fusejs, searchQuery])
  const postMap = useMemo(() => {
    return new Map(
      data.allMarkdownRemark.edges.map(({ node }) => [
        node.id,
        {
          id: node.id,
          slug: node.fields?.slug || "",
          title: node.frontmatter?.title || "",
          desc: node.frontmatter?.desc || "",
          date: node.frontmatter?.date || "",
          category: node.frontmatter?.category || "",
          thumbnail:
            node.frontmatter?.thumbnail?.childImageSharp?.id ?? undefined,
          alt: node.frontmatter?.alt || "",
        } satisfies Post,
      ]),
    )
  }, [data.allMarkdownRemark.edges])
  const fuzzyResults = useGatsbyPluginFusejs(
    searchQuery,
    data.fusejs,
    {
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.34,
      minMatchCharLength: 2,
    },
    undefined,
    { limit: 12 },
  )
  const searchResults = useMemo(() => {
    const orderedIds = [
      ...directMatches.map(item => item.id),
      ...fuzzyResults.map(result => result.item.id),
    ]
    const seenIds = new Set<string>()

    return orderedIds
      .filter(id => {
        if (seenIds.has(id)) return false
        seenIds.add(id)
        return true
      })
      .map(id => postMap.get(id))
      .filter(Boolean) as Post[]
  }, [directMatches, fuzzyResults, postMap])
  const suggestionTitles = useMemo(() => {
    const titleSource =
      directMatches.length > 0
        ? directMatches.map(item => item.title)
        : fuzzyResults.map(result => result.item.title)

    return collectSearchSuggestionLabels(
      titleSource,
      searchQuery,
      SUGGESTION_LIMIT,
    )
  }, [directMatches, fuzzyResults, searchQuery])
  const fallbackSuggestionTitles = useMemo(() => {
    return collectSearchSuggestionLabels(
      data.allMarkdownRemark.edges.map(
        ({ node }) => node.frontmatter?.title || "",
      ),
      "",
      SUGGESTION_LIMIT,
    )
  }, [data.allMarkdownRemark.edges])
  const relatedSuggestionTitles = useMemo(() => {
    return suggestionTitles.filter(title => title !== searchQuery)
  }, [searchQuery, suggestionTitles])
  const recommendedPosts = useMemo(() => {
    return data.allMarkdownRemark.edges
      .slice(0, RECOMMENDATION_LIMIT)
      .map(({ node }) => ({
        id: node.id,
        slug: node.fields?.slug || "",
        title: node.frontmatter?.title || "",
        category: node.frontmatter?.category || "",
      }))
  }, [data.allMarkdownRemark.edges])
  const totalResultCount = searchResults.length

  useEffect(() => {
    headingRef.current?.focus()
  }, [searchQuery, totalResultCount])

  return (
    <Layout>
      <SEO
        title={
          searchQuery
            ? `'${searchQuery}'에 대한 검색 결과 - ${site.title}`
            : `검색 - ${site.title}`
        }
        desc={
          searchQuery
            ? `'${searchQuery}' 검색 결과와 추천 표현을 확인해보세요.`
            : "영어 표현과 글을 검색해보세요."
        }
        url={`${site.siteUrl}/search/`}
        noIndex
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
          <SearchHeader>
            <SearchTitle ref={headingRef} tabIndex={-1}>
              {searchQuery ? `'${searchQuery}' 검색` : "검색"}
            </SearchTitle>
            <SearchMeta aria-live="polite">
              {searchQuery
                ? `${totalResultCount}개의 결과`
                : "검색어를 입력해 결과를 찾아보세요."}
            </SearchMeta>
          </SearchHeader>

          {searchQuery ? searchResults.length > 0 ? (
            <>
              {relatedSuggestionTitles.length > 0 && (
                <SuggestionSection aria-labelledby="related-search-heading">
                  <SuggestionHeading id="related-search-heading">
                    비슷한 검색어
                  </SuggestionHeading>
                  <SuggestionList>
                    {relatedSuggestionTitles.map(title => (
                      <SuggestionItem key={title}>
                        <SuggestionLink
                          to={`/search/?q=${encodeURIComponent(title)}`}
                        >
                          {title}
                        </SuggestionLink>
                      </SuggestionItem>
                    ))}
                  </SuggestionList>
                </SuggestionSection>
              )}
              <PostGrid posts={searchResults} />
            </>
          ) : (
            <EmptyState>
              <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
              <EmptyBody>
                다른 단어로 검색하거나 아래 추천 검색어를 시도해보세요.
              </EmptyBody>
              {(relatedSuggestionTitles.length > 0 ||
                fallbackSuggestionTitles.length > 0) && (
                <SuggestionSection aria-labelledby="search-suggestion-heading">
                  <SuggestionHeading id="search-suggestion-heading">
                    추천 검색어
                  </SuggestionHeading>
                  <SuggestionList>
                    {(relatedSuggestionTitles.length > 0
                      ? relatedSuggestionTitles
                      : fallbackSuggestionTitles
                    ).map(title => (
                      <SuggestionItem key={title}>
                        <SuggestionLink
                          to={`/search/?q=${encodeURIComponent(title)}`}
                        >
                          {title}
                        </SuggestionLink>
                      </SuggestionItem>
                    ))}
                  </SuggestionList>
                </SuggestionSection>
              )}
              <RecommendationSection aria-labelledby="recommended-posts-heading">
                <SuggestionHeading id="recommended-posts-heading">
                  최근 글
                </SuggestionHeading>
                <RecommendationList>
                  {recommendedPosts.map(post => (
                    <RecommendationItem key={post.id}>
                      <RecommendationLink to={post.slug}>
                        <RecommendationCategory>
                          {post.category}
                        </RecommendationCategory>
                        <RecommendationTitle>{post.title}</RecommendationTitle>
                      </RecommendationLink>
                    </RecommendationItem>
                  ))}
                </RecommendationList>
              </RecommendationSection>
            </EmptyState>
          ) : (
            <EmptyState>
              <EmptyTitle>검색어를 입력해보세요</EmptyTitle>
              <EmptyBody>
                표현, 단어, 상황 설명으로 검색할 수 있습니다.
              </EmptyBody>
              {fallbackSuggestionTitles.length > 0 && (
                <SuggestionSection aria-labelledby="search-suggestion-heading">
                  <SuggestionHeading id="search-suggestion-heading">
                    추천 검색어
                  </SuggestionHeading>
                  <SuggestionList>
                    {fallbackSuggestionTitles.map(title => (
                      <SuggestionItem key={title}>
                        <SuggestionLink
                          to={`/search/?q=${encodeURIComponent(title)}`}
                        >
                          {title}
                        </SuggestionLink>
                      </SuggestionItem>
                    ))}
                  </SuggestionList>
                </SuggestionSection>
              )}
            </EmptyState>
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

const SearchHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--sizing-md);
`

const SearchTitle = styled.h1`
  font-size: 2rem;
  font-weight: var(--font-weight-extra-bold);
  line-height: 1.21875;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.75rem;
  }
`

const SearchMeta = styled.p`
  color: var(--color-text-3);
  font-size: var(--text-sm);
  line-height: 1.5;
`

const SuggestionSection = styled.section`
  margin-bottom: var(--sizing-md);
`

const SuggestionHeading = styled.h2`
  margin-bottom: 10px;
  color: var(--color-text-2);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semi-bold);
`

const SuggestionList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
`

const SuggestionItem = styled.li`
  margin: 0;
`

const SuggestionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 2.25rem;
  padding: 0 14px;
  border: 1px solid var(--color-gray-3);
  border-radius: 999px;
  background-color: var(--color-post-background);
  color: var(--color-text-2);
  font-size: var(--text-sm);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: var(--color-gray-4);
    background-color: var(--color-gray-1);
  }
`

const EmptyState = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--sizing-md);
  padding: var(--padding-lg);
  border: 1px solid var(--color-gray-3);
  border-radius: var(--border-radius-md);
  background-color: var(--color-post-background);
`

const EmptyTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
`

const EmptyBody = styled.p`
  color: var(--color-text-3);
  line-height: 1.6;
`

const RecommendationSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const RecommendationList = styled.ul`
  display: grid;
  gap: 10px;
  list-style: none;
  padding: 0;
`

const RecommendationItem = styled.li`
  margin: 0;
`

const RecommendationLink = styled(Link)`
  display: block;
  padding: 14px 16px;
  border: 1px solid var(--color-gray-3);
  border-radius: var(--border-radius-base);
  background-color: var(--color-card);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: var(--color-gray-4);
    background-color: var(--color-gray-1);
  }
`

const RecommendationCategory = styled.span`
  display: block;
  margin-bottom: 6px;
  color: var(--color-text-3);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semi-bold);
`

const RecommendationTitle = styled.span`
  display: block;
  color: var(--color-text);
  font-weight: var(--font-weight-semi-bold);
  line-height: 1.45;
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
  query SearchPage {
    fusejs {
      index
      data
    }
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/(posts/blog)/" } }
      sort: { frontmatter: { date: DESC } }
    ) {
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

export default SearchPage
