import React from "react"

import styled from "styled-components"

interface AdsenseProps {
  adClient: string
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  width?: number
  height?: number
}

const Adsense: React.FC<AdsenseProps> = ({
  adClient,
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  width = 300,
  height = 600,
}) => {
  const isDev = process.env.NODE_ENV === "development"

  React.useEffect(() => {
    if (!isDev) {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.error("Adsbygoogle error:", error)
      }
    }
  }, [isDev])

  return (
    <Container width={width} height={height}>
      {isDev ? (
        <FakeAd width={width} height={height}>
          광고영역
        </FakeAd>
      ) : (
        <ins
          style={{
            display: "block",
            width: `${width}px`,
            height: `${height}px`,
          }}
          className="adsbygoogle"
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive.toString()}
        ></ins>
      )}
    </Container>
  )
}

const Container = styled.div<{ width: number; height: number }>`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
`

const FakeAd = styled.div<{ width: number; height: number }>`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background-color: var(--color-gray-3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-6);
`

export default Adsense
