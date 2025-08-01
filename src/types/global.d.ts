declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: {
        [key: string]: string | number | boolean
      },
    ) => void
    adsbygoogle?: Record<string, unknown>[]
  }
}

export {}
