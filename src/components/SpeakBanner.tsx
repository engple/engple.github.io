import React from "react"

import styled, { keyframes } from "styled-components"

import speakLogoWhite from "../images/speak-logo-white.png"

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
  // Calculate days left only if eventDay is provided
  const daysLeft = eventDay
    ? Math.max(
        0,
        Math.floor((eventDay.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : undefined

  return (
    <BannerLink href={link} target="_blank" rel="nofollow">
      <Container>
        <LogoAndSlogan>
          <LogoWrapper>
            <img src={speakLogoWhite} alt="Speak Logo" />
          </LogoWrapper>
          <Slogan>
            <Prelude>
              <Highlight>AI 영어회화 1위</Highlight> 스픽으로
              {daysLeft !== undefined && daysLeft >= 0 && (
                <EventBadge>
                  {daysLeft === 0 ? "(오늘 마감)" : `(D-${daysLeft})`}
                </EventBadge>
              )}
            </Prelude>
            <div>
              <Title>
                <Highlight>20분에 100문장</Highlight> 말하며 영어{" "}
                <Highlight>자신감</Highlight> 폭발시키자!
              </Title>
            </div>
          </Slogan>
        </LogoAndSlogan>
        <ButtonWrapper>
          <Button>바로 할인받기</Button>
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
    </BannerLink>
  )
}

const BannerLink = styled.a`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0b0c15;
  border: none;
  cursor: pointer;
  text-align: left;
  text-decoration: none;

  overflow: hidden;
  line-height: 1.25;
  z-index: 300;
  padding: var(--padding-sm);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
`

const Container = styled.div`
  display: flex;
  width: var(--max-width);
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  z-index: 1;
`

const LogoAndSlogan = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--padding-sm);
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
  gap: 0.5rem;
`

const Prelude = styled.div`
  font-size: 0.9rem;
  color: white;
  transform-origin: center center;
  width: max-content;
  animation: ${keyframes`
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-1deg); }
    75% { transform: rotate(1deg); } 
  `} 0.3s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const EventBadge = styled.span`
  color: #ffd700;
  font-weight: 600;
`

const Title = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: white;
`

const Highlight = styled.span`
  color: #ffd700;
  font-weight: 600;
`

const ButtonWrapper = styled.div``

const Button = styled.div`
  display: none;
  background: linear-gradient(135deg, #1c49ff, #0066cc);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  min-width: max-content;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(28, 73, 255, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(28, 73, 255, 0.4);
  }

  @media (min-width: ${({ theme }) => theme.device.md}) {
    display: block;
  }
`

const CloseButton = styled.button`
  cursor: pointer;
  padding: var(--padding-xs);
  background: none;
  border: none;

  @media (min-width: ${({ theme }) => theme.device.sm}) {
    position: absolute;
    right: var(--padding-xl);
    top: 50%;
    transform: translateY(-50%);
  }
`

export default Banner
