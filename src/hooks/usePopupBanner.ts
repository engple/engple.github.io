import { useEffect, useState } from "react"

interface UsePopupBannerOptions {
  /** Minimum time on page before popup can show (default: 5000ms) */
  minTimeOnPage?: number
}

const NAVIGATION_INTENT_KEY = "popup_navigation_intent"

/**
 * Custom hook for managing popup banner state with navigation intent detection
 * Shows popup after navigation to ensure it persists through page changes
 *
 * @param options Configuration options
 * @returns Object with popup state and handlers
 */
export const usePopupBanner = ({
  minTimeOnPage = 3000,
}: UsePopupBannerOptions = {}) => {
  const [showing, setShowing] = useState(false)
  const [timeRequirementMet, setTimeRequirementMet] = useState(false)

  // Check if popup should show on page load (from previous navigation intent)
  useEffect(() => {
    const shouldShowFromIntent = sessionStorage.getItem(NAVIGATION_INTENT_KEY)

    if (shouldShowFromIntent) {
      // Clear the intent flag
      sessionStorage.removeItem(NAVIGATION_INTENT_KEY)
      setShowing(true)
    }
  }, [])

  // Track minimum time on page
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeRequirementMet(true)
    }, minTimeOnPage)

    return () => clearTimeout(timer)
  }, [minTimeOnPage])

  // Navigation intent detection - store intent for next page
  useEffect(() => {
    if (!timeRequirementMet) return

    // Detect clicks on links that navigate away
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (link) {
        const href = link.getAttribute("href")
        const isExternal =
          href && (href.startsWith("http") || href.startsWith("//"))
        const isInternal =
          href && (href.startsWith("/") || href.startsWith("#"))

        // Store intent for external links or internal navigation (but not hash links)
        if (isExternal || (isInternal && !href.startsWith("#"))) {
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
    show: () => setShowing(true),
    hide: () => setShowing(false),
  }
}
