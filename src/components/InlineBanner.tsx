import React from "react"

const InlineBanner: React.FC = () => {
  React.useEffect(() => {
    const cleanupItems: HTMLElement[] = []

    const createBanners = () => {
      const bannerElements = document.querySelectorAll("[data-inline-banner]")

      for (const element of bannerElements) {
        const bannerText = (element as HTMLElement).dataset.inlineBanner
        const bannerSubtext = (element as HTMLElement).dataset
          .inlineBannerSubtext
        const bannerLink = (element as HTMLElement).dataset.inlineBannerLink
        const bannerCaption = (element as HTMLElement).dataset
          .inlineBannerCaption
        if (!bannerText || !bannerLink) continue

        if (!element.querySelector(".inline-banner")) {
          const banner = document.createElement("div")
          banner.className = "inline-banner"
          banner.innerHTML = `
            <a href="${bannerLink}" target="_blank" rel="noopener noreferrer nofollow">
              <div class="inline-banner-content">
                <div class="inline-banner-text-wrapper">
                  <div class="inline-banner-header">
                    <span class="inline-banner-icon">✨</span>
                    <span class="inline-banner-title">${bannerText}</span>
                  </div>
                  ${bannerSubtext ? `<span class="inline-banner-subtext">${bannerSubtext}</span>` : ""}
                </div>
                <div class="inline-banner-cta">
                  <span class="inline-banner-button">60% 할인받기 →</span>
                </div>
              </div>
            </a>
            ${bannerCaption ? `<div class="inline-banner-caption">${bannerCaption}</div>` : ""}
          `

          element.append(banner)
          cleanupItems.push(banner)
        }
      }
    }

    createBanners()

    return () => {
      for (const banner of cleanupItems) {
        banner.remove()
      }
    }
  }, [])

  return <></>
}

export default InlineBanner
