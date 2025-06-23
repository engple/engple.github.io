import React, { useRef, useState } from "react"

import styled from "styled-components"

import { SPEAK_POPUP_LINK, SPEAK_POPUP_VIDEO_URL } from "~/src/constants"

import speakLogoWhite from "../images/speak-logo-white.png"
import { getDaysLeft, getSpeakCTA } from "../utils/promotion"

import CloseIcon from "./icons/CloseIcon"
import MutedIcon from "./icons/MutedIcon"
import UnmutedIcon from "./icons/UnmutedIcon"

interface PopupBannerProps {
  onCloseButtonClick: () => void
  onOverlayClick: () => void
  isVisible?: boolean
}

const PopupBanner: React.FC<PopupBannerProps> = ({
  onCloseButtonClick,
  onOverlayClick,
  isVisible = true,
}) => {
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleCloseButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onCloseButtonClick()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault()
      e.stopPropagation()
      onOverlayClick()
    }
  }

  const handleToggleMute = () => {
    if (videoRef.current) {
      const currentMuted = !videoRef.current.muted
      videoRef.current.muted = currentMuted
      setIsMuted(currentMuted)
    }
  }

  if (!isVisible) return

  const ctaText = getSpeakCTA()

  return (
    <PopupOverlay onClick={handleOverlayClick}>
      <PopupContainer>
        <CloseButton onClick={handleCloseButtonClick}>
          <CloseIcon width={12} height={12} />
        </CloseButton>

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
              <MutedIcon width={16} height={16} />
            ) : (
              <UnmutedIcon width={16} height={16} />
            )}
          </MuteButton>
        </VideoWrapper>
        <ContentWrapper>
          <LogoSection>
            <LogoWrapper>
              <img src={speakLogoWhite} alt="Speak Logo" />
            </LogoWrapper>
          </LogoSection>
          <MainContent>
            <Title>
              <Highlight>영어 말하기</Highlight>, 아직 어려우신가요?
            </Title>
          </MainContent>
          <ActionSection>
            <CTAButton href={SPEAK_POPUP_LINK} target="_blank" rel="nofollow">
              {ctaText}
            </CTAButton>
            <TrustSignal>전 세계 1,000만 명이 선택한 1위 앱</TrustSignal>
          </ActionSection>
        </ContentWrapper>
      </PopupContainer>
    </PopupOverlay>
  )
}

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--padding-lg);

  /* Simple fade-in animation */
  animation: fadeIn 0.2s ease-out;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    padding: 0;
    align-items: flex-end;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const PopupContainer = styled.div`
  background: linear-gradient(135deg, #0b0c15 0%, #1a1b2e 50%, #0b0c15 100%);
  border-radius: var(--border-radius-lg);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* Simple scale-in animation */
  animation: scaleIn 0.2s ease-out;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    max-width: 100%;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    max-height: 100vh;

    /* Slide up animation for mobile */
    animation: slideUp 0.2s ease-out;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.1);
  }

  svg {
    width: 12px;
    height: 12px;
    fill: var(--color-gray-7);
  }
`

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  overflow: hidden;
  background-color: #000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  video {
    width: 100%;
    height: auto;
    display: block;
  }
`

const ContentWrapper = styled.div`
  padding: 0 var(--padding-xl) var(--padding-xl);
  display: flex;
  flex-direction: column;
  gap: var(--sizing-md);
  text-align: center;
  color: white;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    padding: var(--padding-lg);
    gap: var(--sizing-md);
  }
`

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: var(--sizing-md);
`

const LogoWrapper = styled.div`
  img {
    height: 32px;
    width: auto;
    object-fit: contain;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    img {
      height: 24px;
    }
  }
`

const BadgeWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const Badge = styled.div`
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: var(--sizing-xs) var(--sizing-md);
  border-radius: var(--border-radius-lg);
  font-size: 0.9rem;
  font-weight: var(--font-weight-bold);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
`

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
`

const Title = styled.h2`
  font-size: 2.2rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin: 0;
  color: white;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.8rem;
  }
`

const ActionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--sizing-md);
  align-items: center;
`

const CTAButton = styled.a`
  background: linear-gradient(135deg, #1c49ff, #0066cc);
  color: white;
  padding: var(--sizing-md) var(--sizing-xl);
  border-radius: var(--border-radius-lg);
  font-size: 1.2rem;
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: var(--sizing-sm);
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(28, 73, 255, 0.3);
  border: 2px solid transparent;
  min-width: 280px;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(28, 73, 255, 0.4);
    background: linear-gradient(135deg, #0066cc, #1c49ff);
    border-color: rgba(255, 255, 255, 0.2);
    text-decoration: none;
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.1rem;
    padding: var(--sizing-md) var(--sizing-lg);
    min-width: 250px;
  }
`

const Highlight = styled.span`
  color: #ffd700;
`

const TrustSignal = styled.div`
  font-size: 1rem;
  opacity: 0.7;
  margin-top: var(--sizing-sm);
  color: #ffffff;
  font-weight: 400;
`

const MuteButton = styled.button`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  svg {
    width: 16px;
    height: 16px;
    stroke: black;
  }
`

export default PopupBanner
