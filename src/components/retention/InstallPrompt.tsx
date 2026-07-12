import React, { useEffect, useState } from "react"

import styled from "styled-components"

import { useExpiryKey } from "~/src/hooks/useExpiryKey"
import { useReadingHistory } from "~/src/hooks/useReadingHistory"
import { trackEvent } from "~/src/utils/analytics"

const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

/**
 * Quiet add-to-home-screen prompt, shown only to returning visitors
 * (has reading history) on browsers that fire beforeinstallprompt.
 * Dismissal is remembered for 30 days.
 */
const InstallPrompt: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent>()
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

  const isReturningVisitor = loaded && history.length > 0

  if (!installEvent || !isReturningVisitor || !isExpired) return

  const handleInstall = async () => {
    trackEvent("pwa_install_prompt")
    await installEvent.prompt()
    const choice = await installEvent.userChoice

    if (choice.outcome === "accepted") {
      trackEvent("pwa_install_accepted")
    }

    setInstallEvent()
  }

  const handleDismiss = () => {
    refresh()
    setInstallEvent()
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
