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
import Category from "~/src/styles/category"
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
  const { title, desc, thumbnail, date, category, faq } = frontmatter!
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
  const faqItems = (faq ?? []).filter(item => item?.question && item?.answer)
  const categoryPath = `/category/${kebabCase(category ?? "")}/`

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
                <Info>
                  <PostCategory>{category}</PostCategory>
                  <Time dateTime={date!}>{date?.split("T")[0]}</Time>
                </Info>
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
                  <TableOfContents headings={headings} />
                </RightWrapper>
              </ContentWrapper>
              {faqItems.length > 0 && (
                <FaqSection aria-labelledby="faq-heading">
                  <FaqSectionHeader>
                    <FaqEyebrow>FAQ</FaqEyebrow>
                    <FaqHeading id="faq-heading">자주 묻는 질문</FaqHeading>
                    <FaqLead>
                      이 표현을 검색해서 들어온 분들이 많이 궁금해하는 내용을 한
                      번에 정리했어요.
                    </FaqLead>
                  </FaqSectionHeader>
                  <FaqList>
                    {faqItems.map(item => (
                      <FaqCard key={item?.question ?? item?.answer ?? "faq"}>
                        <FaqQuestionRow>
                          <FaqBadge>Q</FaqBadge>
                          <FaqQuestion>{item?.question}</FaqQuestion>
                        </FaqQuestionRow>
                        <FaqAnswerRow>
                          <FaqBadge $isAnswer>A</FaqBadge>
                          <FaqAnswer>{item?.answer}</FaqAnswer>
                        </FaqAnswerRow>
                      </FaqCard>
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
  width: fit-content;
  max-width: 100%;
  margin-bottom: var(--sizing-md);
  padding: 10px 16px;
  border: 1px solid var(--color-divider);
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    var(--color-card) 0%,
    var(--color-gray-1) 100%
  );
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    width: 100%;
    padding: 12px 14px;
    border-radius: var(--border-radius-md);
  }
`

const BreadcrumbList = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  list-style: none;
`

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  & + &::before {
    content: "/";
    color: var(--color-gray-5);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-bold);
  }
`

const BreadcrumbLink = styled(Link)`
  color: var(--color-text-2);
  font-size: 0.875rem;
  font-weight: var(--font-weight-semi-bold);
  transition:
    color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    color: var(--color-blue);
    transform: translateY(-1px);
  }
`

const BreadcrumbCurrent = styled.span`
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.5;
`

const ContentWrapper = styled.div`
  display: flex;
  margin: var(--sizing-md) 0;
  justify-content: center;
  gap: var(--sizing-xl);
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
  padding: var(--padding-xl);
  border: 1px solid var(--color-divider);
  border-radius: var(--border-radius-lg);
  background: radial-gradient(
      circle at top right,
      rgba(10, 132, 255, 0.12),
      transparent 30%
    ),
    linear-gradient(135deg, var(--color-card) 0%, var(--color-gray-1) 100%);
  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.08);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    padding: var(--padding-lg);
    border-radius: calc(var(--border-radius-lg) - 8px);
  }
`

const FaqSectionHeader = styled.div`
  margin-bottom: var(--sizing-md);
`

const FaqEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background-color: rgba(10, 132, 255, 0.12);
  color: var(--color-blue);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
`

const FaqHeading = styled.h2`
  margin-top: var(--sizing-sm);
  font-size: 2rem;
  font-weight: var(--font-weight-extra-bold);
  line-height: 1.2;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.75rem;
  }
`

const FaqLead = styled.p`
  margin-top: var(--sizing-sm);
  color: var(--color-text-2);
  font-size: var(--text-md);
  line-height: 1.7;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: var(--text-base);
  }
`

const FaqList = styled.div`
  display: grid;
  gap: var(--sizing-base);
`

const FaqCard = styled.article`
  padding: var(--padding-lg);
  border: 1px solid var(--color-divider);
  border-radius: var(--border-radius-md);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.32) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    padding: var(--padding-sm);
  }
`

const FaqQuestionRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`

const FaqAnswerRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-top: var(--sizing-base);
`

const FaqBadge = styled.span<{ $isAnswer?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ $isAnswer }) =>
    $isAnswer ? "var(--color-category-button)" : "var(--color-blue)"};
  color: ${({ $isAnswer }) =>
    $isAnswer ? "var(--color-blue)" : "var(--color-white)"};
  font-size: var(--text-sm);
  font-weight: var(--font-weight-extra-bold);
`

const FaqQuestion = styled.h3`
  font-size: 1.125rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.6;
`

const FaqAnswer = styled.p`
  color: var(--color-text-2);
  font-size: var(--text-base);
  line-height: 1.8;
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
        faq {
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
