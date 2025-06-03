import React from "react"

import { type PageProps, graphql } from "gatsby"
import {
  type Article,
  type BreadcrumbList,
  type FAQPage,
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
import { withInlineBanner } from "~/src/utils/promotion"

import DetailsToggle from "../components/DetailsToggle"
import InlineBanner from "../components/InlineBanner"
import PopupBanner from "../components/PopupBanner"
import Pronunciation from "../components/Pronunciation"
import SpeakBanner from "../components/SpeakBanner"
import Adsense from "../components/adsense"
import PostNavigator from "../components/postNavigator"
import TableOfContents from "../components/tableOfContents"
import {
  HORIZONTAL_AD_SLOT,
  ONE_DAY_MS,
  POPUP_BANNER_KEY as POPUP_BANNER_EXPIRY_KEY,
  RECTANGLE_TOC_AD_SLOT,
  SPEAK_BANNER_KEY as SPEAK_BANNER_EXPIRY_KEY,
  SPEAK_INLINE_LINK,
  SPEAK_LINK,
  VERTICAL_AD_SLOT,
} from "../constants"
import { useExpiryKey } from "../hooks/useExpiryKey"
import { useInteractiveList } from "../hooks/useInteractiveList"
import { usePopupBanner } from "../hooks/usePopupBanner"

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
  const { isExpired: bannerEnabled, refresh: closeBanner } = useExpiryKey(
    SPEAK_BANNER_EXPIRY_KEY,
    {
      ttl: ONE_DAY_MS,
    },
  )

  const { shouldShowPopup, handleCloseButtonClick, handleOverlayClick } =
    usePopupBanner({
      storageKey: POPUP_BANNER_EXPIRY_KEY,
      ttl: ONE_DAY_MS,
    })

  const {
    frontmatter,
    html,
    excerpt,
    headings,
    fields: { slug, lastmod },
  } = data.current!
  const { title, desc, thumbnail, date, category, faq = [] } = frontmatter!
  const site = useSiteMetadata()

  const bannerConfig = {
    text: "AI 영어회화 1위 스픽으로 실제 대화처럼 연습하고 자신감 키우자!",
    subtext:
      "AI와 실시간 영어 대화 연습 + 개인 맞춤형 학습 + 전 세계 1,000만 명 선택",
    link: SPEAK_INLINE_LINK,
    caption: "구매시 일정 수수료를 지급받습니다.",
  }
  const processedHtml = withInlineBanner(
    withInlineBanner(html ?? "", bannerConfig, { idx: 0 }),
    bannerConfig,
    { idx: -1 },
  )

  useInteractiveList([processedHtml])

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
          name: "영어 표현",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@id": `${site.siteUrl}${slug}`,
          name: title,
        },
      },
    ],
  } as BreadcrumbList

  const faqJsonLd = {
    "@type": "FAQPage",
    mainEntity: faq
      ? faq.map(item => ({
          "@type": "Question",
          name: item?.question || "",
          acceptedAnswer: {
            "@type": "Answer",
            text: item?.answer || "",
          },
        }))
      : [],
  } as FAQPage

  const jsonLds: Thing[] = [articleJsonLd, breadcrumbJsonLd]

  if (faq) {
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
      />
      <main>
        <article>
          <OuterWrapper>
            <InnerWrapper>
              <div>
                <header>
                  <Info>
                    <PostCategory>{category}</PostCategory>
                    <Time dateTime={date!}>{date?.split("T")[0]}</Time>
                  </Info>
                  <Title>{title}</Title>
                </header>
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
                  <Markdown
                    dangerouslySetInnerHTML={{ __html: processedHtml ?? "" }}
                    rhythm={rhythm}
                  />
                  <InlineBanner />
                  <Pronunciation />
                  <DetailsToggle />
                  <RightWrapper>
                    <TocAd>
                      <Adsense
                        adClient={site.googleAdsense ?? ""}
                        adSlot={RECTANGLE_TOC_AD_SLOT}
                        adFormat="auto"
                        fullWidthResponsive={true}
                        width={"320px"}
                        height={"250px"}
                        extraClassName="lg-only-ads"
                      />
                    </TocAd>
                    <TableOfContents headings={headings} />
                  </RightWrapper>
                </ContentWrapper>
                <Adsense
                  adClient={site.googleAdsense ?? ""}
                  adSlot={HORIZONTAL_AD_SLOT}
                  adFormat="auto"
                  fullWidthResponsive={true}
                  noContainer={true}
                />
              </div>
            </InnerWrapper>
          </OuterWrapper>
        </article>
        <PostNavigator prevPost={prevPost} nextPost={nextPost} />
      </main>
      {bannerEnabled && <SpeakBanner link={SPEAK_LINK} onClose={closeBanner} />}
      {shouldShowPopup && (
        <PopupBanner
          onCloseButtonClick={handleCloseButtonClick}
          onOverlayClick={handleOverlayClick}
        />
      )}
    </Layout>
  )
}

const OuterWrapper = styled.div`
  margin-top: var(--sizing-xl);
  position: relative;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    margin-top: var(--sizing-lg);
  }
`

const InnerWrapper = styled.div`
  width: var(--post-width);
  margin: 0 auto;
  padding-bottom: var(--sizing-lg);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    width: 87.5%;
  }
`

const TocAd = styled.div`
  display: none;
  width: 300px;
  height: 250px;
  margin-bottom: var(--padding-xl);
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
  width: 100%;
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
  @media (max-width: ${({ theme }) => theme.device.lg}) {
    display: none;
  }
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
