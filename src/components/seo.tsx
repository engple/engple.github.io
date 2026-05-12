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

type Meta = React.DetailedHTMLProps<
  React.MetaHTMLAttributes<HTMLMetaElement>,
  HTMLMetaElement
>[]

interface SEOProperties {
  title?: Queries.Maybe<string>
  desc?: Queries.Maybe<string>
  image?: Queries.Maybe<string>
  meta?: Meta
  jsonLds?: Thing[]
  url?: Queries.Maybe<string>
  ogType?: "website" | "article"
  noIndex?: boolean
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
  pageType = "WebPage",
  mainEntityId,
}) => {
  const site = useSiteMetadata()
  const displayTitle = title || site.title || ""
  const description = desc || site.description || ""
  const canonicalUrl = url || undefined
  const pageUrl = canonicalUrl || site.siteUrl || ""
  const ogImageUrl = getAbsoluteUrl(
    image || (defaultOpenGraphImage as string),
    site.siteUrl || "",
  )
  const webPageJsonLd = canonicalUrl
    ? [
        createWebPageJsonLd({
          description,
          imageUrl: ogImageUrl,
          language: site.lang ?? DEFAULT_LANG,
          mainEntityId,
          pageType,
          siteUrl: site.siteUrl || "",
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
        "@id": `${site.siteUrl}/#organization`,
        name: "잉플",
        alternateName: "Engple",
        url: site.siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${site.siteUrl}${defaultOpenGraphImage}`,
        },
        description:
          "영어 패턴 학습으로 자연스러운 영어 실력 향상을 돕는 교육 사이트",
        sameAs: ["https://github.com/engple"],
      } as EducationalOrganization,
      {
        "@type": "WebSite",
        "@id": `${site.siteUrl}/#website`,
        name: site.title,
        alternateName: "Engple",
        url: site.siteUrl,
        description: site.description,
        inLanguage: site.lang ?? DEFAULT_LANG,
        publisher: { "@id": `${site.siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${site.siteUrl}/search?q={search_term_string}`,
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
      meta={
        [
          {
            property: "image",
            content: ogImageUrl,
          },
          {
            name: "description",
            content: description?.slice(0, 160),
          },
          {
            name: "naver-site-verification",
            content: site.naverSiteVerification,
          },
          {
            property: "og:locale",
            content: (site.lang ?? DEFAULT_LANG).replace("-", "_"),
          },
          {
            property: "og:description",
            content: description,
          },
          {
            property: "og:image",
            content: ogImageUrl,
          },
          {
            property: "og:title",
            content: displayTitle,
          },
          {
            property: "og:site_name",
            content: site.title,
          },
          {
            property: "og:type",
            content: ogType,
          },
          {
            property: "og:url",
            content: url || site.siteUrl,
          },
          {
            property: "twitter:image",
            content: ogImageUrl,
          },
          {
            name: "twitter:card",
            content: "summary_large_image",
          },
          {
            name: "twitter:creator",
            content: site.author,
          },
          {
            name: "twitter:description",
            content: description,
          },
          {
            name: "twitter:title",
            content: displayTitle,
          },
        ] as Meta
      }
    >
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex,follow" />}
      {noIndex && <meta name="googlebot" content="noindex,follow" />}
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
