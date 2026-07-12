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

    const daysSinceEpoch = Math.floor(Date.now() / 86_400_000)
    setPick(posts[daysSinceEpoch % posts.length])
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
      <Action aria-hidden="true">지금 배워보기 →</Action>
    </Card>
  )
}

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--padding-md);
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius-md);
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
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`

const Eyebrow = styled.span`
  color: var(--color-primary-strong);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
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
