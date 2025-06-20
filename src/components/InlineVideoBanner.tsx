import React, { useRef, useState } from "react"

import styled from "styled-components"

import { SPEAK_POPUP_LINK, SPEAK_POPUP_VIDEO_URL } from "~/src/constants"

import speakLogoWhite from "../images/speak-logo-white.png"

import MutedIcon from "./icons/MutedIcon"
import UnmutedIcon from "./icons/UnmutedIcon"

const InlineVideoBanner: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleToggleMute = () => {
    if (videoRef.current) {
      const currentMuted = !videoRef.current.muted
      videoRef.current.muted = currentMuted
      setIsMuted(currentMuted)
    }
  }

  return (
    <BannerContainer>
      <VideoWrapper>
        <video
          ref={videoRef}
          src={SPEAK_POPUP_VIDEO_URL}
          autoPlay
          loop
          playsInline
          muted
        />
        <MuteButton onClick={handleToggleMute}>
          {isMuted ? (
            <MutedIcon width={12} height={12} />
          ) : (
            <UnmutedIcon width={12} height={12} />
          )}
        </MuteButton>
      </VideoWrapper>
      <ContentWrapper>
        <Title>
          <Highlight>영어 말하기</Highlight> 어려우신가요?
        </Title>
        <CTAButton href={SPEAK_POPUP_LINK} target="_blank" rel="nofollow">
          더 알아보기
        </CTAButton>
      </ContentWrapper>
    </BannerContainer>
  )
}

const BannerContainer = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #0b0c15 0%, #1a1b2e 50%, #0b0c15 100%);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
`

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  background-color: #000;

  video {
    width: 100%;
    height: auto;
    display: block;
  }
`

const MuteButton = styled.button`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }

  svg {
    width: 12px;
    height: 12px;
    stroke: black;
  }
`

const ContentWrapper = styled.div`
  padding: var(--sizing-md);
  display: flex;
  flex-direction: column;
  gap: var(--sizing-sm);
  align-items: center;
  text-align: center;
  color: white;
`

const Title = styled.h3`
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.3;
  margin: 0;
  color: white;
`

const Highlight = styled.span`
  color: #ffd700;
`

const CTAButton = styled.a`
  background: linear-gradient(135deg, #1c49ff, #0066cc);
  color: white;
  padding: var(--sizing-sm) var(--sizing-md);
  border-radius: var(--border-radius-sm);
  font-size: 0.9rem;
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(28, 73, 255, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(28, 73, 255, 0.3);
    background: linear-gradient(135deg, #0066cc, #1c49ff);
    text-decoration: none;
  }

  &:active {
    transform: translateY(0);
  }
`

export default InlineVideoBanner
