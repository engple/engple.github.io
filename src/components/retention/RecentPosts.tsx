import React from "react"

import { Link } from "gatsby"
import styled from "styled-components"

import { useReadingHistory } from "~/src/hooks/useReadingHistory"
import { trackEvent } from "~/src/utils/analytics"

const MAX_ITEMS = 3

/**
 * "Continue where you left off" — surfaces the visitor's recently read
 * posts on the home page so returning users re-enter content in one tap.
 */
const RecentPosts: React.FC = () => {
  const { history } = useReadingHistory()
  const items = history.slice(0, MAX_ITEMS)

  if (items.length === 0) return

  return (
    <Section aria-label="최근 본 글">
      <Label>보던 글 이어보기</Label>
      <List>
        {items.map(item => (
          <Item key={item.slug}>
            <ItemLink
              to={item.slug}
              onClick={() =>
                trackEvent("recent_post_click", { slug: item.slug })
              }
            >
              {item.title}
            </ItemLink>
          </Item>
        ))}
      </List>
    </Section>
  )
}

const Section = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.p`
  color: var(--color-text-3);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-bold);
`

const List = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    margin: 0;
  }
`

const Item = styled.li`
  min-width: 0;
`

const ItemLink = styled(Link)`
  display: inline-block;
  max-width: 24rem;
  padding: 8px 14px;
  border: 1px solid var(--color-gray-2);
  border-radius: 999px;
  background-color: var(--color-card);
  color: var(--color-text-2);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: var(--color-gray-3);
    color: var(--color-text);
    box-shadow: var(--shadow-sm);
  }
`

export default RecentPosts
