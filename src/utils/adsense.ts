interface InlineAdsenseConfig {
  idx?: number
  adClient: string
  adSlot: string
}

const INLINE_ADSENSE_SELECTOR = ".inline-adsense"
const INLINE_ADSENSE_SLOT_ATTR = "data-inline-ad-slot"
const AD_INITIALIZED_ATTR = "data-ad-initialized"
const MAX_INIT_ATTEMPTS = 120

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

const initializeInlineAdsenseSlot = (
  slot: HTMLElement,
  rafIds: number[],
  previousWidth = 0,
  stableFrames = 0,
  attempts = 0,
) => {
  if (slot.getAttribute(AD_INITIALIZED_ATTR) === "true") {
    return
  }

  const adElement = slot.querySelector<HTMLElement>("ins.adsbygoogle")

  if (!adElement) {
    return
  }

  const currentWidth = slot.getBoundingClientRect().width
  const nextStableFrames =
    currentWidth > 0 && Math.abs(currentWidth - previousWidth) <= 1
      ? stableFrames + 1
      : 0

  if (nextStableFrames >= 1) {
    slot.setAttribute(AD_INITIALIZED_ATTR, "true")

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (error) {
      console.error("Adsbygoogle error:", error)
    }

    return
  }

  if (attempts >= MAX_INIT_ATTEMPTS) {
    return
  }

  const rafId = window.requestAnimationFrame(() => {
    initializeInlineAdsenseSlot(
      slot,
      rafIds,
      currentWidth,
      nextStableFrames,
      attempts + 1,
    )
  })

  rafIds.push(rafId)
}

export const initializeInlineAdsenseSlots = (
  root: ParentNode,
  adSlot: string,
) => {
  if (process.env.NODE_ENV === "development") {
    return () => {}
  }

  const rafIds: number[] = []
  const inlineSlots = getInlineAdsenseSlots(root, adSlot)

  for (const slot of inlineSlots) {
    initializeInlineAdsenseSlot(slot, rafIds)
  }

  return () => {
    for (const rafId of rafIds) {
      cancelAnimationFrame(rafId)
    }
  }
}
