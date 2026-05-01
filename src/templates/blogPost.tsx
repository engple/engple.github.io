import React from "react"

import { Link, type PageProps, graphql } from "gatsby"
import kebabCase from "lodash/kebabCase"
import {
  type BlogPosting,
  type BreadcrumbList,
  type FAQPage,
  type LearningResource,
  type Thing,
} from "schema-dts"
import styled from "styled-components"

import SEO from "~/src/components/seo"
import useSiteMetadata from "~/src/hooks/useSiteMetadata"
import Layout from "~/src/layouts/layout"
import DateTime from "~/src/styles/dateTime"
import Markdown from "~/src/styles/markdown"
import { rhythm } from "~/src/styles/typography"
import type Post from "~/src/types/Post"

import Pronunciation from "../components/Pronunciation"
import Adsense from "../components/adsense"
import PostNavigator from "../components/postNavigator"
import TableOfContents from "../components/tableOfContents"
import { HORIZONTAL_AD_SLOT, VERTICAL_AD_SLOT } from "../constants"
import { useInteractiveList } from "../hooks/useInteractiveList"
import {
  initializeInlineAdsenseSlots,
  withInlineAdsense,
} from "../utils/adsense"
import {
  createDefinedTermJsonLd,
  createPracticeQuizJsonLd,
  getExpressionTerm,
} from "../utils/structuredData"

interface DataProps {
  current: {
    id: string
    html: string
    headings: {
      id: string
      depth: number
      value: string
    }[]
    excerpt: string
    frontmatter: Queries.MarkdownRemarkFrontmatter
    fields: {
      slug: string
      lastmod: string
    }
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
  relatedPosts: {
    edges: {
      node: {
        id: string
        excerpt: string
        frontmatter: Queries.MarkdownRemarkFrontmatter
        fields: {
          slug: string
        }
      }
    }[]
  }
}

const BlogPost: React.FC<PageProps<DataProps>> = ({ data }) => {
  const {
    frontmatter,
    html,
    excerpt,
    headings,
    fields: { slug, lastmod },
  } = data.current!
  const { title, desc, thumbnail, date, category, alt, faqs } = frontmatter!
  const site = useSiteMetadata()
  const articleRef = React.useRef<HTMLElement | null>(null)
  const htmlWithInlineAd =
    site.googleAdsense && HORIZONTAL_AD_SLOT
      ? withInlineAdsense(html ?? "", {
          idx: -2,
          adClient: site.googleAdsense,
          adSlot: HORIZONTAL_AD_SLOT,
        })
      : (html ?? "")

  useInteractiveList([html], { initialState: "first-expanded" })
  React.useEffect(() => {
    if (!site.googleAdsense || process.env.NODE_ENV === "development") return

    const article = articleRef.current

    if (!article) return

    return initializeInlineAdsenseSlots(article, HORIZONTAL_AD_SLOT)
  }, [site.googleAdsense, slug, htmlWithInlineAd])

  const nextPost = data.next ? mapPostNodeToPost(data.next) : undefined
  const prevPost = data.prev ? mapPostNodeToPost(data.prev) : undefined
  const relatedPosts = data.relatedPosts.edges
    .map(({ node }) => mapPostNodeToPost(node))
    .slice(0, 4)

  const ogImagePath =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    thumbnail &&
    thumbnail?.childImageSharp?.gatsbyImageData!.images!.fallback!.src

  const description = desc || excerpt
  const faqItems = (faqs ?? []).filter(item => item?.question && item?.answer)
  const categoryPath = `/category/${kebabCase(category ?? "")}/`
  const pageUrl = `${site.siteUrl}${slug}`
  const articleId = `${pageUrl}#article`
  const definedTermId = `${pageUrl}#definedterm`
  const expression = getExpressionTerm({ category, title, faqs })
  const exploreSearchTerm = expression || title || ""
  const tocHeadings =
    faqItems.length > 0
      ? [
          ...headings,
          { id: "faq-heading", depth: 2, value: "❓ 자주 묻는 질문" },
        ]
      : headings
  const compactTocHeadings = tocHeadings.filter(heading => heading.depth === 2)
  const hideLeadVisualOnDesktop = startsWithHeroImage(html, ogImagePath)

  const featureImageAlt = alt || title || ""

  const desktopFeatureImage =
    hideLeadVisualOnDesktop && ogImagePath ? (
      <FeatureMedia>
        <FeatureMediaImage src={ogImagePath} alt={featureImageAlt} />
      </FeatureMedia>
    ) : undefined

  const articleJsonLd = {
    "@type": "BlogPosting",
    "@id": articleId,
    headline: title,
    datePublished: date,
    dateModified: lastmod || date,
    author: {
      "@type": "Person",
      "@id": `${site.siteUrl}/#person`,
      name: "Engple Team",
      url: "https://github.com/engple",
    },
    description,
    url: pageUrl,
    thumbnailUrl: `${site.siteUrl}${ogImagePath}`,
    image: `${site.siteUrl}${ogImagePath}`,
    copyrightHolder: { "@id": `${site.siteUrl}/#organization` },
    publisher: { "@id": `${site.siteUrl}/#organization` },
    isPartOf: { "@id": `${site.siteUrl}/#website` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
    },
    wordCount: html?.split(" ").length,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article h1", "article h2", "[data-answer]"],
    },
  } as BlogPosting

  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@id": site.siteUrl,
          name: "잉플",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@id": `${site.siteUrl}${categoryPath}`,
          name: category,
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@id": pageUrl,
          name: title,
        },
      },
    ],
  } as BreadcrumbList

  const faqJsonLd = {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqItems.map(item => ({
      "@type": "Question",
      name: item?.question || "",
      acceptedAnswer: {
        "@type": "Answer",
        text: item?.answer || "",
      },
    })),
  } as FAQPage

  const learningResourceJsonLd = {
    "@type": "LearningResource",
    "@id": `${pageUrl}#learningresource`,
    name: title,
    description,
    educationalLevel: "beginner",
    learningResourceType: "lesson",
    inLanguage: ["ko", "en"],
    isAccessibleForFree: true,
    teaches: title,
    assesses: title,
    ...(expression ? { about: { "@id": definedTermId } } : {}),
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: "Korean English learners",
    },
    provider: { "@id": `${site.siteUrl}/#organization` },
  } as LearningResource

  const definedTermJsonLd = expression
    ? createDefinedTermJsonLd({
        category,
        description,
        expression,
        id: definedTermId,
        siteUrl: site.siteUrl || "",
        url: pageUrl,
      })
    : undefined
  const practiceQuizJsonLd = createPracticeQuizJsonLd({
    aboutId: expression ? definedTermId : undefined,
    expression,
    html,
    id: `${pageUrl}#practice-quiz`,
    title: title || "",
  })
  const jsonLds: Thing[] = [
    articleJsonLd,
    breadcrumbJsonLd,
    learningResourceJsonLd,
  ]

  if (definedTermJsonLd) {
    jsonLds.push(definedTermJsonLd)
  }

  if (practiceQuizJsonLd) {
    jsonLds.push(practiceQuizJsonLd)
  }

  if (faqItems.length > 0) {
    jsonLds.push(faqJsonLd)
  }

  return (
    <Layout>
      <SEO
        title={title}
        desc={description}
        url={pageUrl}
        image={ogImagePath}
        jsonLds={jsonLds}
        ogType="article"
        mainEntityId={articleId}
      />
      <main>
        <article ref={articleRef}>
          <OuterWrapper>
            <InnerWrapper>
              <ContentHeader>
                <Info>
                  <Time dateTime={date!}>{date?.split("T")[0]}</Time>
                </Info>
                <BreadcrumbNav aria-label="Breadcrumb">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink to="/">잉플</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <BreadcrumbLink to={categoryPath}>
                        {category}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <BreadcrumbCurrent aria-current="page">
                        {title}
                      </BreadcrumbCurrent>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </BreadcrumbNav>
                <Title>{title}</Title>
                <ExploreActions aria-label="탐색 바로가기">
                  <ExploreAction to={categoryPath}>
                    {category} 전체 보기
                  </ExploreAction>
                  <ExploreAction
                    to={`/search/?q=${encodeURIComponent(exploreSearchTerm)}`}
                  >
                    이 표현 더 찾기
                  </ExploreAction>
                </ExploreActions>
              </ContentHeader>
              <Divider />
              <ContentWrapper>
                <LeftAd>
                  {desktopFeatureImage}
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
                <CenterWrapper>
                  <Markdown
                    dangerouslySetInnerHTML={{ __html: htmlWithInlineAd }}
                    rhythm={rhythm}
                    $hideLeadVisualOnDesktop={hideLeadVisualOnDesktop}
                  />
                </CenterWrapper>
                <Pronunciation />
                <RightWrapper>
                  <TableOfContents headings={compactTocHeadings} />
                  <AsidePanel aria-labelledby="explore-panel-heading">
                    <AsideHeading id="explore-panel-heading">
                      Keep Exploring
                    </AsideHeading>
                    <AsidePostList>
                      {relatedPosts.map(post => (
                        <AsidePostItem key={post.id}>
                          <AsidePostLink to={post.slug as string}>
                            <AsidePostCategory>
                              {post.category}
                            </AsidePostCategory>
                            <AsidePostTitle>{post.title}</AsidePostTitle>
                          </AsidePostLink>
                        </AsidePostItem>
                      ))}
                    </AsidePostList>
                  </AsidePanel>
                </RightWrapper>
              </ContentWrapper>
              {faqItems.length > 0 && (
                <FaqSection aria-labelledby="faq-heading">
                  <FaqSectionHeader>
                    <FaqHeading id="faq-heading">❓ 자주 묻는 질문</FaqHeading>
                  </FaqSectionHeader>
                  <FaqList>
                    {faqItems.map((item, index) => (
                      <FaqItem
                        key={item?.question ?? item?.answer ?? "faq"}
                        data-faq-item="true"
                        open={index === 0}
                      >
                        <FaqSummary>
                          <FaqIndex>Q{index + 1}</FaqIndex>
                          <FaqQuestion>{item?.question}</FaqQuestion>
                          <FaqChevron aria-hidden="true" />
                        </FaqSummary>
                        <FaqAnswerWrap>
                          <FaqAnswer>{item?.answer}</FaqAnswer>
                        </FaqAnswerWrap>
                      </FaqItem>
                    ))}
                  </FaqList>
                </FaqSection>
              )}
              <ContinueSection aria-labelledby="continue-heading">
                <ContinueHeader>
                  <ContinueEyebrow>Continue Learning</ContinueEyebrow>
                  <ContinueHeading id="continue-heading">
                    같은 흐름으로 더 탐색해보세요
                  </ContinueHeading>
                </ContinueHeader>
                <ContinueGrid>
                  <CategoryArchiveCard to={categoryPath}>
                    <CategoryArchiveLabel>{category}</CategoryArchiveLabel>
                    <CategoryArchiveTitle>
                      {category} 카테고리 전체 보기
                    </CategoryArchiveTitle>
                    <CategoryArchiveCopy>
                      같은 결의 표현을 한 번에 둘러볼 수 있는 아카이브로
                      이동합니다.
                    </CategoryArchiveCopy>
                  </CategoryArchiveCard>
                  {relatedPosts.map(post => (
                    <ContinueCard key={post.id} to={post.slug as string}>
                      <ContinueCardCategory>
                        {post.category}
                      </ContinueCardCategory>
                      <ContinueCardTitle>{post.title}</ContinueCardTitle>
                      {post.desc ? (
                        <ContinueCardCopy>{post.desc}</ContinueCardCopy>
                      ) : undefined}
                    </ContinueCard>
                  ))}
                </ContinueGrid>
              </ContinueSection>
            </InnerWrapper>
          </OuterWrapper>
        </article>
        <PostNavigator prevPost={prevPost} nextPost={nextPost} />
      </main>
    </Layout>
  )
}

const startsWithHeroImage = (html?: string | null, imagePath?: string) => {
  if (!html || !imagePath) return false

  const leadingImage = html
    .trimStart()
    .match(
      /^<p>\s*<span class="gatsby-resp-image-wrapper"[\S\s]*?<\/span>\s*<\/p>/,
    )

  return Boolean(leadingImage?.[0]?.includes(imagePath))
}

const mapPostNodeToPost = ({
  id,
  excerpt,
  frontmatter,
  fields,
}: {
  id: string
  excerpt: string
  frontmatter: Queries.MarkdownRemarkFrontmatter
  fields: {
    slug: string
  }
}): Post => {
  return {
    id,
    ...frontmatter,
    desc: frontmatter.desc || excerpt,
    slug: fields.slug,
    thumbnail:
      frontmatter.thumbnail?.childImageSharp?.gatsbyImageData?.images?.fallback
        ?.src,
  }
}

const OuterWrapper = styled.div`
  margin-top: var(--sizing-lg);
  position: relative;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    margin-top: var(--sizing-lg);
  }
`

const InnerWrapper = styled.div`
  margin: 0 auto;
  padding-bottom: var(--sizing-lg);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    width: 87.5%;
  }
`

const ContentHeader = styled.div`
  width: var(--post-width);

  @media (min-width: ${({ theme }) => theme.device.sm}) {
    margin: 0 auto;
  }
`

const BreadcrumbNav = styled.nav`
  width: 100%;
  max-width: 100%;
  margin-bottom: 14px;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    max-width: 100%;
    margin-bottom: 10px;
  }
`

const BreadcrumbList = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  list-style: none;
  margin: 0;
  padding: 0;
`

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  & + &::before {
    content: "·";
    color: var(--color-gray-4);
    font-size: 0.75rem;
    font-weight: var(--font-weight-regular);
  }

  &:last-child {
    flex: 1 1 12rem;
  }
`

const BreadcrumbLink = styled(Link)`
  color: var(--color-text-3);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-text);
  }
`

const BreadcrumbCurrent = styled.span`
  color: var(--color-text-2);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-semi-bold);
  line-height: 1.4;
`

const ContentWrapper = styled.div`
  display: flex;
  margin: var(--sizing-md) 0;
  justify-content: center;
  gap: var(--sizing-xl);
`

const Info = styled.div`
  margin-bottom: var(--sizing-sm);
`

const Time = styled(DateTime)`
  display: block;
`

const Divider = styled.div`
  width: var(--post-width);
  margin: 0 auto;
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

const ExploreActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: var(--sizing-md);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    margin-top: var(--sizing-sm);
  }
`

const ExploreAction = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 16px;
  border: 1px solid var(--color-gray-2);
  border-radius: 999px;
  background-color: var(--color-card);
  color: var(--color-text-2);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-semi-bold);
  line-height: 1;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;

  &:hover {
    color: var(--color-text);
    border-color: var(--color-gray-3);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
    transform: translateY(-1px);
  }
`

const LeftAd = styled.div`
  min-width: 300px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: var(--padding-sm);
  align-self: flex-start;
  position: sticky;
  top: 124px;
  max-height: calc(100vh - 148px);
  padding-right: 4px;
  overflow: hidden auto;

  @media (max-width: ${({ theme }) => theme.device.lg}) {
    display: none;
  }
`

const FeatureMedia = styled.div`
  width: 100%;
  border: 1px solid var(--color-gray-2);
  border-radius: var(--border-radius-md);
  background: linear-gradient(
    180deg,
    var(--color-card) 0%,
    var(--color-gray-1) 100%
  );
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden;
`

const FeatureMediaImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`

const RightWrapper = styled.div`
  min-width: 300px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: var(--sizing-lg);
  align-items: center;
  align-self: flex-start;
  position: sticky;
  top: 124px;
  max-height: calc(100vh - 148px);
  padding-right: 4px;
  overflow: hidden auto;

  @media (max-width: ${({ theme }) => theme.device.lg}) {
    display: none;
  }
`

const AsidePanel = styled.aside`
  width: 100%;
  padding: 18px;
  border: 1px solid var(--color-gray-2);
  border-radius: var(--border-radius-md);
  background: linear-gradient(
    180deg,
    var(--color-card) 0%,
    var(--color-gray-1) 100%
  );
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
`

const AsideHeading = styled.h2`
  color: var(--color-text-3);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.45;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const AsidePostList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
`

const AsidePostItem = styled.li`
  margin: 0;
`

const AsidePostLink = styled(Link)`
  display: block;
  padding: 12px 14px;
  border: 1px solid var(--color-gray-2);
  border-radius: 12px;
  background-color: transparent;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background-color: var(--color-post-background);
    border-color: var(--color-gray-3);
    transform: translateX(2px);
  }
`

const AsidePostCategory = styled.span`
  display: block;
  color: var(--color-text-3);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const AsidePostTitle = styled.span`
  display: block;
  margin-top: 6px;
  color: var(--color-text-2);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-semi-bold);
  line-height: 1.5;
`

const ContinueSection = styled.section`
  width: var(--post-width);
  margin: var(--sizing-xl) auto 0;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    margin-top: var(--sizing-lg);
  }
`

const ContinueHeader = styled.div`
  margin-bottom: var(--sizing-md);
`

const ContinueEyebrow = styled.p`
  margin-bottom: 6px;
  color: var(--color-text-3);
  font-size: 0.6875rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const ContinueHeading = styled.h2`
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.3;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.4rem;
  }
`

const ContinueDescription = styled.p`
  margin-top: 10px;
  color: var(--color-text-2);
  font-size: 0.975rem;
  line-height: 1.7;
`

const ContinueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--padding-sm);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    grid-template-columns: 1fr;
  }
`

const ContinueCardBase = styled(Link)`
  display: block;
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--color-gray-2);
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    var(--color-card) 0%,
    var(--color-gray-1) 100%
  );
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--color-gray-3);
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
  }
`

const CategoryArchiveCard = styled(ContinueCardBase)`
  background:
    radial-gradient(
      circle at top left,
      rgba(10, 132, 255, 0.18),
      transparent 55%
    ),
    linear-gradient(180deg, var(--color-card) 0%, var(--color-gray-1) 100%);
`

const CategoryArchiveLabel = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 1.75rem;
  padding: 0 10px;
  border-radius: 999px;
  background-color: var(--color-post-background);
  color: var(--color-text-3);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
`

const CategoryArchiveTitle = styled.h3`
  margin-top: 14px;
  font-size: 1.2rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.4;
`

const CategoryArchiveCopy = styled.p`
  margin-top: 10px;
  color: var(--color-text-2);
  font-size: 0.9375rem;
  line-height: 1.7;
`

const ContinueCard = styled(ContinueCardBase)``

const ContinueCardCategory = styled.span`
  display: block;
  color: var(--color-text-3);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const ContinueCardTitle = styled.h3`
  margin-top: 10px;
  font-size: 1.1rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.45;
`

const ContinueCardCopy = styled.p`
  margin-top: 10px;
  color: var(--color-text-2);
  font-size: 0.9375rem;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CenterWrapper = styled.div`
  width: var(--post-width);
  display: flex;
  flex-direction: column;
  gap: var(--sizing-md);
  align-items: center;
`

const FaqSection = styled.section`
  width: var(--post-width);
  margin: 0 auto;
  margin-top: var(--sizing-lg);
  padding: var(--padding-lg) var(--padding-md) 0;
  scroll-margin-top: 120px;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    margin-top: var(--sizing-md);
    padding: var(--padding-md) var(--padding-sm) 0;
  }
`

const FaqSectionHeader = styled.div`
  margin-bottom: 2px;
`

const FaqHeading = styled.h2`
  margin-top: 0;
  margin-bottom: 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.3;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.25rem;
  }
`

const FaqList = styled.div`
  margin-top: 8px;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    margin-top: 2px;
  }
`

const FaqSummary = styled.summary`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 0;
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    gap: 8px;
    padding: 16px 0;
  }
`

const FaqIndex = styled.span`
  flex-shrink: 0;
  min-width: 26px;
  color: var(--color-text-3);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    min-width: 24px;
    font-size: 0.7rem;
    letter-spacing: 0.04em;
  }
`

const FaqQuestion = styled.h3`
  flex: 1;
  margin: 0;
  color: var(--color-text-2);
  font-size: 1rem;
  font-weight: var(--font-weight-semi-bold);
  line-height: 1.55;
  transition: color 0.2s ease;
`

const FaqChevron = styled.span`
  position: relative;
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: 1px;
  border-right: 1.5px solid var(--color-text-3);
  border-bottom: 1.5px solid var(--color-text-3);
  transform: rotate(45deg);
  transition: transform 0.2s ease;
`

const FaqItem = styled.details`
  border-bottom: 1px solid var(--color-divider);

  &[open] {
    ${FaqQuestion} {
      color: var(--color-text);
    }

    ${FaqChevron} {
      transform: rotate(-135deg);
    }
  }
`

const FaqAnswerWrap = styled.div`
  padding: 0 0 18px 36px;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    padding-left: 32px;
  }
`

const FaqAnswer = styled.p`
  margin: 0;
  color: var(--color-text-2);
  font-size: 0.9375rem;
  line-height: 1.75;
`

export const query = graphql`
  query BlogPostPage(
    $slug: String
    $nextSlug: String
    $prevSlug: String
    $category: String
  ) {
    current: markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      headings {
        id
        depth
        value
      }
      excerpt(format: PLAIN)
      frontmatter {
        title
        desc
        thumbnail {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, layout: FIXED)
          }
        }
        date(formatString: "YYYY-MM-DDTHH:MM:SSZ")
        category
        alt
        faqs {
          question
          answer
        }
      }
      fields {
        slug
        lastmod
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
        alt
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
        alt
      }
      fields {
        slug
      }
    }

    relatedPosts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/(posts/blog)/" }
        frontmatter: { category: { eq: $category } }
        fields: { slug: { ne: $slug } }
      }
      sort: { frontmatter: { date: DESC } }
      limit: 4
    ) {
      edges {
        node {
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

export default BlogPost
