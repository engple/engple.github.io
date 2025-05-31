import React, { useEffect, useState } from "react"

import styled, { keyframes } from "styled-components"

import { SPEAK_EVENT_END_DATE } from "~/src/constants"

import speakLogoWhite from "../images/speak-logo-white.png"

interface PopupBannerProps {
  link: string
  onCloseButtonClick: () => void
  onOverlayClick: () => void
  isVisible?: boolean
}

const PopupBanner: React.FC<PopupBannerProps> = ({
  link,
  onCloseButtonClick,
  onOverlayClick,
  isVisible = true,
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(isVisible)

  const today = new Date()
  const eventDay = SPEAK_EVENT_END_DATE
  const daysLeft = Math.max(
    0,
    Math.floor((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  )

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // Small delay to trigger animation
      setTimeout(() => setIsAnimating(true), 50)
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before unmounting
      setTimeout(() => setShouldRender(false), 300)
    }
  }, [isVisible])

  const handleCloseButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAnimating(false)
    setTimeout(() => {
      onCloseButtonClick()
    }, 300)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault()
      e.stopPropagation()
      setIsAnimating(false)
      setTimeout(() => {
        onOverlayClick()
      }, 300)
    }
  }

  if (!shouldRender) return

  return (
    <PopupOverlay isAnimating={isAnimating} onClick={handleOverlayClick}>
      <PopupContainer isAnimating={isAnimating}>
        <CloseButton onClick={handleCloseButtonClick}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.6894 0.321198C13.2753 -0.0929086 12.6064 -0.0929086 12.1923 0.321198L7 5.50284L1.80774 0.31058C1.39363 -0.103527 0.724687 -0.103527 0.31058 0.31058C-0.103527 0.724687 -0.103527 1.39363 0.31058 1.80774L5.50284 7L0.31058 12.1923C-0.103527 12.6064 -0.103527 13.2753 0.31058 13.6894C0.724687 14.1035 1.39363 14.1035 1.80774 13.6894L7 8.49716L12.1923 13.6894C12.6064 14.1035 13.2753 14.1035 13.6894 13.6894C14.1035 13.2753 14.1035 12.6064 13.6894 12.1923L8.49716 7L13.6894 1.80774C14.0929 1.40425 14.0929 0.724687 13.6894 0.321198Z"
              fill="currentColor"
            />
          </svg>
        </CloseButton>

        <ContentWrapper>
          <LogoSection>
            <LogoWrapper>
              <img src={speakLogoWhite} alt="Speak Logo" />
            </LogoWrapper>
            <BadgeWrapper>
              <Badge>
                {daysLeft >= 0 &&
                  (daysLeft === 0 ? "오늘 마감!" : `D-${daysLeft}`)}
              </Badge>
            </BadgeWrapper>
          </LogoSection>

          <MainContent>
            <Title>
              <Highlight>스픽 100일 갓생 챌린지</Highlight>
            </Title>
            <Subtitle>
              <Highlight>66% 할인</Highlight>된 가격으로 영어공부하고 굿즈도
              받자!
            </Subtitle>
            <Features>
              <Feature>✨ 500일 분량 2,000개 코스</Feature>
              <Feature>📱 매일 카톡 알림</Feature>
              <Feature>🎁 스픽 굿즈 패키지</Feature>
            </Features>
          </MainContent>

          <ActionSection>
            <CTAButton href={link} target="_blank" rel="nofollow">
              지금 최저가로 구매하기
              <ButtonArrow>→</ButtonArrow>
            </CTAButton>
          </ActionSection>
        </ContentWrapper>
      </PopupContainer>
    </PopupOverlay>
  )
}

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const slideDown = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`

const PopupOverlay = styled.div<{ isAnimating: boolean }>`
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

  opacity: ${({ isAnimating }) => (isAnimating ? 1 : 0)};
  transition: opacity 0.3s ease;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    padding: 0;
    align-items: flex-end;
  }
`

const PopupContainer = styled.div<{ isAnimating: boolean }>`
  background: linear-gradient(135deg, #0b0c15 0%, #1a1b2e 50%, #0b0c15 100%);
  border-radius: var(--border-radius-lg);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);

  transform: ${({ isAnimating }) => (isAnimating ? "scale(1)" : "scale(0.8)")};
  opacity: ${({ isAnimating }) => (isAnimating ? 1 : 0)};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    max-width: 100%;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    max-height: 80vh;

    transform: ${({ isAnimating }) =>
      isAnimating ? "translateY(0)" : "translateY(100%)"};
    animation: ${({ isAnimating }) => (isAnimating ? slideUp : "none")} 0.3s
      cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (min-width: ${({ theme }) => theme.device.sm}) {
    animation: ${({ isAnimating }) => (isAnimating ? slideDown : "none")} 0.3s
      cubic-bezier(0.4, 0, 0.2, 1);
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: var(--padding-lg);
  right: var(--padding-lg);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const ContentWrapper = styled.div`
  padding: var(--padding-xl);
  display: flex;
  flex-direction: column;
  gap: var(--sizing-lg);
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
  gap: var(--sizing-md);
`

const LogoWrapper = styled.div`
  img {
    height: 40px;
    width: auto;
    object-fit: contain;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    img {
      height: 32px;
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
  animation: ${keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  `} 2s ease-in-out infinite;
`

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--sizing-md);
`

const Title = styled.h2`
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin: 0;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.5rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
  opacity: 1;
  color: white;
  word-break: keep-all;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1rem;
    word-break: break-word;
  }
`

const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--sizing-sm);
  margin: var(--sizing-md) 0;
`

const Feature = styled.div`
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sizing-sm);
  opacity: 0.9;
  color: white;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 0.9rem;
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
  font-size: 1.1rem;
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
    font-size: 1rem;
    padding: var(--sizing-md) var(--sizing-lg);
    min-width: 250px;
  }
`

const ButtonArrow = styled.span`
  transition: transform 0.3s ease;

  ${CTAButton}:hover & {
    transform: translateX(4px);
  }
`

const Highlight = styled.span`
  color: #ffd700;
`

export default PopupBanner
