import React, { useLayoutEffect, useMemo, useState } from "react"

import { Link, type PageProps, graphql } from "gatsby"
import kebabCase from "lodash/kebabCase"
import styled from "styled-components"

import Adsense from "~/src/components/adsense"
import CategoryFilter from "~/src/components/catetgoryFilter/categoryFilter"
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
  const latestPost = visiblePostData[0]?.node
  const totalPostCount = visiblePostData.length
  const totalCategoryCount = data.allMarkdownRemark.group.length
  const heroTitle = currentCategory
    ? `${postTitle} 표현을 감각적으로 익히는 큐레이션`
    : "실전에서 바로 쓰는 영어 표현 아카이브"
  const heroDescription = currentCategory
    ? `${postTitle} 카테고리의 표현을 한곳에 모아, 문맥과 뉘앙스를 빠르게 익힐 수 있도록 정리했습니다.`
    : "짧게 훑어도 감이 오고, 오래 읽어도 남는 표현 학습 블로그를 목표로 구성했습니다. 최신 글과 카테고리를 중심으로 바로 탐색해보세요."

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
          <HeroSection>
            <HeroCopy>
              <HeroEyebrow>
                {currentCategory ? "Category Spotlight" : "English Expressions"}
              </HeroEyebrow>
              <HeroTitle>{heroTitle}</HeroTitle>
              <HeroDescription>{heroDescription}</HeroDescription>
              <HeroStats>
                <StatItem>
                  <StatValue>{totalPostCount}</StatValue>
                  <StatLabel>
                    {currentCategory ? "이 카테고리 글" : "전체 글"}
                  </StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{totalCategoryCount}</StatValue>
                  <StatLabel>카테고리</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{latestPost?.frontmatter?.date ?? "-"}</StatValue>
                  <StatLabel>최신 업데이트</StatLabel>
                </StatItem>
              </HeroStats>
            </HeroCopy>
            {latestPost && (
              <HeroFeature to={latestPost.fields?.slug ?? "/"}>
                <HeroFeatureLabel>Latest Pick</HeroFeatureLabel>
                <HeroFeatureCategory>
                  {latestPost.frontmatter?.category}
                </HeroFeatureCategory>
                <HeroFeatureTitle>
                  {latestPost.frontmatter?.title}
                </HeroFeatureTitle>
                <HeroFeatureDescription>
                  {latestPost.frontmatter?.desc}
                </HeroFeatureDescription>
                <HeroFeatureMeta>
                  <span>{latestPost.frontmatter?.date}</span>
                  <span>글 보러가기</span>
                </HeroFeatureMeta>
              </HeroFeature>
            )}
          </HeroSection>
          <CategoryFilter categoryList={data.allMarkdownRemark.group} />
          <SectionHeader>
            <PostTitle>{postTitle}</PostTitle>
            <SectionDescription>
              {currentCategory
                ? `${postTitle} 표현을 최신순으로 정리했습니다.`
                : "최근 올라온 표현과 예문을 카드 형태로 빠르게 둘러볼 수 있습니다."}
            </SectionDescription>
          </SectionHeader>
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
  position: relative;
  overflow: hidden;
`

const Content = styled.div`
  box-sizing: content-box;
  width: min(90%, calc(var(--max-width) + 72px));
  max-width: var(--max-width);
  padding-top: 32px;
  padding-bottom: var(--sizing-lg);
  margin: 0 auto;

  @media (min-width: ${({ theme }) => theme.device.sm}) {
    padding-top: 44px;
  }
`

const HeroSection = styled.section`
  display: grid;
  gap: 24px;
  margin-bottom: 28px;
  padding: clamp(24px, 4vw, 40px);
  border: 1px solid var(--color-card-border);
  border-radius: var(--border-radius-lg);
  background:
    radial-gradient(
      circle at top right,
      var(--color-hero-highlight),
      transparent 34%
    ),
    linear-gradient(135deg, var(--color-hero-bg) 0%, var(--color-card) 100%);
  box-shadow: 0 30px 80px -56px var(--color-card-shadow);

  @media (min-width: ${({ theme }) => theme.device.md}) {
    grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.9fr);
    align-items: stretch;
  }
`

const HeroCopy = styled.div`
  display: grid;
  gap: 20px;
`

const HeroEyebrow = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semi-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-blue);
  background-color: var(--color-accent-soft);
`

const HeroTitle = styled.h1`
  max-width: 12ch;
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 1.04;
`

const HeroDescription = styled.p`
  max-width: 62ch;
  font-size: clamp(1rem, 1.6vw, 1.125rem);
  line-height: 1.75;
  color: var(--color-text-2);
`

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    grid-template-columns: 1fr;
  }
`

const StatItem = styled.div`
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid var(--color-card-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface-elevated);
`

const StatValue = styled.span`
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: var(--font-weight-bold);
`

const StatLabel = styled.span`
  font-size: var(--text-sm);
  color: var(--color-text-3);
`

const HeroFeature = styled(Link)`
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 22px;
  border-radius: calc(var(--border-radius-lg) - 8px);
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-card-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);

  &:hover,
  &:focus-visible {
    transform: translateY(-4px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.28),
      0 24px 48px -40px var(--color-card-shadow);
  }
`

const HeroFeatureLabel = styled.span`
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semi-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-3);
`

const HeroFeatureCategory = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semi-bold);
  color: var(--color-blue);
  background-color: var(--color-accent-soft);
`

const HeroFeatureTitle = styled.h2`
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 1.18;
`

const HeroFeatureDescription = styled.p`
  line-height: 1.7;
  color: var(--color-text-2);
`

const HeroFeatureMeta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--sizing-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semi-bold);
  color: var(--color-text-3);

  span {
    color: inherit;
  }
`

const SectionHeader = styled.div`
  display: grid;
  gap: 10px;
  margin-bottom: var(--sizing-md);
`

const PostTitle = styled.h2`
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: var(--font-weight-extra-bold);
  line-height: 1.15;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.75rem;
  }
`

const SectionDescription = styled.p`
  color: var(--color-text-2);
  line-height: 1.65;
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
