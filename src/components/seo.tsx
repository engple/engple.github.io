import React, { useContext } from "react"

import { Helmet } from "react-helmet"
import {
  type AboutPage,
  type CollectionPage,
  type EducationalOrganization,
  type Graph,
  type Person,
  type Thing,
  type WebPage,
  type WebSite,
} from "schema-dts"

import { DARK } from "~/src/constants"
import useSiteMetadata from "~/src/hooks/useSiteMetadata"
import ThemeContext from "~/src/stores/themeContext"

import defaultOpenGraphImage from "../images/og-thumbnail.png"

const DEFAULT_LANG = "en-US"
const BRAND_NAME = "잉플"
const MAX_META_DESCRIPTION_LENGTH = 80
// Actual pixel dimensions of ../images/og-thumbnail.png - only safe to
// assert og:image:width/height when that exact asset is being used, since
// per-post thumbnails render at whatever size gatsby-plugin-sharp produced.
const DEFAULT_OG_IMAGE_WIDTH = 1280
const DEFAULT_OG_IMAGE_HEIGHT = 720
const LIGHT_THEME_COLOR = "#f5f7fb"
const DARK_THEME_COLOR = "#1c1c1c"

interface SEOProperties {
  title?: Queries.Maybe<string>
  desc?: Queries.Maybe<string>
  image?: Queries.Maybe<string>
  imageAlt?: Queries.Maybe<string>
  jsonLds?: Thing[]
  url?: Queries.Maybe<string>
  ogType?: "website" | "article"
  noIndex?: boolean
  noFollow?: boolean
  pageType?: "WebPage" | "CollectionPage" | "AboutPage"
  mainEntityId?: string
  publishedTime?: Queries.Maybe<string>
  modifiedTime?: Queries.Maybe<string>
  section?: Queries.Maybe<string>
  prevUrl?: Queries.Maybe<string>
  nextUrl?: Queries.Maybe<string>
}

const SEO: React.FC<SEOProperties> = ({
  title = "",
  desc = "",
  url = "",
  image,
  imageAlt,
  jsonLds = [],
  ogType = "website",
  noIndex = false,
  noFollow = false,
  pageType = "WebPage",
  mainEntityId,
  publishedTime,
  modifiedTime,
  section,
  prevUrl,
  nextUrl,
}) => {
  const site = useSiteMetadata()
  const theme = useContext(ThemeContext)
  const siteUrl = site.siteUrl || ""
  const aboutUrl = `${siteUrl}/about/`
  const organizationId = `${aboutUrl}#organization`
  const personId = `${aboutUrl}#person`
  const author = site.author || ""
  const naverSiteVerification = site.naverSiteVerification || ""
  const hasCustomTitle = Boolean(title)
  const displayTitle = title || site.title || ""
  const pageTitle = hasCustomTitle
    ? `${displayTitle} | ${BRAND_NAME}`
    : displayTitle
  const description = desc || site.description || ""
  const metaDescription = truncateDescription(
    description,
    MAX_META_DESCRIPTION_LENGTH,
  )
  const canonicalUrl = url || undefined
  const pageUrl = canonicalUrl || siteUrl
  const isDefaultOgImage = !image
  const ogImageUrl = getAbsoluteUrl(
    image || (defaultOpenGraphImage as string),
    siteUrl,
  )
  const ogImageAlt = imageAlt || displayTitle
  const ogLocale = (site.lang ?? DEFAULT_LANG).replace("-", "_")
  const robotsContent = noIndex
    ? `noindex,${noFollow ? "nofollow" : "follow"}`
    : undefined
  const webPageJsonLd = canonicalUrl
    ? [
        createWebPageJsonLd({
          description,
          imageUrl: ogImageUrl,
          language: site.lang ?? DEFAULT_LANG,
          mainEntityId,
          pageType,
          siteUrl,
          title: displayTitle,
          url: pageUrl,
        }),
      ]
    : []
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...webPageJsonLd,
      ...jsonLds,
      {
        "@type": "EducationalOrganization",
        "@id": organizationId,
        name: "잉플",
        alternateName: "Engple",
        url: siteUrl,
        mainEntityOfPage: { "@id": `${aboutUrl}#webpage` },
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}${defaultOpenGraphImage}`,
        },
        description:
          "영어 패턴 학습으로 자연스러운 영어 실력 향상을 돕는 교육 사이트",
        sameAs: ["https://github.com/engple"],
        founder: { "@id": personId },
      } as EducationalOrganization,
      {
        "@type": "Person",
        "@id": personId,
        name: author || "solaqua",
        url: aboutUrl,
        affiliation: { "@id": organizationId },
        knowsAbout: [
          "English language learning",
          "Korean explanations for English expressions",
          "Example-based vocabulary learning",
        ],
      } as Person,
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: site.title,
        alternateName: "Engple",
        url: siteUrl,
        description: site.description,
        inLanguage: site.lang ?? DEFAULT_LANG,
        publisher: { "@id": organizationId },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      } as WebSite,
    ],
  } as Graph

  return (
    <Helmet
      htmlAttributes={{ lang: site.lang ?? DEFAULT_LANG }}
      title={pageTitle}
    >
      <meta name="description" content={metaDescription} />
      <meta name="author" content={author} />
      <meta
        name="theme-color"
        content={theme === DARK ? DARK_THEME_COLOR : LIGHT_THEME_COLOR}
      />
      <meta name="naver-site-verification" content={naverSiteVerification} />
      <meta property="og:site_name" content={BRAND_NAME} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:alt" content={ogImageAlt} />
      {isDefaultOgImage && (
        <meta
          property="og:image:width"
          content={String(DEFAULT_OG_IMAGE_WIDTH)}
        />
      )}
      {isDefaultOgImage && (
        <meta
          property="og:image:height"
          content={String(DEFAULT_OG_IMAGE_HEIGHT)}
        />
      )}
      <meta property="og:title" content={displayTitle} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url || siteUrl} />
      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && (modifiedTime || publishedTime) && (
        <meta
          property="article:modified_time"
          content={modifiedTime || publishedTime || ""}
        />
      )}
      {ogType === "article" && section && (
        <meta property="article:section" content={section} />
      )}
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={author} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:title" content={displayTitle} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {prevUrl && <link rel="prev" href={prevUrl} />}
      {nextUrl && <link rel="next" href={nextUrl} />}
      {robotsContent && <meta name="robots" content={robotsContent} />}
      {robotsContent && <meta name="googlebot" content={robotsContent} />}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}

function createWebPageJsonLd({
  description,
  imageUrl,
  language,
  mainEntityId,
  pageType,
  siteUrl,
  title,
  url,
}: {
  description: string
  imageUrl: string
  language: string
  mainEntityId?: string
  pageType: "WebPage" | "CollectionPage" | "AboutPage"
  siteUrl: string
  title: string
  url: string
}) {
  const pageJsonLd = {
    "@type": pageType,
    "@id": `${url}#webpage`,
    name: title,
    description,
    url,
    inLanguage: language,
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: { "@id": `${siteUrl}/about/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: imageUrl,
    },
    ...(mainEntityId ? { mainEntity: { "@id": mainEntityId } } : {}),
  }

  return pageJsonLd as AboutPage | CollectionPage | WebPage
}

function truncateDescription(text: string, maxLength: number) {
  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength)
  const lastBoundary = Math.max(
    truncated.lastIndexOf(" "),
    truncated.lastIndexOf(". "),
  )
  const safeCut =
    lastBoundary > maxLength * 0.6
      ? truncated.slice(0, lastBoundary)
      : truncated

  return `${safeCut.trimEnd()}...`
}

function getAbsoluteUrl(pathOrUrl: string, siteUrl: string) {
  if (!pathOrUrl) return ""

  try {
    return new URL(pathOrUrl, siteUrl).toString()
  } catch {
    return pathOrUrl
  }
}

export default SEO
