interface BannerConfig {
  text: string
  subtext?: string
  link: string
  caption?: string
}

export const withInlineBanner = (
  html: string,
  bannerConfig: BannerConfig,
  { idx = 0 }: { idx?: number } = {},
): string => {
  // Find the first <p> tag in the HTML
  const paragraphRegex = /(<p[^>]*>.*?<\/p>)/gi
  const match = html.match(paragraphRegex)

  if (!match) {
    return html // No paragraph found, return original HTML
  }

  const paragraph = match.at(idx)

  // Check if the paragraph already has banner data attributes
  if (!paragraph || paragraph.includes("data-inline-banner")) {
    return html // Already has banner, return original HTML
  }

  // Create the data attributes string
  const dataAttributes = [
    `data-inline-banner="${bannerConfig.text}"`,
    bannerConfig.subtext
      ? `data-inline-banner-subtext="${bannerConfig.subtext}"`
      : "",
    `data-inline-banner-link="${bannerConfig.link}"`,
    bannerConfig.caption
      ? `data-inline-banner-caption="${bannerConfig.caption}"`
      : "",
  ]
    .filter(Boolean)
    .join(" ")

  // Replace the opening <p> tag to include the data attributes
  const modifiedParagraph = paragraph.replace(
    /^<p([^>]*)>/i,
    `<p$1 ${dataAttributes}>`,
  )

  return html.replace(paragraph, modifiedParagraph)
}

export default withInlineBanner
