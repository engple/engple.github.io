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

const DEFAULT_LANG = "en"

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
}

const SEO: React.FC<SEOProperties> = ({
  title = "",
  desc = "",
  image,
  jsonLds = [],
}) => {
  const site = useSiteMetadata()
  const description = desc || site.description
  const ogImageUrl = image || (defaultOpenGraphImage as string)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...jsonLds,
      {
        "@type": "Organization",
        "@id": `${site.siteUrl}/#organization`,
        name: "잉플 | 패턴으로 배우는 영어 공부 🍎",
        url: site.siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${site.siteUrl}${defaultOpenGraphImage}`,
        },
        sameAs: [
          // "https://www.instagram.com/engple",
        ],
      } as Organization,
      {
        "@type": "WebSite",
        "@id": `${site.siteUrl}/#website`,
        name: "잉플 | 패턴으로 배우는 영어 공부 🍎",
        alternateName: "Engple",
        url: site.siteUrl,
        description: site.description,
        inLanguage: ["ko", "en"],
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
            name: "description",
            content: description,
          },
          {
            property: "og:title",
            content: title,
          },
          {
            property: "og:description",
            content: description,
          },
          {
            property: "og:type",
            content: "website",
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
            name: "twitter:title",
            content: title,
          },
          {
            name: "twitter:description",
            content: description,
          },
          {
            property: "image",
            content: ogImageUrl,
          },
          {
            property: "og:image",
            content: ogImageUrl,
          },
          {
            property: "twitter:image",
            content: ogImageUrl,
          },
          {
            property: "google-adsense-account",
            content: "ca-pub-1465612013356152",
          },
          {
            property: "naver-site-verification",
            content: "7f4cdd0b74209a3bbf5b0c15b445fa439a8a2b9c",
          },
        ] as Meta
      }
    >
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1465612013356152"
        crossOrigin="anonymous"
      ></script>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}

export default SEO
