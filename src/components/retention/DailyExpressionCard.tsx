import React, { useEffect, useState } from "react"

import { Link } from "gatsby"
import styled from "styled-components"

import type Post from "~/src/types/Post"
import { trackEvent } from "~/src/utils/analytics"

interface DailyExpressionCardProps {
  posts: Post[]
}

/**
 * Deterministic daily pick from the given posts — gives visitors a fresh
 * "expression of the day" to come back for. Rendered after mount so the
 * pick follows the visitor's local date without hydration mismatch.
 */
const DailyExpressionCard: React.FC<DailyExpressionCardProps> = ({ posts }) => {
  const [pick, setPick] = useState<Post>()

  useEffect(() => {
    if (posts.length === 0) return

    let timeoutId: number | undefined

    const updatePick = () => {
      const localDay = getLocalDayNumber(new Date())
      setPick(posts[localDay % posts.length])
    }

    const scheduleNextMidnight = () => {
      const now = new Date()
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      )
      const delay = Math.max(nextMidnight.getTime() - now.getTime(), 1)

      timeoutId = window.setTimeout(() => {
        updatePick()
        scheduleNextMidnight()
      }, delay)
    }

    const syncWhenVisible = () => {
      if (document.visibilityState !== "visible") return

      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      updatePick()
      scheduleNextMidnight()
    }

    updatePick()
    scheduleNextMidnight()
    document.addEventListener("visibilitychange", syncWhenVisible)

    return () => {
      document.removeEventListener("visibilitychange", syncWhenVisible)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [posts])

  if (!pick?.slug) return

  return (
    <Card
      to={pick.slug}
      onClick={() => trackEvent("daily_expression_click", { slug: pick.slug! })}
    >
      <Eyebrow>
        <EyebrowIcon aria-hidden="true">📌</EyebrowIcon> 오늘의 표현
      </Eyebrow>
      <Title>{pick.title}</Title>
      <Action aria-hidden="true">
        1분이면 충분해요 <ActionArrow>→</ActionArrow>
      </Action>
    </Card>
  )
}

function getLocalDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  )
}

const ActionArrow = styled.span`
  display: inline-block;
  transition: transform 0.2s ease;
`

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--padding-md);
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, transparent);
  border-radius: 16px;
  background:
    linear-gradient(
      100deg,
      var(--color-primary-soft) 0%,
      transparent 55%,
      var(--color-accent-soft) 130%
    ),
    var(--color-card);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);

    ${ActionArrow} {
      transform: translateX(3px);
    }
  }
`

const Eyebrow = styled.span`
  color: var(--color-primary-strong);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-bold);
`

const EyebrowIcon = styled.span`
  margin-right: 2px;
`

const Title = styled.span`
  color: var(--color-text);
  font-size: 1.125rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.45;
`

const Action = styled.span`
  color: var(--color-primary-strong);
  font-size: 0.875rem;
  font-weight: var(--font-weight-semi-bold);
`

export default DailyExpressionCard
