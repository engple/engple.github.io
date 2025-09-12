import { SPEAK_EVENT_END_DATE } from "~/src/constants"

interface BannerConfig {
  text: string
  subtext?: string
  link: string
  caption?: string
  cta?: string
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
    `data-inline-banner-cta="${bannerConfig.cta}"`,
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

export const getDaysLeft = (
  endDate: Date | undefined | null,
): number | undefined => {
  if (!endDate) return undefined

  const now = new Date()
  const diff = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  )
  return diff >= 0 ? diff : undefined
}

export const getSpeakCTA = ({
  useDaysLeft = true,
}: {
  useDaysLeft?: boolean
} = {}) => {
  const daysLeft = useDaysLeft ? getDaysLeft(SPEAK_EVENT_END_DATE) : undefined
  if (daysLeft === undefined || daysLeft < 0) {
    return "더 알아보기"
  } else if (!useDaysLeft) {
    return "70% 할인받기"
  } else if (daysLeft === 0) {
    return "70% 할인 오늘 마감"
  } else {
    return `70% 할인 챙기기 (D-${daysLeft})`
  }
}
