import { useCallback, useEffect, useRef, useState } from "react"

interface UseExpiryKeyOptions {
  /** Time to live in milliseconds */
  ttl: number
}

/**
 * Hook for managing expiring keys with localStorage
 */
export const useExpiryKey = (key: string, { ttl }: UseExpiryKeyOptions) => {
  const [isExpired, setIsKeyExpired] = useState<boolean>(true)
  const timeoutReference = useRef<number>()

  const updateExpiry = useCallback(() => {
    if (timeoutReference.current !== undefined) {
      window.clearTimeout(timeoutReference.current)
      timeoutReference.current = undefined
    }

    const timestamp = getTimestamp(key)
    const expired = !timestamp || Date.now() - timestamp >= ttl
    setIsKeyExpired(expired)

    if (!expired && timestamp) {
      const delay = Math.max(timestamp + ttl - Date.now() + 1, 1)
      timeoutReference.current = window.setTimeout(updateExpiry, delay)
    }
  }, [key, ttl])

  const refresh = useCallback(() => {
    try {
      window.localStorage.setItem(getStorageKey(key), Date.now().toString())
    } catch {
      // Storage may be unavailable; the current session can still dismiss it.
    }

    updateExpiry()
  }, [key, updateExpiry])

  useEffect(() => {
    updateExpiry()

    const syncWhenVisible = () => {
      if (document.visibilityState === "visible") updateExpiry()
    }

    document.addEventListener("visibilitychange", syncWhenVisible)
    window.addEventListener("focus", syncWhenVisible)

    return () => {
      document.removeEventListener("visibilitychange", syncWhenVisible)
      window.removeEventListener("focus", syncWhenVisible)

      if (timeoutReference.current !== undefined) {
        window.clearTimeout(timeoutReference.current)
      }
    }
  }, [updateExpiry])

  return {
    isExpired,
    refresh,
  }
}

function getStorageKey(key: string) {
  return `expiry_${key}`
}

function getTimestamp(key: string): number | undefined {
  try {
    const value = window.localStorage.getItem(getStorageKey(key))
    const timestamp = value ? Number.parseInt(value, 10) : Number.NaN

    return Number.isFinite(timestamp) ? timestamp : undefined
  } catch {
    return undefined
  }
}
