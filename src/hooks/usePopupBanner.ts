import { useCallback, useEffect, useState } from "react"

interface UsePopupBannerOptions {
  /** Minimum time on page before popup can show (default: 5000ms) */
  minTimeOnPage?: number
  /** Cooldown period between popup shows in minutes (default: 30) */
  cooldownMinutes?: number
}

const NAVIGATION_INTENT_KEY = "popup_navigation_intent"
const LAST_POPUP_SHOWN_KEY = "popup_last_shown"

/**
 * Custom hook for managing popup banner state with navigation intent detection
 * Shows popup after navigation to ensure it persists through page changes
 *
 * @param options Configuration options
 * @returns Object with popup state and handlers
 */
export const usePopupBanner = ({
  minTimeOnPage = 2000,
  cooldownMinutes = 1,
}: UsePopupBannerOptions = {}) => {
  const [showing, setShowing] = useState(false)
  const [timeRequirementMet, setTimeRequirementMet] = useState(false)

  const isInCooldown = useCallback(() => {
    const lastShown = sessionStorage.getItem(LAST_POPUP_SHOWN_KEY)
    if (!lastShown) return false

    const timeSinceLastShown = Date.now() - Number.parseInt(lastShown)
    return timeSinceLastShown < cooldownMinutes * 60 * 1000
  }, [cooldownMinutes])

  // Check if popup should show on page load (from previous navigation intent)
  useEffect(() => {
    const shouldShowFromIntent = sessionStorage.getItem(NAVIGATION_INTENT_KEY)

    if (shouldShowFromIntent && !isInCooldown()) {
      // Clear the intent flag
      sessionStorage.removeItem(NAVIGATION_INTENT_KEY)
      setShowing(true)
      sessionStorage.setItem(LAST_POPUP_SHOWN_KEY, Date.now().toString())
    }
  }, [cooldownMinutes, isInCooldown])

  // Track minimum time on page
  useEffect(() => {
    if (timeRequirementMet) return

    const timer = setTimeout(() => {
      setTimeRequirementMet(true)
    }, minTimeOnPage)

    return () => clearTimeout(timer)
  }, [minTimeOnPage, timeRequirementMet])

  // Navigation intent detection - store intent for next page
  useEffect(() => {
    if (!timeRequirementMet) return

    // Detect clicks on links that navigate away
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (link) {
        const href = link.getAttribute("href")
        if (!href) return

        const isExternal =
          href.startsWith("http") ||
          href.startsWith("//") ||
          (href.includes("://") && !href.includes(window.location.hostname))

        const isInternal =
          href.startsWith("/") ||
          href.startsWith("./") ||
          href.startsWith("../") ||
          href.includes(window.location.hostname)

        const isHashLink = href.startsWith("#")
        const isMailto = href.startsWith("mailto:")
        const isTel = href.startsWith("tel:")

        // Store intent for external links or internal navigation (but not hash links, mailto, or tel)
        if (
          (isExternal || (isInternal && !isHashLink)) &&
          !isMailto &&
          !isTel
        ) {
          sessionStorage.setItem(NAVIGATION_INTENT_KEY, "true")
        }
      }
    }

    // Detect browser navigation (back/forward buttons, address bar)
    const handleBeforeUnload = () => {
      sessionStorage.setItem(NAVIGATION_INTENT_KEY, "true")
    }

    // Detect page visibility change (tab switching, minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sessionStorage.setItem(NAVIGATION_INTENT_KEY, "true")
      } else {
        const shouldShowFromIntent =
          sessionStorage.getItem(NAVIGATION_INTENT_KEY) === "true"

        if (shouldShowFromIntent && timeRequirementMet && !isInCooldown()) {
          sessionStorage.removeItem(NAVIGATION_INTENT_KEY)
          setShowing(true)
          sessionStorage.setItem(LAST_POPUP_SHOWN_KEY, Date.now().toString())
        }
      }
    }

    document.addEventListener("click", handleLinkClick, true)
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("click", handleLinkClick, true)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [timeRequirementMet])

  return {
    showing,
    show: () => {
      setShowing(true)
      sessionStorage.setItem(LAST_POPUP_SHOWN_KEY, Date.now().toString())
    },
    hide: () => setShowing(false),
  }
}
