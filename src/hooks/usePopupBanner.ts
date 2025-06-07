import { useEffect, useState } from "react"

import { useExpiryKey } from "./useExpiryKey"

interface UsePopupBannerOptions {
  /** Storage key for the popup banner */
  storageKey: string
  /** Time to live in milliseconds */
  ttl: number
  /** Delay before showing popup in milliseconds (default: 3000ms) */
  showDelay?: number
}

/**
 * Custom hook for managing popup banner state with differentiated close behavior
 *
 * @param options Configuration options
 * @returns Object with popup state and handlers
 */
export const usePopupBanner = ({
  storageKey,
  ttl,
  showDelay = 3000,
}: UsePopupBannerOptions) => {
  const { isExpired: popupBannerEnabled, refresh: closePopupBanner } =
    useExpiryKey(storageKey, { ttl })

  const [bannerShowing, setBannerShowing] = useState(false)
  const [delayPassed, setDelayPassed] = useState(false)

  // Add delay before showing popup
  useEffect(() => {
    if (popupBannerEnabled) {
      const timer = setTimeout(() => {
        setDelayPassed(true)
        setBannerShowing(true)
      }, showDelay)

      return () => clearTimeout(timer)
    }
  }, [popupBannerEnabled, showDelay])

  const shouldShowPopup = popupBannerEnabled && bannerShowing && delayPassed

  const handleCloseButtonClick = () => {
    // Intentional close: hide immediately and set localStorage
    setBannerShowing(false)
    closePopupBanner()
  }

  const handleOverlayClick = () => {
    // Accidental close: only hide temporarily, will reshow on revisit
    setBannerShowing(false)
  }

  return {
    shouldShowPopup,
    handleCloseButtonClick,
    handleOverlayClick,
  }
}
