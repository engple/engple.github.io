import React, { useEffect, useState } from "react"

import styled, { css } from "styled-components"

import { useExpiryKey } from "~/src/hooks/useExpiryKey"
import { useReadingHistory } from "~/src/hooks/useReadingHistory"
import { trackEvent } from "~/src/utils/analytics"

const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

let deferredInstallPrompt: BeforeInstallPromptEvent | undefined
const installPromptSubscribers = new Set<
  (event: BeforeInstallPromptEvent | undefined) => void
>()

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", captureInstallPrompt)
}

/** Where the iOS Safari share button lives, which decides guide placement. */
type IOSPlacement = "iphone" | "ipad"

/**
 * Quiet add-to-home-screen prompt for returning visitors (has reading
 * history), dismissible for 30 days.
 *
 * - Android/Chromium: native install via beforeinstallprompt.
 * - iOS Safari (no install API): a compact visual guide anchored toward the
 *   share button — bottom-right on iPhone and top-right on iPad.
 */
const InstallPrompt: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<
    BeforeInstallPromptEvent | undefined
  >(deferredInstallPrompt)
  const [iosPlacement, setIosPlacement] = useState<IOSPlacement>()
  const [isHidden, setIsHidden] = useState(false)
  const { history, loaded } = useReadingHistory()
  const { isExpired, refresh } = useExpiryKey("pwa_install_dismissed", {
    ttl: DISMISS_TTL_MS,
  })

  useEffect(() => {
    const syncInstallPrompt = (event: BeforeInstallPromptEvent | undefined) => {
      setInstallEvent(event)
    }

    installPromptSubscribers.add(syncInstallPrompt)
    syncInstallPrompt(deferredInstallPrompt)

    return () => {
      installPromptSubscribers.delete(syncInstallPrompt)
    }
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
    clearInstallPrompt()
    setIsHidden(true)
  }

  if (iosPlacement) {
    return <IOSGuide placement={iosPlacement} onDismiss={handleDismiss} />
  }

  const handleInstall = async () => {
    if (!installEvent) return

    try {
      await installEvent.prompt()
      const choice = await installEvent.userChoice

      if (choice.outcome === "accepted") {
        trackEvent("pwa_install_accepted")
      } else {
        refresh()
      }
    } catch {
      // The browser may reject the prompt when its install state changes.
    } finally {
      clearInstallPrompt()
      setIsHidden(true)
    }
  }

  return (
    <Bar role="complementary" aria-label="앱 설치 안내">
      <Message>
        <span aria-hidden="true">📱</span> 홈 화면에 추가하면 오늘의 표현을
        앱처럼 바로 열어볼 수 있어요
      </Message>
      <Actions>
        <InstallButton type="button" onClick={handleInstall}>
          홈에 추가
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
      <GuideCard $placement={placement}>
        <GuideHeader>
          <GuideTitle>매일 영어 공부, 홈 화면에서 바로 시작하세요</GuideTitle>
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
            {placement === "iphone" ? (
              <span>
                오른쪽 하단의{" "}
                <ActionBadge aria-label="더보기">
                  <MoreIcon />
                </ActionBadge>{" "}
                더보기를 누르세요
              </span>
            ) : (
              <span>
                상단의{" "}
                <ActionBadge aria-label="공유">
                  <ShareIcon />
                </ActionBadge>{" "}
                공유 버튼을 누르세요
              </span>
            )}
          </GuideStep>
          {placement === "iphone" && (
            <GuideStep>
              <StepIndex aria-hidden="true">2</StepIndex>
              <span>
                <ActionBadge aria-label="공유">
                  <ShareIcon />
                </ActionBadge>{" "}
                공유 버튼을 누르세요
              </span>
            </GuideStep>
          )}
          <GuideStep>
            <StepIndex aria-hidden="true">
              {placement === "iphone" ? "3" : "2"}
            </StepIndex>
            <span>
              <strong>&lsquo;홈 화면에 추가&rsquo;</strong>를 선택하세요
            </span>
          </GuideStep>
        </GuideSteps>
      </GuideCard>
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

const MoreIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="5" cy="12" r="1.75" />
    <circle cx="12" cy="12" r="1.75" />
    <circle cx="19" cy="12" r="1.75" />
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

const GuideWrap = styled.div<{ $placement: IOSPlacement }>`
  position: fixed;
  /* 테마 토글(z 100) 위로 — 가이드가 떠 있는 동안에는 카드가 우선 */
  z-index: 110;

  ${({ $placement }) =>
    $placement === "iphone"
      ? css`
          right: 12px;
          bottom: calc(18px + env(safe-area-inset-bottom, 0px));
          width: min(20rem, calc(100vw - 24px));
        `
      : css`
          top: calc(12px + env(safe-area-inset-top, 0px));
          right: 12px;
          width: min(20rem, calc(100vw - 24px));
        `}
`

const GuideCard = styled.div<{ $placement: IOSPlacement }>`
  position: relative;
  width: 100%;
  padding: 10px 12px 12px;
  border: 1px solid var(--color-gray-2);
  border-radius: 16px;
  background-color: var(--color-card);
  box-shadow: var(--shadow-lg);

  &::after {
    content: "";
    position: absolute;
    right: 24px;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;

    ${({ $placement }) =>
      $placement === "iphone"
        ? css`
            bottom: -11px;
            border-top: 12px solid var(--color-card);
          `
        : css`
            top: -11px;
            border-bottom: 12px solid var(--color-card);
          `}
`

const GuideHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
`

const GuideTitle = styled.p`
  font-size: 0.875rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  color: var(--color-text);
`

const GuideClose = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
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
  gap: 5px;
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
  line-height: 1.35;

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

const ActionBadge = styled.span`
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
  min-height: 2.75rem;
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
  min-height: 2.75rem;
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

function captureInstallPrompt(event: Event): void {
  event.preventDefault()
  deferredInstallPrompt = event as BeforeInstallPromptEvent

  for (const subscriber of installPromptSubscribers) {
    subscriber(deferredInstallPrompt)
  }
}

function clearInstallPrompt(): void {
  deferredInstallPrompt = undefined

  for (const subscriber of installPromptSubscribers) {
    subscriber(deferredInstallPrompt)
  }
}
