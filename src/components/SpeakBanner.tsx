import React from "react"

import styled, { keyframes } from "styled-components"

import speakLogoWhite from "../images/speak-logo-white.png"
import { getDaysLeft } from "../utils/promotion"

interface BannerProps {
  link: string
  onClose?: () => void
  eventDay?: Date // Optional prop for future events
}

const Banner: React.FC<BannerProps> = ({
  link,
  onClose = () => {},
  eventDay,
}) => {
  const daysLeft = getDaysLeft(eventDay)
  const handleBannerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.open(link, "_blank", "nofollow")
  }

  return (
    <BannerContainer>
      <Container onClick={handleBannerClick}>
        <LogoAndSlogan>
          <LogoWrapper>
            <img src={speakLogoWhite} alt="Speak Logo" />
          </LogoWrapper>
          <Slogan>
            <Prelude>
              <FireIcon>🔥</FireIcon>
              영어 말하기 어려우세요?
              {daysLeft !== undefined && daysLeft >= 0 && (
                <EventBadge>
                  {daysLeft === 0 ? "(오늘 마감)" : `(D-${daysLeft})`}
                </EventBadge>
              )}
            </Prelude>
            <div>
              <Title>
                <Highlight>60% 할인</Highlight>으로 AI와 영어 대화 연습하기
              </Title>
            </div>
          </Slogan>
        </LogoAndSlogan>
        <ButtonWrapper>
          <Button>더 알아보기</Button>
        </ButtonWrapper>
      </Container>
      <CloseButton
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          onClose()
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.6894 0.321198C13.2753 -0.0929086 12.6064 -0.0929086 12.1923 0.321198L7 5.50284L1.80774 0.31058C1.39363 -0.103527 0.724687 -0.103527 0.31058 0.31058C-0.103527 0.724687 -0.103527 1.39363 0.31058 1.80774L5.50284 7L0.31058 12.1923C-0.103527 12.6064 -0.103527 13.2753 0.31058 13.6894C0.724687 14.1035 1.39363 14.1035 1.80774 13.6894L7 8.49716L12.1923 13.6894C12.6064 14.1035 13.2753 14.1035 13.6894 13.6894C14.1035 13.2753 14.1035 12.6064 13.6894 12.1923L8.49716 7L13.6894 1.80774C14.0929 1.40425 14.0929 0.724687 13.6894 0.321198Z"
            fill="white"
          />
        </svg>
      </CloseButton>
    </BannerContainer>
  )
}

const BannerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
  background: #0b0c15;
  border: none;
  text-align: left;
  text-decoration: none;
  line-height: 1.2;
  z-index: 300;
  padding: 0.75rem var(--padding-sm);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    padding: 0.5rem var(--padding-sm);
  }
`

const Container = styled.div`
  display: flex;
  max-width: var(--max-width);
  margin: 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  z-index: 1;
  cursor: pointer;
  transition: opacity 0.2s ease;
  position: relative;
  padding-right: 2.5rem;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    align-items: center;
    gap: 0.75rem;
    padding-right: 2rem;
  }
`

const LogoAndSlogan = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--padding-sm);
  flex: 1;
  min-width: 0;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    width: 100%;
  }
`

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  img {
    object-fit: contain;
    height: 24px;
    width: auto;
  }
`

const Slogan = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const Prelude = styled.div`
  font-size: 0.9rem;
  color: white;
  transform-origin: center center;
  width: max-content;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 0.85rem;
  }
`

const EventBadge = styled.span`
  color: #ffd700;
  font-weight: 600;
`

const Title = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: white;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 0.95rem;
  }
`

const Highlight = styled.span`
  color: #ffd700;
  font-weight: 600;
`

const ButtonWrapper = styled.div``

const Button = styled.div`
  background: linear-gradient(135deg, #1c49ff, #0066cc);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(28, 73, 255, 0.3);
  flex-shrink: 0;
  font-size: 0.95rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(28, 73, 255, 0.4);
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    padding: 0.45rem 0.9rem;
    font-size: 0.9rem;
  }
`

const CloseButton = styled.button`
  cursor: pointer;
  padding: var(--padding-xs);
  background: none;
  border: none;
  position: absolute;
  right: var(--padding-sm);
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: white;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    right: var(--padding-xs);
    top: var(--padding-xs);
    transform: none;
  }
`

const fireAnimation = keyframes`
  0%, 100% {
    transform: scale(1) rotate(-3deg);
  }
  25% {
    transform: scale(1.1) rotate(3deg);
  }
  50% {
    transform: scale(1.05) rotate(-1deg);
  }
  75% {
    transform: scale(1.08) rotate(1deg);
  }
`

const FireIcon = styled.span`
  display: inline-block;
  animation: ${fireAnimation} 1s ease-in-out infinite;
  margin-right: 0.25rem;
`

export default Banner
