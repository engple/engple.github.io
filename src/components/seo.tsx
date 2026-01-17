import React from "react"

import { Helmet } from "react-helmet"
import {
  type Graph,
  type Organization,
  type Thing,
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
}

const SEO: React.FC<SEOProperties> = ({
  title = "",
  desc = "",
  url = "",
  image,
  jsonLds = [],
  ogType = "website",
}) => {
  const site = useSiteMetadata()
  const description = desc || site.description || ""
  const ogImageUrl = image || (defaultOpenGraphImage as string)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...jsonLds,
      {
        "@type": "Organization",
        "@id": `${site.siteUrl}/#organization`,
        name: site.title,
        url: site.siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${site.siteUrl}${defaultOpenGraphImage}`,
        },
        sameAs: [
          // "https://www.instagram.com/username",
        ],
      } as Organization,
      {
        "@type": "WebSite",
        "@id": `${site.siteUrl}/#website`,
        name: site.title,
        alternateName: site.title,
        url: site.siteUrl,
        description: site.description,
        inLanguage: site.lang ?? DEFAULT_LANG,
      } as WebSite,
    ],
  } as Graph

  return (
    <Helmet
      htmlAttributes={{ lang: site.lang ?? DEFAULT_LANG }}
      title={title || site.title!}
      titleTemplate={title || site.title!.replace(" 🍎", "")}
      meta={
        [
          {
            property: "google-adsense-account",
            content: site.googleAdsense,
          },
          {
            property: "image",
            content: ogImageUrl,
          },
          {
            name: "description",
            content: description?.slice(0, 160),
          },
          {
            property: "naver-site-verification",
            content: site.naverSiteVerification,
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
            content: title,
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
            content: "summary",
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
            content: title,
          },
        ] as Meta
      }
    >
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.googleAdsense}`}
        crossOrigin="anonymous"
      ></script>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}

export default SEO
