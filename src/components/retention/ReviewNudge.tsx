import React from "react"

import { Link } from "gatsby"
import styled from "styled-components"

import { useReadingHistory } from "~/src/hooks/useReadingHistory"
import { trackEvent } from "~/src/utils/analytics"

const REVIEW_AFTER_MS = 2 * 24 * 60 * 60 * 1000

interface ReviewNudgeProps {
  /** Slug of the post currently being read (excluded from suggestions) */
  currentSlug: string
}

/**
 * Lightweight spaced-repetition nudge: suggests re-reading an expression
 * the visitor studied at least two days ago. Review is the natural
 * return-visit loop for a learning site.
 */
const ReviewNudge: React.FC<ReviewNudgeProps> = ({ currentSlug }) => {
  const { history, loaded } = useReadingHistory()
  const target = loaded
    ? history.find(
        item =>
          item.slug !== currentSlug &&
          Date.now() - item.visitedAt >= REVIEW_AFTER_MS,
      )
    : undefined

  if (!target) return

  return (
    <Panel aria-label="복습 추천">
      <Copy>
        <Label>
          <span aria-hidden="true">🔁</span> 복습 타임
        </Label>
        <Question>며칠 전에 본 표현이에요. 아직 기억나요?</Question>
      </Copy>
      <ReviewLink
        to={target.slug}
        onClick={() => trackEvent("review_nudge_click", { slug: target.slug })}
      >
        {target.title}
      </ReviewLink>
    </Panel>
  )
}

const Panel = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: var(--post-width);
  margin: var(--sizing-lg) auto 0;
  padding: var(--padding-md);
  border: 1px solid var(--color-gray-2);
  border-radius: var(--border-radius-md);
  background: var(--gradient-surface);
`

const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const Label = styled.p`
  color: var(--color-primary-strong);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-bold);
`

const Question = styled.p`
  color: var(--color-text-2);
  font-size: 0.9375rem;
  line-height: 1.5;
`

const ReviewLink = styled(Link)`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  max-width: 100%;
  padding: 0 18px;
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  background-color: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-semi-bold);
  line-height: 1.3;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`

export default ReviewNudge
