interface BannerConfig {
  text: string
  subtext?: string
  link: string
  caption?: string
}

export const addFirstParagraphBanner = (
  html: string,
  bannerConfig: BannerConfig,
): string => {
  // Find the first <p> tag in the HTML
  const firstParagraphRegex = /(<p[^>]*>.*?<\/p>)/i
  const match = html.match(firstParagraphRegex)

  if (!match) {
    return html // No paragraph found, return original HTML
  }

  const firstParagraph = match[1]

  // Check if the paragraph already has banner data attributes
  if (firstParagraph.includes("data-inline-banner")) {
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
  const modifiedParagraph = firstParagraph.replace(
    /^<p([^>]*)>/i,
    `<p$1 ${dataAttributes}>`,
  )

  // Replace the first paragraph in the original HTML
  return html.replace(firstParagraphRegex, modifiedParagraph)
}

export default addFirstParagraphBanner
