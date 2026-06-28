import React from "react"

import { Helmet } from "react-helmet"
import {
  type CollectionPage,
  type EducationalOrganization,
  type Graph,
  type Thing,
  type WebPage,
  type WebSite,
} from "schema-dts"

import useSiteMetadata from "~/src/hooks/useSiteMetadata"

import defaultOpenGraphImage from "../images/og-thumbnail.png"

const DEFAULT_LANG = "en-US"

interface SEOProperties {
  title?: Queries.Maybe<string>
  desc?: Queries.Maybe<string>
  image?: Queries.Maybe<string>
  jsonLds?: Thing[]
  url?: Queries.Maybe<string>
  ogType?: "website" | "article"
  noIndex?: boolean
  noFollow?: boolean
  pageType?: "WebPage" | "CollectionPage"
  mainEntityId?: string
}

const SEO: React.FC<SEOProperties> = ({
  title = "",
  desc = "",
  url = "",
  image,
  jsonLds = [],
  ogType = "website",
  noIndex = false,
  noFollow = false,
  pageType = "WebPage",
  mainEntityId,
}) => {
  const site = useSiteMetadata()
  const siteUrl = site.siteUrl || ""
  const author = site.author || ""
  const naverSiteVerification = site.naverSiteVerification || ""
  const displayTitle = title || site.title || ""
  const description = desc || site.description || ""
  const canonicalUrl = url || undefined
  const pageUrl = canonicalUrl || siteUrl
  const ogImageUrl = getAbsoluteUrl(
    image || (defaultOpenGraphImage as string),
    siteUrl,
  )
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
        "@id": `${siteUrl}/#organization`,
        name: "잉플",
        alternateName: "Engple",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}${defaultOpenGraphImage}`,
        },
        description:
          "영어 패턴 학습으로 자연스러운 영어 실력 향상을 돕는 교육 사이트",
        sameAs: ["https://github.com/engple"],
      } as EducationalOrganization,
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: site.title,
        alternateName: "Engple",
        url: siteUrl,
        description: site.description,
        inLanguage: site.lang ?? DEFAULT_LANG,
        publisher: { "@id": `${siteUrl}/#organization` },
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
      title={displayTitle}
      titleTemplate={displayTitle.replace(" 🍎", "")}
    >
      <meta property="image" content={ogImageUrl} />
      <meta name="description" content={description.slice(0, 160)} />
      <meta name="naver-site-verification" content={naverSiteVerification} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url || siteUrl} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={author} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:title" content={displayTitle} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
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
  pageType: "WebPage" | "CollectionPage"
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
    publisher: { "@id": `${siteUrl}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: imageUrl,
    },
    ...(mainEntityId ? { mainEntity: { "@id": mainEntityId } } : {}),
  }

  return pageJsonLd as CollectionPage | WebPage
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
