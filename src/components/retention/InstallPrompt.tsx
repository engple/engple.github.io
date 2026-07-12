import React, { useEffect, useState } from "react"

import styled, { css, keyframes } from "styled-components"

import { useExpiryKey } from "~/src/hooks/useExpiryKey"
import { useReadingHistory } from "~/src/hooks/useReadingHistory"
import { trackEvent } from "~/src/utils/analytics"

const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

/** Where the iOS Safari share button lives, which decides guide placement. */
type IOSPlacement = "iphone" | "ipad"

/**
 * Quiet add-to-home-screen prompt for returning visitors (has reading
 * history), dismissible for 30 days.
 *
 * - Android/Chromium: native install via beforeinstallprompt.
 * - iOS Safari (no install API): a visual guide anchored toward the share
 *   button — bottom-center with a bouncing down-arrow on iPhone, top-right
 *   with an up-arrow on iPad.
 */
const InstallPrompt: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent>()
  const [iosPlacement, setIosPlacement] = useState<IOSPlacement>()
  const [isHidden, setIsHidden] = useState(false)
  const { history, loaded } = useReadingHistory()
  const { isExpired, refresh } = useExpiryKey("pwa_install_dismissed", {
    ttl: DISMISS_TTL_MS,
  })

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  useEffect(() => {
    setIosPlacement(detectIOSPlacement())
  }, [])

  const isReturningVisitor = loaded && history.length > 0
  const isVisible =
    isReturningVisitor &&
    isExpired &&
    !isHidden &&
    (iosPlacement || installEvent)

  useEffect(() => {
    if (!isVisible) return

    trackEvent("pwa_install_prompt", {
      platform: iosPlacement ? "ios" : "android",
    })
  }, [isVisible, iosPlacement])

  if (!isVisible) return

  const handleDismiss = () => {
    refresh()
    setIsHidden(true)
  }

  if (iosPlacement) {
    return <IOSGuide placement={iosPlacement} onDismiss={handleDismiss} />
  }

  const handleInstall = async () => {
    if (!installEvent) return

    await installEvent.prompt()
    const choice = await installEvent.userChoice

    if (choice.outcome === "accepted") {
      trackEvent("pwa_install_accepted")
    }

    setIsHidden(true)
  }

  return (
    <Bar role="complementary" aria-label="앱 설치 안내">
      <Message>
        <span aria-hidden="true">📱</span> 잉플을 홈 화면에 추가하고 매일 한
        표현씩 배워보세요
      </Message>
      <Actions>
        <InstallButton type="button" onClick={handleInstall}>
          추가하기
        </InstallButton>
        <DismissButton type="button" onClick={handleDismiss}>
          닫기
        </DismissButton>
      </Actions>
    </Bar>
  )
}

interface IOSGuideProps {
  placement: IOSPlacement
  onDismiss: () => void
}

const IOSGuide: React.FC<IOSGuideProps> = ({ placement, onDismiss }) => {
  return (
    <GuideWrap
      $placement={placement}
      role="complementary"
      aria-label="앱 설치 안내"
    >
      {placement === "ipad" && (
        <GuideArrow $placement={placement} aria-hidden="true" />
      )}
      <GuideCard>
        <GuideHeader>
          <GuideTitle>잉플을 앱처럼 쓰세요</GuideTitle>
          <GuideClose
            type="button"
            aria-label="설치 안내 닫기"
            onClick={onDismiss}
          >
            ✕
          </GuideClose>
        </GuideHeader>
        <GuideSteps>
          <GuideStep>
            <StepIndex aria-hidden="true">1</StepIndex>
            <span>
              {placement === "iphone" ? "아래" : "우측 상단"}{" "}
              <ShareBadge aria-label="공유">
                <ShareIcon />
              </ShareBadge>{" "}
              버튼을 누르고
            </span>
          </GuideStep>
          <GuideStep>
            <StepIndex aria-hidden="true">2</StepIndex>
            <span>
              <strong>&lsquo;홈 화면에 추가&rsquo;</strong>를 선택하세요
            </span>
          </GuideStep>
        </GuideSteps>
      </GuideCard>
      {placement === "iphone" && (
        <GuideArrow $placement={placement} aria-hidden="true" />
      )}
    </GuideWrap>
  )
}

const ShareIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 15V3" />
    <path d="M8 7l4-4 4 4" />
    <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
  </svg>
)

/**
 * iOS detection: iPhone/iPod UA, iPad UA, or iPadOS masquerading as macOS
 * with touch. Skipped when already installed (standalone) or when running
 * in a non-Safari iOS browser / in-app webview, where the Add to Home
 * Screen flow differs or is unavailable.
 */
function detectIOSPlacement(): IOSPlacement | undefined {
  if (typeof window === "undefined") return undefined

  const ua = window.navigator.userAgent
  const isIPhone = /iPhone|iPod/.test(ua)
  const isIPad =
    /iPad/.test(ua) ||
    (ua.includes("Macintosh") && window.navigator.maxTouchPoints > 1)

  if (!isIPhone && !isIPad) return undefined

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)

  if (isStandalone) return undefined

  const isNonSafari =
    /crios|fxios|edgios|opios|whale|kakaotalk|naver|instagram|fban|fbav|line\//i.test(
      ua,
    )

  if (isNonSafari) return undefined

  return isIPad ? "ipad" : "iphone"
}

const bob = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(7px); }
`

const bobUp = keyframes`
  0%, 100% { transform: translateY(0) rotate(180deg); }
  50% { transform: translateY(-7px) rotate(180deg); }
`

const GuideWrap = styled.div<{ $placement: IOSPlacement }>`
  position: fixed;
  /* 테마 토글(z 100) 위로 — 가이드가 떠 있는 동안에는 카드가 우선 */
  z-index: 110;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  ${({ $placement }) =>
    $placement === "iphone"
      ? css`
          left: 50%;
          bottom: calc(10px + env(safe-area-inset-bottom, 0px));
          transform: translateX(-50%);
          width: min(21rem, calc(100vw - 32px));
        `
      : css`
          top: calc(10px + env(safe-area-inset-top, 0px));
          right: 16px;
          width: min(21rem, calc(100vw - 32px));
        `}
`

const GuideCard = styled.div`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--color-gray-2);
  border-radius: var(--border-radius-md);
  background-color: var(--color-card);
  box-shadow: var(--shadow-lg);
`

const GuideHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
`

const GuideTitle = styled.p`
  font-size: 0.9375rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
`

const GuideClose = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 999px;
  background: none;
  color: var(--color-text-3);
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    color: var(--color-text);
    background-color: var(--color-gray-1);
  }
`

const GuideSteps = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    margin: 0;
  }
`

const GuideStep = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-2);
  font-size: 0.875rem;
  line-height: 1.5;

  strong {
    color: var(--color-text);
    font-weight: var(--font-weight-semi-bold);
  }
`

const StepIndex = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 999px;
  background-color: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-size: 0.6875rem;
  font-weight: var(--font-weight-bold);
`

const ShareBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  margin: 0 1px;
  border-radius: 6px;
  background-color: var(--color-primary-soft);
  color: var(--color-primary-strong);
  vertical-align: -0.35em;
`

const GuideArrow = styled.span<{ $placement: IOSPlacement }>`
  display: block;
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 11px solid var(--color-primary);
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.18));
  animation: ${({ $placement }) => ($placement === "iphone" ? bob : bobUp)} 1.4s
    ease-in-out infinite;

  ${({ $placement }) =>
    $placement === "ipad" &&
    css`
      align-self: flex-end;
      margin-right: 28px;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Bar = styled.div`
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: min(26rem, calc(100vw - 96px));
  padding: 12px 16px;
  border: 1px solid var(--color-gray-2);
  border-radius: var(--border-radius-md);
  background-color: var(--color-card);
  box-shadow: var(--shadow-lg);
`

const Message = styled.p`
  color: var(--color-text-2);
  font-size: 0.8125rem;
  line-height: 1.5;
`

const Actions = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 6px;
`

const InstallButton = styled.button`
  min-height: 2.25rem;
  padding: 0 12px;
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  background-color: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-semi-bold);
  cursor: pointer;
`

const DismissButton = styled.button`
  min-height: 2.25rem;
  padding: 0 10px;
  border: none;
  border-radius: 999px;
  background: none;
  color: var(--color-text-3);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;

  &:hover {
    color: var(--color-text);
  }
`

export default InstallPrompt
