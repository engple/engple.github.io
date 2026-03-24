interface InlineAdsenseConfig {
  idx?: number
  adClient: string
  adSlot: string
}

const INLINE_ADSENSE_SELECTOR = ".inline-adsense"
const INLINE_ADSENSE_SLOT_ATTR = "data-inline-ad-slot"
const ADSENSE_ELEMENT_SELECTOR = "ins.adsbygoogle"
const AD_INITIALIZED_ATTR = "data-ad-initialized"

export const withInlineAdsense = (
  html: string,
  { idx = 0, adClient, adSlot }: InlineAdsenseConfig,
): string => {
  if (
    !html ||
    !adClient ||
    !adSlot ||
    html.includes('class="inline-adsense"')
  ) {
    return html
  }

  const paragraphRegex = /<p\b[^>]*>[\S\s]*?<\/p>/gi
  const paragraphs = [...html.matchAll(paragraphRegex)]
    .map(match => ({
      index: match.index ?? -1,
      paragraph: match[0],
      text: match[0]
        .replaceAll(/<[^>]+>/g, "")
        .replaceAll(/&nbsp;/gi, " ")
        .trim(),
    }))
    .filter(match => match.index >= 0 && match.text !== "")

  const targetParagraph = paragraphs.at(idx)

  if (!targetParagraph) {
    return html
  }

  const adMarkup =
    process.env.NODE_ENV === "development"
      ? `
<div class="inline-adsense" data-inline-ad-slot="${adSlot}">
  <div class="inline-adsense__dev-placeholder">광고영역 (Inline)</div>
</div>`
      : `
<div class="inline-adsense" data-inline-ad-slot="${adSlot}">
  <ins
    class="adsbygoogle"
    style="display: block;"
    data-ad-client="${adClient}"
    data-ad-slot="${adSlot}"
    data-ad-format="auto"
    data-full-width-responsive="true"
  ></ins>
</div>`

  const insertionPoint =
    targetParagraph.index + targetParagraph.paragraph.length

  return html.slice(0, insertionPoint) + adMarkup + html.slice(insertionPoint)
}

const getInlineAdsenseSlots = (root: ParentNode, adSlot: string) =>
  [...root.querySelectorAll<HTMLElement>(INLINE_ADSENSE_SELECTOR)].filter(
    slot => slot.getAttribute(INLINE_ADSENSE_SLOT_ATTR) === adSlot,
  )

export const initializeAdsenseSlotWhenReady = (slot: HTMLElement) => {
  const adElement = slot.querySelector<HTMLModElement>(ADSENSE_ELEMENT_SELECTOR)

  if (!adElement) {
    return () => {}
  }

  let frameId = 0
  let resizeObserver: ResizeObserver | undefined

  const initializeSlot = () => {
    if (slot.getAttribute(AD_INITIALIZED_ATTR) === "true") {
      return
    }

    if (adElement.dataset.adsbygoogleStatus) {
      slot.setAttribute(AD_INITIALIZED_ATTR, "true")
      return
    }

    if (slot.getBoundingClientRect().width <= 0) {
      return
    }

    slot.setAttribute(AD_INITIALIZED_ATTR, "true")

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (error) {
      slot.removeAttribute(AD_INITIALIZED_ATTR)
      console.error("Adsbygoogle error:", error)
    }
  }

  const scheduleInitialize = () => {
    if (frameId) {
      cancelAnimationFrame(frameId)
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = 0
      initializeSlot()
    })
  }

  scheduleInitialize()

  if (typeof ResizeObserver === "undefined") {
    window.addEventListener("resize", scheduleInitialize)
  } else {
    resizeObserver = new ResizeObserver(() => {
      scheduleInitialize()
    })
    resizeObserver.observe(slot)
  }

  return () => {
    if (frameId) {
      cancelAnimationFrame(frameId)
    }

    resizeObserver?.disconnect()
    window.removeEventListener("resize", scheduleInitialize)
  }
}

export const initializeInlineAdsenseSlots = (
  root: ParentNode,
  adSlot: string,
) => {
  if (process.env.NODE_ENV === "development") {
    return () => {}
  }

  const inlineSlots = getInlineAdsenseSlots(root, adSlot)
  const cleanups = inlineSlots.map(slot => initializeAdsenseSlotWhenReady(slot))

  return () => {
    for (const cleanup of cleanups) {
      cleanup()
    }
  }
}
