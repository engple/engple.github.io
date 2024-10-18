import React, { useEffect, useState } from "react"

import { type PageProps, graphql } from "gatsby"
import styled from "styled-components"

import Adsense from "~/src/components/adsense"
import PostGrid from "~/src/components/postGrid"
import SEO from "~/src/components/seo"
import useSiteMetadata from "~/src/hooks/useSiteMetadata"
import Layout from "~/src/layouts/layout"
import type Post from "~/src/types/Post"

import { VERTICAL_AD_SLOT } from "../constants/adsense"

const SearchPage: React.FC<PageProps<Queries.Query>> = ({ location, data }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Post[]>([])
  const site = useSiteMetadata()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const query = params.get("q")
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [location.search, data])

  const performSearch = (query: string) => {
    const allPosts = data.allMarkdownRemark.edges.map(({ node }) => ({
      id: node.id,
      slug: node.fields?.slug || "",
      title: node.frontmatter?.title || "",
      desc: node.frontmatter?.desc || "",
      date: node.frontmatter?.date || "",
      category: node.frontmatter?.category || "",
      thumbnail: node.frontmatter?.thumbnail?.childImageSharp?.id,
      alt: node.frontmatter?.alt || "",
      excerpt: node.excerpt || "",
    }))

    const filteredPosts = allPosts.filter(
      post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.desc.toLowerCase().includes(query.toLowerCase()) ||
        post.category.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase()),
    )

    setSearchResults(filteredPosts)
  }

  return (
    <Layout>
      <SEO title={`'${searchQuery}'에 대한 검색 결과 - ${site.title}`} />
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
          <SearchTitle>'{searchQuery}'에 대한 검색 결과</SearchTitle>
          {searchResults.length > 0 ? (
            <PostGrid posts={searchResults} />
          ) : (
            <NoResultsMessage>검색 결과가 없습니다</NoResultsMessage>
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

const SearchTitle = styled.h1`
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
`

const RightAd = styled.div`
  position: fixed;
  top: calc(var(--nav-height) + 400px);
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

const NoResultsMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: calc(var(--sizing-xxxl) * 2);
  font-size: var(--text-md);
  color: var(--color-gray-6);
  font-weight: var(--font-weight-semi-bold);
`

export const query = graphql`
  query SearchPage {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/(posts/blog)/" } }
      sort: { frontmatter: { date: DESC } }
    ) {
      edges {
        node {
          id
          excerpt(pruneLength: 200)
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
