import React from "react"

interface UseInlineAdsenseOptions {
  idx?: number
  adSlot?: string
  adClient?: string
  disabled?: boolean
}

export const useInlineAdsense = (options: UseInlineAdsenseOptions = {}) => {
  const { idx = 0, adSlot = "", adClient = "", disabled = false } = options

  React.useEffect(() => {
    if (disabled || !adClient || !adSlot) return

    const cleanupItems: HTMLElement[] = []
    const isDev = process.env.NODE_ENV === "development"

    const injectAdsense = () => {
      const paragraphs = [...document.querySelectorAll("article p")].filter(
        p => p.textContent?.trim() !== "",
      )

      const targetParagraph = paragraphs.at(idx)

      if (!targetParagraph) return

      const nextSibling = targetParagraph.nextElementSibling
      if (nextSibling?.classList.contains("inline-adsense")) {
        return
      }

      const adsenseContainer = document.createElement("div")
      adsenseContainer.className = "inline-adsense"

      if (isDev) {
        adsenseContainer.innerHTML = `
          <div style="
            width: 100%;
            height: 90px;
            background-color: var(--color-gray-3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-gray-6);
            margin: var(--sizing-md) 0;
            border-radius: 4px;
          ">
            광고영역 (Inline)
          </div>
        `
      } else {
        adsenseContainer.innerHTML = `
            <ins
              class="adsbygoogle"
              style="display: block;"
              data-ad-client="${adClient}"
              data-ad-slot="${adSlot}"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
        `

        setTimeout(() => {
          try {
            ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          } catch (error) {
            console.error("Adsbygoogle error:", error)
          }
        }, 100)
      }

      targetParagraph.parentNode?.insertBefore(
        adsenseContainer,
        targetParagraph.nextSibling,
      )

      cleanupItems.push(adsenseContainer)
    }

    const timer = setTimeout(injectAdsense, 100)

    return () => {
      clearTimeout(timer)
      for (const container of cleanupItems) {
        if (container.parentNode) {
          container.remove()
        }
      }
    }
  }, [idx, adSlot, adClient, disabled])
}
