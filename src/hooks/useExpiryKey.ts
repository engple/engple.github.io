import { useCallback, useEffect, useState } from "react"

interface UseExpiryKeyOptions {
  /** Time to live in milliseconds */
  ttl: number
}

/**
 * Hook for managing expiring keys with localStorage
 */
export const useExpiryKey = (key: string, { ttl }: UseExpiryKeyOptions) => {
  const [isExpired, setIsKeyExpired] = useState<boolean>(true)

  const refresh = useCallback(() => {
    localStorage.setItem(getStorageKey(key), Date.now().toString())
    setIsKeyExpired(false)
  }, [key])

  const updateExpiry = useCallback(() => {
    const timestamp = getTimestamp(key)
    const expired = !timestamp || Date.now() - timestamp > ttl

    if (expired !== isExpired) {
      setIsKeyExpired(expired)
    }
  }, [key, ttl, isExpired])

  useEffect(() => {
    updateExpiry()

    const interval = setInterval(() => {
      updateExpiry()
    }, 1000)

    return () => clearInterval(interval)
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
  const value = localStorage.getItem(getStorageKey(key))
  return value ? Number.parseInt(value, 10) : undefined
}
