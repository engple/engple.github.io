import { useState } from "react"

import { useExpiryKey } from "./useExpiryKey"

interface UsePopupBannerOptions {
  /** Storage key for the popup banner */
  storageKey: string
  /** Time to live in milliseconds */
  ttl: number
}

/**
 * Custom hook for managing popup banner state with differentiated close behavior
 *
 * @param options Configuration options
 * @returns Object with popup state and handlers
 */
export const usePopupBanner = ({ storageKey, ttl }: UsePopupBannerOptions) => {
  const { isExpired: popupBannerEnabled, refresh: closePopupBanner } =
    useExpiryKey(storageKey, { ttl })

  const [bannerShowing, setBannerShowing] = useState(popupBannerEnabled)

  const shouldShowPopup = popupBannerEnabled && bannerShowing

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
