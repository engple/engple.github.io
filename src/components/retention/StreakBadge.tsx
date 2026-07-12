import React from "react"

import styled from "styled-components"

import { useStreak } from "~/src/hooks/useReadingHistory"

/**
 * Shows the consecutive-study-day streak once it reaches 2 days —
 * the habit loop that brings learners back tomorrow.
 */
const StreakBadge: React.FC = () => {
  const streak = useStreak()

  if (streak < 2) return

  return (
    <Badge aria-label={`${streak}일 연속 학습 중`}>
      <span aria-hidden="true">🔥</span> {streak}일 연속 학습 중
    </Badge>
  )
}

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  border-radius: 999px;
  background-color: var(--color-accent-soft);
  color: var(--color-text);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-bold);
  line-height: 1;
`

export default StreakBadge
