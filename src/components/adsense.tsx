import React from "react"

import styled from "styled-components"

interface AdsenseProps {
  adClient: string
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  width?: string
  height?: string
  extraClassName?: string
  delay?: number
}

const Adsense: React.FC<AdsenseProps> = ({
  adClient,
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  width = "100%",
  height = "100%",
  extraClassName,
  delay = 0,
}) => {
  const isDev = process.env.NODE_ENV === "development"

  React.useEffect(() => {
    if (!isDev) {
      setTimeout(() => {
        try {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (error) {
          console.error("Adsbygoogle error:", error)
        }
      }, delay)
    }
  }, [isDev])

  return (
    <Container width={width} height={height} className={extraClassName}>
      {isDev ? (
        <FakeAd width={width} height={height}>
          광고영역
        </FakeAd>
      ) : (
        <ins
          style={{
            display: "block",
          }}
          className={`adsbygoogle ${extraClassName || ""}`}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive.toString()}
        ></ins>
      )}
    </Container>
  )
}

const Container = styled.div<{ width: string; height: string }>`
  width: ${props => props.width};
  height: ${props => props.height};
  display: flex;
  justify-content: center;
`

const FakeAd = styled.div<{ width: string; height: string }>`
  width: ${props => props.width};
  height: ${props => props.height};
  background-color: var(--color-gray-3);
  display: flex !important;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-6);
`

export default Adsense
