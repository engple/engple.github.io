import React from "react"

import { Link, type PageProps, graphql } from "gatsby"
import kebabCase from "lodash/kebabCase"
import {
  type Article,
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

import DetailsToggle from "../components/DetailsToggle"
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
}

const BlogPost: React.FC<PageProps<DataProps>> = ({ data }) => {
  const {
    frontmatter,
    html,
    excerpt,
    headings,
    fields: { slug, lastmod },
  } = data.current!
  const { title, desc, thumbnail, date, category, faqs } = frontmatter!
  const site = useSiteMetadata()
  const articleRef = React.useRef<HTMLElement | null>(null)
  const htmlWithInlineAd =
    site.googleAdsense && HORIZONTAL_AD_SLOT
      ? withInlineAdsense(html ?? "", {
          idx: -2,
          adClient: site.googleAdsense,
          adSlot: HORIZONTAL_AD_SLOT,
        })
      : html ?? ""

  useInteractiveList([html], { initialState: "collapsed" })
  React.useEffect(() => {
    if (!site.googleAdsense || process.env.NODE_ENV === "development") return

    const article = articleRef.current

    if (!article) return

    return initializeInlineAdsenseSlots(article, HORIZONTAL_AD_SLOT)
  }, [site.googleAdsense, slug, htmlWithInlineAd])

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

  const ogImagePath =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    thumbnail &&
    thumbnail?.childImageSharp?.gatsbyImageData!.images!.fallback!.src

  const description = desc || excerpt
  const faqItems = (faqs ?? []).filter(item => item?.question && item?.answer)
  const categoryPath = `/category/${kebabCase(category ?? "")}/`
  const tocHeadings =
    faqItems.length > 0
      ? [
          ...headings,
          { id: "faq-heading", depth: 2, value: "❓ 자주 묻는 질문" },
        ]
      : headings

  const articleJsonLd = {
    "@type": "Article",
    "@id": `${site.siteUrl}${slug}`,
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
    url: `${site.siteUrl}${slug}`,
    thumbnailUrl: `${site.siteUrl}${ogImagePath}`,
    image: `${site.siteUrl}${ogImagePath}`,
    copyrightHolder: { "@id": `${site.siteUrl}/#organization` },
    publisher: { "@id": `${site.siteUrl}/#organization` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.siteUrl}${slug}`,
    },
    wordCount: html?.split(" ").length,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article h1", "article h2", "[data-answer]"],
    },
  } as Article

  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    "@id": `${site.siteUrl}${slug}#breadcrumb`,
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
          "@id": `${site.siteUrl}${slug}`,
          name: title,
        },
      },
    ],
  } as BreadcrumbList

  const faqJsonLd = {
    "@type": "FAQPage",
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
    "@id": `${site.siteUrl}${slug}#learningresource`,
    name: title,
    description,
    educationalLevel: "beginner",
    learningResourceType: "lesson",
    inLanguage: ["ko", "en"],
    isAccessibleForFree: true,
    teaches: title,
    assesses: title,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: "Korean English learners",
    },
    provider: { "@id": `${site.siteUrl}/#organization` },
  } as LearningResource

  const jsonLds: Thing[] = [
    articleJsonLd,
    breadcrumbJsonLd,
    learningResourceJsonLd,
  ]

  if (faqItems.length > 0) {
    jsonLds.push(faqJsonLd)
  }

  return (
    <Layout>
      <SEO
        title={title}
        desc={description}
        url={`${site.siteUrl}${slug}`}
        image={ogImagePath}
        jsonLds={jsonLds}
        ogType="article"
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
              </ContentHeader>
              <Divider />
              <ContentWrapper>
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
                <CenterWrapper>
                  <Markdown
                    dangerouslySetInnerHTML={{ __html: htmlWithInlineAd }}
                    rhythm={rhythm}
                  />
                </CenterWrapper>
                <Pronunciation />
                <DetailsToggle />
                <RightWrapper>
                  <TableOfContents headings={tocHeadings} />
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
            </InnerWrapper>
          </OuterWrapper>
        </article>
        <PostNavigator prevPost={prevPost} nextPost={nextPost} />
      </main>
    </Layout>
  )
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

const LeftAd = styled.div`
  min-width: 300px;
  width: 300px;
  height: 600px;
  position: sticky;
  top: 124px;

  @media (max-width: ${({ theme }) => theme.device.lg}) {
    display: none;
  }
`

const RightWrapper = styled.div`
  min-width: 300px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: var(--sizing-lg);
  align-items: center;

  @media (max-width: ${({ theme }) => theme.device.lg}) {
    display: none;
  }
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
  query BlogPostPage($slug: String, $nextSlug: String, $prevSlug: String) {
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
